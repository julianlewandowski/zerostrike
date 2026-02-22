import math
from typing import Dict, List

from app.config import AppConfig
from app.models import StormCell
from app.utils.geo import (
    CALIFORNIA_LAND_POLYGON,
    Grid,
    cell_polygon,
    grid_cell_id,
    haversine_km,
    destination_point,
    point_in_polygon,
)


def priority_score(severity: float, time_to_collision_hours: float) -> float:
    return severity / math.sqrt(max(time_to_collision_hours, 0.25))


def priority_label(score: float, config: AppConfig) -> str:
    if score >= config.priority_critical:
        return "critical"
    if score >= config.priority_high:
        return "high"
    if score >= config.priority_medium:
        return "medium"
    return "low"


def detect_collisions(
    grid: Grid,
    fuel_score: List[List[float]],
    atmo_score: List[List[float]],
    consequence_weight: List[List[float]],
    storm_cells: List[StormCell],
    config: AppConfig,
    threshold: float,
) -> Dict:
    rows, cols = grid.rows, grid.cols

    severity = []
    for r in range(rows):
        row = []
        for c in range(cols):
            value = (
                config.fuel_layer_weight * fuel_score[r][c]
                + config.atmospheric_layer_weight * atmo_score[r][c]
                + config.consequence_layer_weight * consequence_weight[r][c]
            )
            row.append(value)
        severity.append(row)

    earliest = [[None for _ in range(cols)] for _ in range(rows)]

    for hour in range(1, config.horizon_hours + 1):
        projected = []
        for cell in storm_cells:
            distance_km = cell.speed_kmh * hour
            proj_lat, proj_lon = destination_point(cell.center_lat, cell.center_lon, cell.bearing_deg, distance_km)
            projected.append((proj_lat, proj_lon, cell.radius_km))

        for r, lat in enumerate(grid.lats):
            for c, lon in enumerate(grid.lons):
                if earliest[r][c] is not None:
                    continue
                if severity[r][c] < threshold:
                    continue
                for p_lat, p_lon, radius in projected:
                    if haversine_km(lat, lon, p_lat, p_lon) <= radius:
                        earliest[r][c] = hour
                        break

    features = []
    for r, lat in enumerate(grid.lats):
        for c, lon in enumerate(grid.lons):
            time_to_collision = earliest[r][c]
            if time_to_collision is None:
                continue

            sev = severity[r][c]
            if not point_in_polygon(lon, lat, CALIFORNIA_LAND_POLYGON):
                continue

            polygon = cell_polygon(lon, lat, grid.resolution_deg)
            if not all(point_in_polygon(p_lon, p_lat, CALIFORNIA_LAND_POLYGON) for p_lon, p_lat in polygon):
                continue

            prio_score = priority_score(sev, time_to_collision)
            label = priority_label(prio_score, config)
            if consequence_weight[r][c] < 0.05:
                label = "low"
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [polygon],
                },
                "properties": {
                    "cell_id": grid_cell_id(r, c),
                    "severity_score": round(sev, 4),
                    "priority_score": round(prio_score, 4),
                    "time_to_collision_hours": time_to_collision,
                    "response_priority": label,
                    "fuel_score": round(fuel_score[r][c], 4),
                    "atmo_score": round(atmo_score[r][c], 4),
                    "consequence_weight": round(consequence_weight[r][c], 4),
                    "forecast_hour": time_to_collision,
                },
            }
            features.append(feature)

    features.sort(key=lambda f: f["properties"]["priority_score"], reverse=True)

    return {"type": "FeatureCollection", "features": features}
