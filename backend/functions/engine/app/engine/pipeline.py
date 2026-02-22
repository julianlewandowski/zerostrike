from datetime import datetime, timedelta
from typing import Dict, List, Tuple

from app.config import AppConfig
from app.data import get_provider
from app.engine.atmospheric import score_atmospheric
from app.engine.consequence import score_consequence
from app.engine.collision import detect_collisions
from app.engine.fuel import score_fuel
from app.models import BBox, StormCell
from app.utils.geo import Grid, generate_grid
from app.utils.time import to_iso


def _require(field, name: str):
    if field is None:
        raise ValueError(f"{name} unavailable for selected data_mode")
    return field


def compute_layers(
    bbox: BBox,
    when: datetime,
    data_mode: str,
    config: AppConfig,
) -> Tuple[Grid, List[List[float]], List[List[float]], List[List[float]], List[StormCell]]:
    provider = get_provider(data_mode)
    grid = generate_grid(bbox, config.grid_resolution_deg)

    ndvi = _require(provider.get_ndvi(bbox, grid, when), "ndvi")
    slope = _require(provider.get_slope(bbox, grid, when), "slope")
    fuel_type = _require(provider.get_fuel_type(bbox, grid, when), "fuel_type")

    cape = _require(provider.get_cape(bbox, grid, when), "cape")
    dpd = _require(provider.get_dewpoint_depression(bbox, grid, when), "dewpoint_depression")
    cbh = _require(provider.get_cloud_base_height(bbox, grid, when), "cloud_base_height")
    rh = _require(provider.get_low_level_rh(bbox, grid, when), "low_level_rh")
    precip_eff = _require(provider.get_precip_efficiency(bbox, grid, when), "precip_efficiency")

    population = _require(provider.get_population_proximity(bbox, grid, when), "population_proximity")
    infrastructure = _require(provider.get_infrastructure_density(bbox, grid, when), "infrastructure_density")

    storm_cells = _require(provider.get_storm_cells(bbox, when), "storm_cells")

    fuel_score = score_fuel(ndvi, slope, fuel_type, config)
    atmo_score = score_atmospheric(cape, dpd, cbh, rh, precip_eff, config)
    consequence_weight = score_consequence(population, infrastructure, config)

    return grid, fuel_score, atmo_score, consequence_weight, storm_cells


def compute_threats(
    bbox: BBox,
    when: datetime,
    data_mode: str,
    config: AppConfig,
    threshold: float,
) -> Dict:
    grid, fuel_score, atmo_score, consequence_weight, storm_cells = compute_layers(bbox, when, data_mode, config)
    return detect_collisions(grid, fuel_score, atmo_score, consequence_weight, storm_cells, config, threshold)


def compute_simulation(
    bbox: BBox,
    start: datetime,
    end: datetime,
    data_mode: str,
    config: AppConfig,
    threshold: float,
    step_hours: int,
) -> Dict:
    if end < start:
        raise ValueError("end_time must be after start_time")
    if step_hours <= 0:
        raise ValueError("step_hours must be positive")

    features_by_cell: Dict[str, Dict] = {}
    current = start
    while current <= end:
        collection = compute_threats(bbox, current, data_mode, config, threshold)
        timestamp = to_iso(current)

        for feature in collection.get("features", []):
            props = feature.get("properties", {})
            props["timestamp"] = timestamp
            feature["properties"] = props

            cell_id = props.get("cell_id")
            if not cell_id:
                continue

            existing = features_by_cell.get(cell_id)
            if existing is None:
                features_by_cell[cell_id] = feature
                continue

            new_score = props.get("priority_score", 0.0)
            old_score = existing.get("properties", {}).get("priority_score", 0.0)
            if new_score > old_score:
                features_by_cell[cell_id] = feature
            elif new_score == old_score:
                old_ts = existing.get("properties", {}).get("timestamp", "")
                if timestamp < old_ts:
                    features_by_cell[cell_id] = feature

        current = current + timedelta(hours=step_hours)

    features = list(features_by_cell.values())
    features.sort(key=lambda f: f.get("properties", {}).get("priority_score", 0.0), reverse=True)
    return {"type": "FeatureCollection", "features": features}
