// ── ZeroStrike API Service Layer ──────────────────────────────────────
// Single source of truth for all backend endpoints.
// If VITE_API_URL is not set, every function throws so callers fall back
// to mock data in DataContext.

const BASE_URL = import.meta.env.VITE_API_URL || null;

function apiUrl(path) {
  if (!BASE_URL) throw new Error('No API URL configured — using mock data');
  return `${BASE_URL}${path}`;
}

async function apiFetch(path) {
  const res = await fetch(apiUrl(path));
  if (!res.ok) throw new Error(`API ${path} returned ${res.status}`);
  return res.json();
}

// ── Fleet ──────────────────────────────────────────────────────────────
// Returns Array<DroneObject>
// Required fields: id, lat, lng, status, battery, mission,
//                  altitude, speed, heading, payloadPct
export const getFleet = () => apiFetch('/api/fleet');

// ── Threats ────────────────────────────────────────────────────────────
// Returns Array<ThreatObject>
// Required fields: id, lat, lng, probability, radiusKm, level,
//                  heading, speedKmh, etaMin
export const getThreats = () => apiFetch('/api/threats');

// ── Predictions ────────────────────────────────────────────────────────
// Returns Array<PredictionObject>
// Required fields: id, zone, coords, prob, risk, etaMin, humidity,
//                  wind, temp, conf, recommendation, status
export const getPredictions = () => apiFetch('/api/predictions');

// ── 24-hour Forecast ───────────────────────────────────────────────────
// Returns Array<ForecastPoint>
// Required fields: h, label, [threatId]: number  (one key per top-4 threat)
export const getForecast = () => apiFetch('/api/forecast');

// ── Model Stats ────────────────────────────────────────────────────────
// Returns ModelStats object
// Required fields: accuracy24h, falsePositive, totalPredictions,
//                  lastTrained, dataPoints, version
export const getModelStats = () => apiFetch('/api/model-stats');

// ── Land Risk Map Layer ────────────────────────────────────────────────
// Returns GeoJSON FeatureCollection
// feature.properties.level: "critical" | "moderate" | "natural_fire_zone"
export const getLandRisk = () => apiFetch('/api/map/land-risk');

// ── Collision Zones Map Layer ──────────────────────────────────────────
// Returns GeoJSON FeatureCollection
// feature.properties: { threatId, severity }
export const getCollisions = () => apiFetch('/api/map/collisions');
