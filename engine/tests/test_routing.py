import asyncio

import httpx

from app.config import AppConfig
from app.main import app
from app.utils.geo import haversine_km


def _route_distance(coords):
    if len(coords) < 2:
        return 0.0
    (lon1, lat1), (lon2, lat2) = coords[0], coords[-1]
    return haversine_km(lat1, lon1, lat2, lon2)


async def _get_routes():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/routes")
        return response


def test_routes_valid():
    response = asyncio.run(_get_routes())
    assert response.status_code == 200
    data = response.json()
    assert data.get("type") == "FeatureCollection"

    features = data.get("features", [])
    assert len(features) > 0

    config = AppConfig()

    by_drone = {}
    for feature in features:
        geometry = feature.get("geometry", {})
        assert geometry.get("type") == "LineString"
        coords = geometry.get("coordinates", [])
        assert len(coords) >= 2

        props = feature.get("properties", {})
        distance_km = props.get("distance_km")
        eta_minutes = props.get("eta_minutes")
        assert distance_km is not None
        assert eta_minutes is not None

        computed_dist = _route_distance(coords)
        assert computed_dist <= config.routing_range_km + 1e-3
        assert abs(distance_km - round(computed_dist, 2)) <= 0.05

        expected_eta = (computed_dist / config.routing_speed_kmh) * 60.0
        assert abs(eta_minutes - round(expected_eta, 1)) <= 0.2

        drone_id = props.get("drone_id")
        by_drone.setdefault(drone_id, []).append(coords)

    # Ensure no drone has assignments that exceed its total range if flown in sequence.
    for drone_id, routes in by_drone.items():
        total_dist = 0.0
        for coords in routes:
            total_dist += _route_distance(coords)
        assert total_dist <= config.routing_range_km + 1e-3
