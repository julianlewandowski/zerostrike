import asyncio

import httpx

from app.config import DEFAULT_BBOX, DEFAULT_END, DEFAULT_START
from app.main import app


def _within_bbox(lon: float, lat: float) -> bool:
    return DEFAULT_BBOX[0] <= lon <= DEFAULT_BBOX[2] and DEFAULT_BBOX[1] <= lat <= DEFAULT_BBOX[3]


async def _simulate():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/simulate",
            json={"start_time": DEFAULT_START, "end_time": DEFAULT_END},
        )
        return response


def test_simulate_integration():
    response = asyncio.run(_simulate())
    assert response.status_code == 200

    data = response.json()
    assert "threats" in data
    assert "routes" in data

    threats = data.get("threats", {})
    assert threats.get("type") == "FeatureCollection"
    features = threats.get("features", [])
    assert len(features) >= 5

    scores = []
    required_props = {
        "cell_id",
        "severity_score",
        "priority_score",
        "time_to_collision_hours",
        "response_priority",
        "fuel_score",
        "atmo_score",
        "consequence_weight",
        "forecast_hour",
        "timestamp",
    }

    for feature in features:
        assert feature.get("geometry", {}).get("type") == "Polygon"
        coords = feature.get("geometry", {}).get("coordinates", [])
        assert coords, "missing polygon coordinates"

        for ring in coords:
            for lon, lat in ring:
                assert _within_bbox(lon, lat)

        props = feature.get("properties", {})
        assert required_props.issubset(props.keys())
        scores.append(props["priority_score"])

    assert all(scores[i] >= scores[i + 1] for i in range(len(scores) - 1))
