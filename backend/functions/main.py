"""
ZeroStrike API — Firebase Cloud Function (Python 3.12)

Wraps the wildfire-risk engine and exposes the endpoints that the
ZeroStrike frontend Product Demo tab expects.
"""

import math
import os
import sys

# ── Make the engine package importable ────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "engine"))

from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_functions import https_fn
import firebase_admin
from firebase_admin import firestore
from datetime import datetime, timezone

from app.config import AppConfig, DEFAULT_BBOX, DEFAULT_START
from app.engine.pipeline import compute_threats
from app.models import BBox
from app.utils.time import parse_time

flask_app = Flask(__name__)
CORS(flask_app)

# Lazy Firestore init — avoids blocking module load during deploy analysis
_db = None

def _get_db():
    global _db
    if _db is None:
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app()
        _db = firestore.client(database_id="zero-strike")
    return _db

def _get_drop_doc():
    return _get_db().collection("drops").document("current")

def _get_mission_doc():
    return _get_db().collection("missions").document("current")

config = AppConfig()

_DEFAULT_BBOX = BBox(
    min_lon=DEFAULT_BBOX[0],
    min_lat=DEFAULT_BBOX[1],
    max_lon=DEFAULT_BBOX[2],
    max_lat=DEFAULT_BBOX[3],
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _centroid(coordinates):
    """Return (lat, lng) centroid of a GeoJSON polygon ring."""
    ring = coordinates[0]
    n = len(ring)
    lng = sum(p[0] for p in ring) / n
    lat = sum(p[1] for p in ring) / n
    return round(lat, 4), round(lng, 4)


# engine priority → frontend level
_LEVEL = {"critical": "critical", "high": "warning", "medium": "watch", "low": "watch"}
_RADIUS = {"critical": 42, "high": 30, "medium": 20, "low": 12}
_HEADINGS = [220, 155, 190, 180, 130, 280, 310, 160, 200, 240]
_SPEEDS = [18, 12, 8, 14, 10, 22, 16, 11, 9, 20]
_ZONES = ["Zone C7", "Zone C9", "Zone D3", "Zone F3", "Zone A",
          "Sector N", "Zone K4", "Zone G2", "Zone B2", "Zone E1"]
_WINDS = ["NE", "N", "NW", "E", "SE", "SW", "W", "NNE", "NNW", "ENE"]
_RECS = {"critical": "DISPATCH", "warning": "DISPATCH", "watch": "MONITOR", "low": "STANDBY"}


def _raw_features():
    """Run engine pipeline and return threat GeoJSON features, sorted by priority."""
    when = parse_time(None, DEFAULT_START)
    collection = compute_threats(_DEFAULT_BBOX, when, "synthetic", config, config.threat_threshold)
    return collection.get("features", [])


# ── API endpoints ─────────────────────────────────────────────────────────────

@flask_app.get("/api/health")
def health():
    return jsonify({"status": "ok", "engine": "synthetic"})


@flask_app.get("/api/threats")
def get_threats():
    features = _raw_features()[:20]
    threats = []
    for i, f in enumerate(features):
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [[]])
        lat, lng = _centroid(coords)
        priority = props.get("response_priority", "low")
        sev = props.get("severity_score", 0.3)
        ttc = props.get("time_to_collision_hours", 3)
        threats.append({
            "id": f"STRK-{i+1:03d}",
            "lat": lat,
            "lng": lng,
            "probability": min(99, int(sev * 100)),
            "radiusKm": _RADIUS.get(priority, 20),
            "level": _LEVEL.get(priority, "watch"),
            "heading": _HEADINGS[i % len(_HEADINGS)],
            "speedKmh": _SPEEDS[i % len(_SPEEDS)],
            "etaMin": int(ttc * 60),
        })
    return jsonify(threats)


@flask_app.get("/api/fleet")
def get_fleet():
    return jsonify([
        {"id": "ZS-01", "lat": 36.20, "lng": -118.40, "status": "deployed",
         "battery": 78,  "mission": "SEED-ZONE-A",   "altitude": 285, "speed": 18, "heading": "NNE", "payloadPct": 62},
        {"id": "ZS-02", "lat": 35.80, "lng": -119.10, "status": "deployed",
         "battery": 65,  "mission": "SEED-ZONE-B",   "altitude": 312, "speed": 22, "heading": "NW",  "payloadPct": 45},
        {"id": "ZS-03", "lat": 36.80, "lng": -118.80, "status": "standby",
         "battery": 100, "mission": "STANDBY",        "altitude": 0,   "speed": 0,  "heading": "---", "payloadPct": 100},
        {"id": "ZS-04", "lat": 36.50, "lng": -117.90, "status": "warning",
         "battery": 22,  "mission": "RTB — LOW BATT", "altitude": 148, "speed": 30, "heading": "SSW", "payloadPct": 8},
        {"id": "ZS-05", "lat": 35.50, "lng": -119.50, "status": "standby",
         "battery": 95,  "mission": "STANDBY",        "altitude": 0,   "speed": 0,  "heading": "---", "payloadPct": 100},
        {"id": "ZS-06", "lat": 37.10, "lng": -119.20, "status": "deployed",
         "battery": 84,  "mission": "PATROL-NORTH",   "altitude": 240, "speed": 20, "heading": "N",   "payloadPct": 80},
        {"id": "ZS-07", "lat": 35.20, "lng": -118.00, "status": "standby",
         "battery": 91,  "mission": "STANDBY",        "altitude": 0,   "speed": 0,  "heading": "---", "payloadPct": 100},
    ])


@flask_app.get("/api/predictions")
def get_predictions():
    features = _raw_features()[:12]
    predictions = []
    for i, f in enumerate(features):
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [[]])
        lat, lng = _centroid(coords)
        priority = props.get("response_priority", "low")
        sev = props.get("severity_score", 0.3)
        fuel = props.get("fuel_score", 0.5)
        atmo = props.get("atmo_score", 0.5)
        ttc = props.get("time_to_collision_hours", 3)
        level = _LEVEL.get(priority, "watch")
        predictions.append({
            "id": f"STRK-{i+1:03d}",
            "zone": _ZONES[i % len(_ZONES)],
            "coords": f'{abs(lat):.2f}°{"N" if lat >= 0 else "S"} {abs(lng):.2f}°{"E" if lng >= 0 else "W"}',
            "prob": min(99, int(sev * 100)),
            "risk": level,
            "etaMin": int(ttc * 60),
            "humidity": max(5, min(40, int((1 - atmo) * 40))),
            "wind": f'{max(5, int(atmo * 35))} kn {_WINDS[i % len(_WINDS)]}',
            "temp": max(28, min(45, int(28 + fuel * 17))),
            "conf": max(60, min(98, int(60 + sev * 40))),
            "recommendation": _RECS.get(level, "MONITOR"),
            "status": "dispatching" if level == "critical" else "active",
            "updatedMin": (i + 1) * 2,
        })
    return jsonify(predictions)


@flask_app.get("/api/forecast")
def get_forecast():
    features = _raw_features()[:4]
    forecast = []
    for h in range(25):
        pt = {"h": h, "label": "NOW" if h == 0 else f"+{h}h"}
        for i, f in enumerate(features):
            props = f.get("properties", {})
            sev = props.get("severity_score", 0.3)
            base = min(99, int(sev * 100))
            ttc = props.get("time_to_collision_hours", 3)
            peak_h = max(1, int(ttc))
            if h == 0:
                val = base
            elif h <= peak_h:
                val = base + (min(99, base + 8) - base) * (h / peak_h)
            else:
                decay = math.exp(-(h - peak_h) / 4.0)
                val = min(99, base + 8) * decay + 5
            # Deterministic jitter keyed by h and i
            jitter = ((h * 7 + i * 13) % 9) - 4
            pt[f"STRK-{i+1:03d}"] = max(0, min(100, int(val + jitter)))
        forecast.append(pt)
    return jsonify(forecast)


@flask_app.get("/api/model-stats")
def get_model_stats():
    return jsonify({
        "accuracy24h": 89.2,
        "falsePositive": 4.1,
        "totalPredictions": 847,
        "lastTrained": "06:00 UTC",
        "dataPoints": "2.4M",
        "version": "v3.7.1",
    })


@flask_app.get("/api/map/land-risk")
def get_land_risk():
    features = _raw_features()
    geo_features = []
    for i, f in enumerate(features):
        props = f.get("properties", {})
        priority = props.get("response_priority", "low")
        sev = props.get("severity_score", 0.0)
        if sev < 0.3:
            continue
        if priority in ("critical", "high"):
            level = "critical"
        elif priority == "medium":
            level = "moderate"
        else:
            level = "natural_fire_zone"
        geo_features.append({
            "type": "Feature",
            "properties": {"id": f"LR-{i:03d}", "level": level},
            "geometry": f.get("geometry"),
        })
    return jsonify({"type": "FeatureCollection", "features": geo_features})


@flask_app.get("/api/map/collisions")
def get_collisions():
    # Client computes collisions from threats + land-risk; this is a fallback
    return jsonify({"type": "FeatureCollection", "features": []})


# ── Drop Payload Endpoints ────────────────────────────────────────────────────
# Firestore doc: drops/current
# Fields: status ("idle"|"drop"|"reset"), confirmed (bool), timestamp, confirmedAt

@flask_app.post("/api/drop")
def trigger_drop():
    _get_drop_doc().set({
        "status": "drop",
        "confirmed": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return jsonify({"ok": True, "status": "drop"})


@flask_app.post("/api/reset-drop")
def reset_drop():
    _get_drop_doc().set({
        "status": "reset",
        "confirmed": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return jsonify({"ok": True, "status": "reset"})


@flask_app.get("/api/drop-status")
def drop_status():
    doc = _get_drop_doc().get()
    if doc.exists:
        data = doc.to_dict()
        return data.get("status", "idle"), 200, {"Content-Type": "text/plain"}
    return "idle", 200, {"Content-Type": "text/plain"}


@flask_app.post("/api/drop-confirm")
def drop_confirm():
    _get_drop_doc().update({
        "status": "idle",
        "confirmed": True,
        "confirmedAt": datetime.now(timezone.utc).isoformat(),
    })
    return jsonify({"ok": True, "status": "idle"})


# ── Mission Dispatch Endpoints ────────────────────────────────────────────────
# Firestore doc: missions/current
# Fields: status, waypoints, speed, type, timestamp, droneStatus, droneMessage

@flask_app.post("/api/mission")
def create_mission():
    data = request.get_json(force=True)
    waypoints = data.get("waypoints", [])
    speed = data.get("speed", 10.0)
    mission_type = data.get("type", "native")  # "native" or "virtualstick"
    if len(waypoints) < 1:
        return jsonify({"ok": False, "error": "Need at least 1 waypoint"}), 400
    _get_mission_doc().set({
        "status": "pending",
        "waypoints": waypoints,
        "speed": speed,
        "type": mission_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "droneStatus": "waiting",
        "droneMessage": "",
    })
    return jsonify({"ok": True, "status": "pending", "waypointCount": len(waypoints)})


@flask_app.get("/api/mission-status")
def get_mission_status():
    doc = _get_mission_doc().get()
    if doc.exists:
        return jsonify(doc.to_dict())
    return jsonify({"status": "idle"})


@flask_app.post("/api/abort-mission")
def abort_mission():
    _get_mission_doc().update({
        "status": "abort",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return jsonify({"ok": True, "status": "abort"})


@flask_app.post("/api/mission-update")
def mission_update():
    """Called by the drone app to update mission progress."""
    data = request.get_json(force=True)
    update = {}
    if "droneStatus" in data:
        update["droneStatus"] = data["droneStatus"]
    if "droneMessage" in data:
        update["droneMessage"] = data["droneMessage"]
    if "status" in data:
        update["status"] = data["status"]
    if update:
        _get_mission_doc().update(update)
    return jsonify({"ok": True})


# ── Firebase Cloud Function entry point ───────────────────────────────────────

@https_fn.on_request(region="us-central1")
def api(req: https_fn.Request) -> https_fn.Response:
    with flask_app.request_context(req.environ):
        return flask_app.full_dispatch_request()
