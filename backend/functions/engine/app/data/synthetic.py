import math
import random
from datetime import datetime
from typing import List

from app.data.base import BaseProvider
from app.models import BBox, StormCell
from app.utils.geo import Grid, clamp, haversine_km


FIRE_SEED_ZONES = [
    (39.5, -122.9),  # Mendocino National Forest
    (37.4, -121.5),  # SCU / Diablo Range
    (37.1, -122.1),  # Santa Cruz Mountains
]

URBAN_CENTERS = [
    (38.58, -121.49),  # Sacramento
    (37.77, -122.42),  # San Francisco
    (37.34, -121.89),  # San Jose
]


class SyntheticProvider(BaseProvider):
    def __init__(self, seed: int = 42) -> None:
        self.seed = seed

    def _rng(self, bbox: BBox, when: datetime) -> random.Random:
        seed = (
            self.seed
            + int(when.timestamp())
            + int(bbox.min_lat * 100)
            + int(bbox.min_lon * 100)
        )
        return random.Random(seed)

    def _field(self, grid: Grid, when: datetime, base: float, amp: float, freq: float, noise: float) -> List[List[float]]:
        rng = self._rng(grid.bbox, when)
        values = []
        for lat in grid.lats:
            row = []
            for lon in grid.lons:
                pattern = (math.sin(lat * freq) + math.cos(lon * freq)) / 2
                value = base + amp * pattern + rng.uniform(-noise, noise)
                row.append(value)
            values.append(row)
        return values

    def _gaussian_bump_field(self, grid: Grid, centers: List[tuple], sigma_km: float) -> List[List[float]]:
        if not centers:
            return [[0.0 for _ in grid.lons] for _ in grid.lats]

        values = []
        for lat in grid.lats:
            row = []
            for lon in grid.lons:
                bump = 0.0
                for c_lat, c_lon in centers:
                    dist = haversine_km(lat, lon, c_lat, c_lon)
                    bump += math.exp(-((dist ** 2) / (2 * (sigma_km ** 2))))
                bump /= len(centers)
                row.append(bump)
            values.append(row)
        return values

    def _fire_bump(self, grid: Grid) -> List[List[float]]:
        return self._gaussian_bump_field(grid, FIRE_SEED_ZONES, sigma_km=40.0)

    def get_ndvi(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        values = self._field(grid, when, base=0.6, amp=0.25, freq=0.5, noise=0.08)
        bump = self._fire_bump(grid)
        out = []
        for r_idx, row in enumerate(values):
            out_row = []
            for c_idx, v in enumerate(row):
                out_row.append(clamp(v + bump[r_idx][c_idx] * 0.25, 0.0, 1.0))
            out.append(out_row)
        return out

    def get_slope(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        values = self._field(grid, when, base=20.0, amp=15.0, freq=0.8, noise=4.0)
        bump = self._fire_bump(grid)
        out = []
        for r_idx, row in enumerate(values):
            out_row = []
            for c_idx, v in enumerate(row):
                out_row.append(clamp(abs(v) + bump[r_idx][c_idx] * 15.0, 0.0, 60.0))
            out.append(out_row)
        return out

    def get_fuel_type(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        ndvi = self.get_ndvi(bbox, grid, when)
        rng = self._rng(bbox, when)
        bump = self._fire_bump(grid)
        fuel = []
        for r_idx, row in enumerate(ndvi):
            fuel_row = []
            for c_idx, v in enumerate(row):
                combustibility = clamp(
                    0.4 + 0.5 * v + bump[r_idx][c_idx] * 0.2 + rng.uniform(-0.07, 0.07),
                    0.0,
                    1.0,
                )
                fuel_row.append(combustibility)
            fuel.append(fuel_row)
        return fuel

    def get_cape(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        values = self._field(grid, when, base=800.0, amp=1200.0, freq=0.6, noise=200.0)
        return [[clamp(v, 0.0, 3000.0) for v in row] for row in values]

    def get_dewpoint_depression(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        ndvi = self.get_ndvi(bbox, grid, when)
        rng = self._rng(bbox, when)
        dep = []
        for row in ndvi:
            dep_row = []
            for v in row:
                value = clamp(5.0 + 20.0 * v + rng.uniform(-2.0, 2.0), 0.0, 30.0)
                dep_row.append(value)
            dep.append(dep_row)
        return dep

    def get_cloud_base_height(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        dep = self.get_dewpoint_depression(bbox, grid, when)
        rng = self._rng(bbox, when)
        cbh = []
        for row in dep:
            cbh_row = []
            for v in row:
                value = clamp(1.0 + (v / 30.0) * 3.5 + rng.uniform(-0.3, 0.3), 0.5, 5.0)
                cbh_row.append(value)
            cbh.append(cbh_row)
        return cbh

    def get_low_level_rh(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        ndvi = self.get_ndvi(bbox, grid, when)
        rng = self._rng(bbox, when)
        rh = []
        for row in ndvi:
            rh_row = []
            for v in row:
                value = clamp(80.0 - 50.0 * v + rng.uniform(-5.0, 5.0), 10.0, 100.0)
                rh_row.append(value)
            rh.append(rh_row)
        return rh

    def get_precip_efficiency(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        ndvi = self.get_ndvi(bbox, grid, when)
        rng = self._rng(bbox, when)
        eff = []
        for row in ndvi:
            eff_row = []
            for v in row:
                value = clamp(0.7 - 0.4 * v + rng.uniform(-0.05, 0.05), 0.05, 0.9)
                eff_row.append(value)
            eff.append(eff_row)
        return eff

    def _city_centers(self, bbox: BBox, when: datetime, count: int) -> List[tuple]:
        centers = [
            (lat, lon)
            for lat, lon in URBAN_CENTERS
            if bbox.min_lat <= lat <= bbox.max_lat and bbox.min_lon <= lon <= bbox.max_lon
        ]
        if centers:
            return centers
        return [((bbox.min_lat + bbox.max_lat) / 2, (bbox.min_lon + bbox.max_lon) / 2)]

    def get_population_proximity(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        centers = self._city_centers(bbox, when, count=4)
        values = []
        for lat in grid.lats:
            row = []
            for lon in grid.lons:
                scores = []
                for c_lat, c_lon in centers:
                    dist = haversine_km(lat, lon, c_lat, c_lon)
                    scores.append(math.exp(-dist / 60.0))
                row.append(clamp(sum(scores) / len(scores), 0.0, 1.0))
            values.append(row)
        return values

    def get_infrastructure_density(self, bbox: BBox, grid: Grid, when: datetime) -> List[List[float]]:
        centers = self._city_centers(bbox, when, count=3)
        values = []
        for lat in grid.lats:
            row = []
            for lon in grid.lons:
                scores = []
                for c_lat, c_lon in centers:
                    dist = haversine_km(lat, lon, c_lat, c_lon)
                    scores.append(math.exp(-dist / 40.0))
                row.append(clamp(sum(scores) / len(scores), 0.0, 1.0))
            values.append(row)
        return values

    def get_storm_cells(self, bbox: BBox, when: datetime) -> List[StormCell]:
        rng = self._rng(bbox, when)
        cell_count = rng.randint(5, 10)
        lat_min = bbox.min_lat
        lat_max = bbox.min_lat + (bbox.max_lat - bbox.min_lat) / 3
        cells = []
        for idx in range(cell_count):
            center_lat = rng.uniform(lat_min + 0.1, lat_max - 0.1)
            center_lon = rng.uniform(bbox.min_lon + 0.3, bbox.max_lon - 0.3)
            radius_km = rng.uniform(30.0, 80.0)
            speed_kmh = rng.uniform(15.0, 60.0)
            bearing_deg = rng.uniform(200.0, 280.0)
            cells.append(
                StormCell(
                    id=f"cell-{idx}",
                    center_lat=center_lat,
                    center_lon=center_lon,
                    radius_km=radius_km,
                    speed_kmh=speed_kmh,
                    bearing_deg=bearing_deg,
                )
            )
        return cells
