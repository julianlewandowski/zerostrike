import math
from dataclasses import dataclass
from typing import List, Tuple

from app.models import BBox

EARTH_RADIUS_KM = 6371.0

# Rough California land polygon to exclude obvious Pacific Ocean cells.
# Coordinates are (lon, lat) and intentionally coarse for demo filtering.
CALIFORNIA_LAND_POLYGON = [
    (-124.4, 42.0),
    (-124.3, 41.0),
    (-124.1, 40.0),
    (-123.8, 39.0),
    (-123.5, 38.0),
    (-123.0, 37.0),
    (-122.6, 36.0),
    (-122.3, 35.0),
    (-121.8, 34.5),
    (-121.3, 34.0),
    (-120.9, 33.5),
    (-120.6, 33.0),
    (-117.5, 32.7),
    (-114.6, 32.7),
    (-114.6, 42.0),
    (-124.4, 42.0),
]


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def point_in_polygon(lon: float, lat: float, polygon: List[Tuple[float, float]]) -> bool:
    inside = False
    n = len(polygon)
    if n < 3:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        intersects = ((yi > lat) != (yj > lat)) and (
            lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi
        )
        if intersects:
            inside = not inside
        j = i
    return inside


def destination_point(lat: float, lon: float, bearing_deg: float, distance_km: float) -> Tuple[float, float]:
    bearing = math.radians(bearing_deg)
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)

    angular_distance = distance_km / EARTH_RADIUS_KM

    dest_lat = math.asin(
        math.sin(lat_rad) * math.cos(angular_distance)
        + math.cos(lat_rad) * math.sin(angular_distance) * math.cos(bearing)
    )
    dest_lon = lon_rad + math.atan2(
        math.sin(bearing) * math.sin(angular_distance) * math.cos(lat_rad),
        math.cos(angular_distance) - math.sin(lat_rad) * math.sin(dest_lat),
    )

    return math.degrees(dest_lat), math.degrees(dest_lon)


@dataclass
class Grid:
    bbox: BBox
    resolution_deg: float
    lats: List[float]
    lons: List[float]
    rows: int
    cols: int


def generate_grid(bbox: BBox, resolution_deg: float) -> Grid:
    lat_span = bbox.max_lat - bbox.min_lat
    lon_span = bbox.max_lon - bbox.min_lon

    rows = max(1, int(lat_span / resolution_deg))
    cols = max(1, int(lon_span / resolution_deg))

    lats = [bbox.min_lat + resolution_deg * (i + 0.5) for i in range(rows)]
    lons = [bbox.min_lon + resolution_deg * (j + 0.5) for j in range(cols)]

    return Grid(bbox=bbox, resolution_deg=resolution_deg, lats=lats, lons=lons, rows=rows, cols=cols)


def cell_polygon(lon: float, lat: float, resolution_deg: float) -> List[List[float]]:
    half = resolution_deg / 2
    return [
        [lon - half, lat - half],
        [lon + half, lat - half],
        [lon + half, lat + half],
        [lon - half, lat + half],
        [lon - half, lat - half],
    ]


def grid_cell_id(row: int, col: int) -> str:
    return f"r{row}c{col}"
