import { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { DRONES as MAP_DRONES, THREATS } from '../data/mapData';
import { DRONES_DETAIL } from '../data/droneData';
import { PREDICTIONS, FORECAST_24H, MODEL_STATS } from '../data/predictionData';
import { LAND_RISK } from '../data/landRiskData';
import { circleRing } from '../data/mapData';

// ── Point-in-polygon (ray-casting) ─────────────────────────────────────
function pointInPolygon([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// ── Collision detection ─────────────────────────────────────────────────
// Marks threats whose centroid falls inside a critical land-risk polygon.
function computeCollisions(threats, landRisk) {
  if (!landRisk?.features?.length || !threats?.length) return null;

  const criticals = landRisk.features.filter(
    (f) => f.properties.level === 'critical',
  );

  const collisionFeatures = threats
    .filter((t) =>
      criticals.some((f) =>
        pointInPolygon([t.lng, t.lat], f.geometry.coordinates[0]),
      ),
    )
    .map((t) => ({
      type: 'Feature',
      properties: { threatId: t.id, severity: t.level },
      geometry: {
        type: 'Polygon',
        coordinates: [circleRing([t.lng, t.lat], t.radiusKm)],
      },
    }));

  return collisionFeatures.length
    ? { type: 'FeatureCollection', features: collisionFeatures }
    : null;
}

// ── Merge Mediterranean positions into DRONES_DETAIL ──────────────────
// DRONES_DETAIL has the rich telemetry; MAP_DRONES has the correct EU coordinates.
const INITIAL_FLEET = DRONES_DETAIL.map((d) => {
  const mapDrone = MAP_DRONES.find((m) => m.id === d.id);
  return mapDrone ? { ...d, lat: mapDrone.lat, lng: mapDrone.lng } : d;
});

// ── Context ────────────────────────────────────────────────────────────
const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

// ── Provider ────────────────────────────────────────────────────────────
export function DataProvider({ children }) {
  const [fleet,       setFleet]       = useState(INITIAL_FLEET);
  const [threats,     setThreats]     = useState(THREATS);
  const [predictions, setPredictions] = useState(PREDICTIONS);
  const [forecast,    setForecast]    = useState(FORECAST_24H);
  const [modelStats,  setModelStats]  = useState(MODEL_STATS);
  const [landRisk,    setLandRisk]    = useState(LAND_RISK);
  const [collisions,  setCollisions]  = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive,      setIsLive]      = useState(false);

  // Track latest threats & landRisk for collision computation
  const threatsRef  = useRef(threats);
  const landRiskRef = useRef(landRisk);
  threatsRef.current  = threats;
  landRiskRef.current = landRisk;

  // Recompute collisions whenever threats or landRisk change
  useEffect(() => {
    setCollisions(computeCollisions(threats, landRisk));
  }, [threats, landRisk]);

  // ── Helper: try a fetch, silently ignore failures ────────────────────
  async function tryFetch(apiFn, setter) {
    try {
      const data = await apiFn();
      setter(data);
      setIsLive(true);
      setLastUpdated(new Date());
    } catch {
      // Keep existing state (mock data or last live data)
    }
  }

  // ── Initial load + polling intervals ────────────────────────────────
  useEffect(() => {
    // Immediate load on mount
    tryFetch(api.getFleet,      setFleet);
    tryFetch(api.getThreats,    setThreats);
    tryFetch(api.getPredictions, setPredictions);
    tryFetch(api.getForecast,   setForecast);
    tryFetch(api.getModelStats, setModelStats);
    tryFetch(api.getLandRisk,   setLandRisk);
    tryFetch(api.getCollisions, setCollisions);

    // Fleet: every 15 s
    const fleetTimer = setInterval(
      () => tryFetch(api.getFleet, setFleet),
      15_000,
    );

    // Threats: every 30 s
    const threatTimer = setInterval(
      () => tryFetch(api.getThreats, setThreats),
      30_000,
    );

    // Predictions + Forecast + ModelStats: every 60 s
    const predTimer = setInterval(() => {
      tryFetch(api.getPredictions, setPredictions);
      tryFetch(api.getForecast,   setForecast);
      tryFetch(api.getModelStats, setModelStats);
    }, 60_000);

    // Land risk + Collisions: every 5 minutes
    const mapTimer = setInterval(() => {
      tryFetch(api.getLandRisk,   setLandRisk);
      tryFetch(api.getCollisions, setCollisions);
    }, 5 * 60_000);

    return () => {
      clearInterval(fleetTimer);
      clearInterval(threatTimer);
      clearInterval(predTimer);
      clearInterval(mapTimer);
    };
  }, []);

  const value = {
    fleet,
    threats,
    predictions,
    forecast,
    modelStats,
    landRisk,
    collisions,
    lastUpdated,
    isLive,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
