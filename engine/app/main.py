from typing import Optional

from fastapi import FastAPI, HTTPException, Query

from app.config import AppConfig, DEFAULT_BBOX, DEFAULT_END, DEFAULT_START
from datetime import timedelta

from app.engine.pipeline import compute_layers, compute_threats, compute_simulation
from app.engine.routing import plan_routes
from app.models import BBox, SimRequest
from app.utils.time import parse_time, to_iso

app = FastAPI(title="ZeroStrike Backend", version="0.1.0")
config = AppConfig()


def validate_bbox(bbox: BBox) -> None:
    if bbox.min_lat >= bbox.max_lat or bbox.min_lon >= bbox.max_lon:
        raise HTTPException(status_code=400, detail="Invalid bbox: min values must be less than max values")


def resolve_bbox(
    min_lon: Optional[float],
    min_lat: Optional[float],
    max_lon: Optional[float],
    max_lat: Optional[float],
) -> BBox:
    if None in (min_lon, min_lat, max_lon, max_lat):
        return BBox(
            min_lon=DEFAULT_BBOX[0],
            min_lat=DEFAULT_BBOX[1],
            max_lon=DEFAULT_BBOX[2],
            max_lat=DEFAULT_BBOX[3],
        )
    return BBox(min_lon=min_lon, min_lat=min_lat, max_lon=max_lon, max_lat=max_lat)


def resolve_threshold(value: Optional[float]) -> float:
    if value is None:
        return config.threat_threshold
    return value


def bbox_to_dict(bbox: BBox) -> dict:
    if hasattr(bbox, "model_dump"):
        return bbox.model_dump()
    return bbox.dict()


def resolve_data_mode(value: Optional[str]) -> str:
    if value in (None, ""):
        return "hybrid"
    if value not in {"hybrid", "real", "synthetic"}:
        raise HTTPException(status_code=400, detail="data_mode must be one of: hybrid, real, synthetic")
    return value


@app.get("/health")
def health():
    return {
        "status": "ok",
        "config": {
            "grid_resolution_deg": config.grid_resolution_deg,
            "horizon_hours": config.horizon_hours,
            "threat_threshold": config.threat_threshold,
            "default_bbox": {
                "min_lon": DEFAULT_BBOX[0],
                "min_lat": DEFAULT_BBOX[1],
                "max_lon": DEFAULT_BBOX[2],
                "max_lat": DEFAULT_BBOX[3],
            },
            "default_start": DEFAULT_START,
            "default_end": DEFAULT_END,
        },
    }


@app.get("/layers")
def get_layers(
    min_lon: Optional[float] = Query(None),
    min_lat: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    time: Optional[str] = Query(None),
    data_mode: Optional[str] = Query("hybrid"),
):
    bbox = resolve_bbox(min_lon, min_lat, max_lon, max_lat)
    validate_bbox(bbox)

    when = parse_time(time, DEFAULT_START)
    mode = resolve_data_mode(data_mode)

    try:
        grid, fuel, atmo, consequence, _ = compute_layers(bbox, when, mode, config)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "meta": {
            "resolution_deg": grid.resolution_deg,
            "rows": grid.rows,
            "cols": grid.cols,
            "bbox": bbox_to_dict(bbox),
            "time": to_iso(when),
            "data_mode": mode,
        },
        "layers": {
            "fuel": fuel,
            "atmospheric": atmo,
            "consequence": consequence,
        },
    }


@app.get("/threats")
def get_threats(
    min_lon: Optional[float] = Query(None),
    min_lat: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    time: Optional[str] = Query(None),
    data_mode: Optional[str] = Query("hybrid"),
    threshold: Optional[float] = Query(None),
):
    bbox = resolve_bbox(min_lon, min_lat, max_lon, max_lat)
    validate_bbox(bbox)

    when = parse_time(time, DEFAULT_START)
    mode = resolve_data_mode(data_mode)
    threat_threshold = resolve_threshold(threshold)

    try:
        return compute_threats(bbox, when, mode, config, threat_threshold)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/routes")
def get_routes(
    min_lon: Optional[float] = Query(None),
    min_lat: Optional[float] = Query(None),
    max_lon: Optional[float] = Query(None),
    max_lat: Optional[float] = Query(None),
    time: Optional[str] = Query(None),
    data_mode: Optional[str] = Query("hybrid"),
    threshold: Optional[float] = Query(None),
):
    bbox = resolve_bbox(min_lon, min_lat, max_lon, max_lat)
    validate_bbox(bbox)

    when = parse_time(time, DEFAULT_START)
    mode = resolve_data_mode(data_mode)
    threat_threshold = resolve_threshold(threshold)

    try:
        threats = compute_threats(bbox, when, mode, config, threat_threshold)
        return plan_routes(
            threats,
            config,
            top_n=config.routing_top_n,
            drone_count=config.routing_drone_count,
            speed_kmh=config.routing_speed_kmh,
            range_km=config.routing_range_km,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/simulate")
def simulate(request: SimRequest):
    bbox = request.bbox or BBox(
        min_lon=DEFAULT_BBOX[0],
        min_lat=DEFAULT_BBOX[1],
        max_lon=DEFAULT_BBOX[2],
        max_lat=DEFAULT_BBOX[3],
    )
    validate_bbox(bbox)

    start = parse_time(request.start_time, DEFAULT_START)
    end = parse_time(request.end_time, DEFAULT_END)
    mode = resolve_data_mode(request.data_mode)
    threat_threshold = resolve_threshold(request.threshold)
    step_hours = request.step_hours or config.simulate_step_hours

    try:
        threats = compute_simulation(bbox, start, end, mode, config, threat_threshold, step_hours)

        routes_features = []
        current = start
        while current <= end:
            threats_t = compute_threats(bbox, current, mode, config, threat_threshold)
            routes_t = plan_routes(
                threats_t,
                config,
                top_n=config.routing_top_n,
                drone_count=config.routing_drone_count,
                speed_kmh=config.routing_speed_kmh,
                range_km=config.routing_range_km,
            )
            timestamp = to_iso(current)
            for feature in routes_t.get("features", []):
                props = feature.get("properties", {})
                props["timestamp"] = timestamp
                feature["properties"] = props
                routes_features.append(feature)
            current = current + timedelta(hours=step_hours)

        routes = {"type": "FeatureCollection", "features": routes_features}
        return {"threats": threats, "routes": routes}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
