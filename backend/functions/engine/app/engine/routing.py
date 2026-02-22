from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

try:
    from scipy.optimize import linear_sum_assignment  # type: ignore
except Exception:  # pragma: no cover - fallback when scipy isn't available
    linear_sum_assignment = None

from app.config import AppConfig
from app.utils.geo import haversine_km


@dataclass(frozen=True)
class Depot:
    name: str
    lat: float
    lon: float


DEFAULT_DEPOTS = [
    Depot("McClellan Air Tanker Base", 38.67, -121.40),
    Depot("Moffett Federal Airfield", 37.41, -122.05),
    Depot("Ukiah Airport", 39.13, -123.20),
    Depot("Fresno Yosemite Intl", 36.77, -119.72),
    Depot("Bakersfield Meadows", 35.43, -119.05),
]


def _polygon_centroid(coords: List[List[float]]) -> Tuple[float, float]:
    if len(coords) > 1 and coords[0] == coords[-1]:
        coords = coords[:-1]
    if not coords:
        return 0.0, 0.0
    lon_sum = sum(pt[0] for pt in coords)
    lat_sum = sum(pt[1] for pt in coords)
    count = len(coords)
    return lat_sum / count, lon_sum / count


def _select_top_threats(threats: Dict, top_n: int) -> List[Dict]:
    features = threats.get("features", [])
    return features[:top_n]


def _prepare_drones(drone_count: int, depots: List[Depot]) -> List[Tuple[str, Depot]]:
    drones = []
    if not depots:
        return drones
    for idx in range(drone_count):
        depot = depots[idx % len(depots)]
        drones.append((f"drone-{idx + 1}", depot))
    return drones


def _assign_drones(costs: List[List[float]]) -> List[Tuple[int, int]]:
    if not costs:
        return []
    if linear_sum_assignment is None:
        # Fallback: greedy assignment if scipy is unavailable.
        assignments = []
        used_cols = set()
        for i, row in enumerate(costs):
            best_j = None
            best_cost = None
            for j, cost in enumerate(row):
                if j in used_cols:
                    continue
                if best_cost is None or cost < best_cost:
                    best_cost = cost
                    best_j = j
            if best_j is not None:
                used_cols.add(best_j)
                assignments.append((i, best_j))
        return assignments

    row_ind, col_ind = linear_sum_assignment(costs)
    return list(zip(row_ind.tolist(), col_ind.tolist()))


def plan_routes(
    threats: Dict,
    config: AppConfig,
    top_n: int = 20,
    drone_count: int = 5,
    speed_kmh: float = 120.0,
    range_km: float = 200.0,
    depots: Optional[List[Depot]] = None,
) -> Dict:
    depots = depots or DEFAULT_DEPOTS
    drones = _prepare_drones(drone_count, depots)

    if not drones:
        return {"type": "FeatureCollection", "features": []}

    top_threats = _select_top_threats(threats, top_n)
    if not top_threats:
        return {"type": "FeatureCollection", "features": []}

    targets = []
    for feature in top_threats:
        coords = feature.get("geometry", {}).get("coordinates", [])
        if not coords:
            continue
        ring = coords[0]
        centroid_lat, centroid_lon = _polygon_centroid(ring)
        props = feature.get("properties", {})
        targets.append(
            {
                "cell_id": props.get("cell_id"),
                "severity": props.get("severity_score"),
                "priority": props.get("priority_score"),
                "centroid_lat": centroid_lat,
                "centroid_lon": centroid_lon,
            }
        )

    if not targets:
        return {"type": "FeatureCollection", "features": []}

    costs = []
    distances = []
    for _, depot in drones:
        row = []
        dist_row = []
        for target in targets:
            dist = haversine_km(depot.lat, depot.lon, target["centroid_lat"], target["centroid_lon"])
            dist_row.append(dist)
            if dist > range_km:
                row.append(1e9 + dist)
            else:
                row.append(dist)
        costs.append(row)
        distances.append(dist_row)

    assignments = _assign_drones(costs)

    features = []
    for drone_idx, target_idx in assignments:
        drone_id, depot = drones[drone_idx]
        target = targets[target_idx]
        dist_km = distances[drone_idx][target_idx]
        if dist_km > range_km:
            continue
        eta_minutes = (dist_km / speed_kmh) * 60.0
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [depot.lon, depot.lat],
                    [target["centroid_lon"], target["centroid_lat"]],
                ],
            },
            "properties": {
                "drone_id": drone_id,
                "depot_name": depot.name,
                "target_cell_id": target["cell_id"],
                "distance_km": round(dist_km, 2),
                "eta_minutes": round(eta_minutes, 1),
                "threat_severity": target["severity"],
                "threat_priority": target["priority"],
            },
        }
        features.append(feature)

    features.sort(key=lambda f: f["properties"]["eta_minutes"])
    return {"type": "FeatureCollection", "features": features}
