import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/map.css';
import DroneMarker from './DroneMarker';
import {
  buildThreatGeoJSON,
  buildCoverageGeoJSON,
} from '../../data/mapData';
import { useData } from '../../context/DataContext';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/** Mapbox GL requires a public token (pk.*). Secret tokens (sk.*) must not be used in frontend code. */
const isTokenValid = TOKEN && typeof TOKEN === 'string' && TOKEN.startsWith('pk.');

// Map styles: satellite (2D) vs 3D (terrain + buildings)
const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  '3d': 'mapbox://styles/mapbox/standard',
};

// ── Layer style definitions ───────────────────────────────────────────
const THREAT_FILL  = { id: 'threat-fill',  type: 'fill', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 } };
const THREAT_LINE  = { id: 'threat-line',  type: 'line', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.8 } };
const COVER_FILL   = { id: 'cover-fill',   type: 'fill', paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.08 } };
const COVER_LINE   = { id: 'cover-line',   type: 'line', paint: { 'line-color': '#38bdf8', 'line-width': 1, 'line-opacity': 0.4, 'line-dasharray': [4, 2] } };

// Selection box highlight
const SELECT_FILL = { id: 'select-fill', type: 'fill', paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.2 } };
const SELECT_LINE = { id: 'select-line', type: 'line', paint: { 'line-color': '#38bdf8', 'line-width': 2, 'line-dasharray': [4, 2] } };

// Land risk layers (rendered below threat layers)
const LAND_RISK_FILL = {
  id: 'land-risk-fill',
  type: 'fill',
  paint: {
    'fill-color': [
      'match', ['get', 'level'],
      'critical',          '#ff2020',
      'moderate',          '#ff6a00',
      'natural_fire_zone', '#94a3b8',
      '#94a3b8',
    ],
    'fill-opacity': [
      'match', ['get', 'level'],
      'critical',          0.12,
      'moderate',          0.07,
      'natural_fire_zone', 0.05,
      0.05,
    ],
  },
};
const LAND_RISK_LINE = {
  id: 'land-risk-line',
  type: 'line',
  paint: {
    'line-color': [
      'match', ['get', 'level'],
      'critical',          '#ff2020',
      'moderate',          '#ff6a00',
      'natural_fire_zone', '#94a3b8',
      '#94a3b8',
    ],
    'line-opacity': 0.3,
    'line-width': 1,
  },
};

// Collision zone layers
const COLLISION_FILL = {
  id: 'collision-fill',
  type: 'fill',
  paint: { 'fill-color': '#ff2244', 'fill-opacity': 0.28 },
};
const COLLISION_LINE = {
  id: 'collision-line',
  type: 'line',
  paint: { 'line-color': '#ff2244', 'line-width': 2.5, 'line-opacity': 0.9 },
};

// Trajectory line + tip layers
const TRAJECTORY_LINE = {
  id: 'trajectory-line',
  type: 'line',
  filter: ['==', ['geometry-type'], 'LineString'],
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 1.5,
    'line-opacity': 0.6,
    'line-dasharray': [6, 3],
  },
};
const TRAJECTORY_TIP = {
  id: 'trajectory-tip',
  type: 'circle',
  filter: ['==', ['geometry-type'], 'Point'],
  paint: {
    'circle-color': ['get', 'color'],
    'circle-radius': 4,
    'circle-opacity': 0.7,
  },
};

const LAYER_META = [
  { key: 'drones',     label: 'DRONES' },
  { key: 'threats',    label: 'THREATS' },
  { key: 'coverage',   label: 'COVERAGE' },
  { key: 'landRisk',   label: 'LAND RISK' },
  { key: 'collisions', label: 'COLLISIONS' },
];

/** Create GeoJSON polygon from sw/ne corners */
function bboxToGeoJSON(sw, ne) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[[sw[0], sw[1]], [ne[0], sw[1]], [ne[0], ne[1]], [sw[0], ne[1]], [sw[0], sw[1]]]],
    },
  };
}

/** Project a point distKm in headingDeg direction */
function projectPoint(lng, lat, headingDeg, distKm) {
  const latRad = (lat * Math.PI) / 180;
  const rad    = (headingDeg * Math.PI) / 180;
  const dLat   = (distKm / 110.574) * Math.cos(rad);
  const dLng   = (distKm / (111.32 * Math.cos(latRad))) * Math.sin(rad);
  return [lng + dLng, lat + dLat];
}

/** Build trajectory GeoJSON — LineStrings + endpoint Points in one collection */
function buildTrajectoryGeoJSON(threats) {
  const features = threats
    .filter((t) => t.heading != null && t.speedKmh != null)
    .flatMap((t) => {
      const distKm = t.speedKmh * 2; // 2-hour projection
      const color  = t.level === 'critical' ? '#ff2020' : '#ff6a00';
      const end    = projectPoint(t.lng, t.lat, t.heading, distKm);
      return [
        {
          type: 'Feature',
          properties: { id: t.id, color },
          geometry: { type: 'LineString', coordinates: [[t.lng, t.lat], end] },
        },
        {
          type: 'Feature',
          properties: { id: `${t.id}-tip`, color },
          geometry: { type: 'Point', coordinates: end },
        },
      ];
    });
  return { type: 'FeatureCollection', features };
}

const DEFAULT_VIEW = { longitude: 14, latitude: 46, zoom: 4.2 };

export default function TacticalMap() {
  const { fleet, threats, landRisk, collisions } = useData();

  const [layers, setLayers] = useState({
    drones: true, threats: true, coverage: true, landRisk: true, collisions: true,
  });
  const [viewState, setViewState]   = useState({ ...DEFAULT_VIEW, pitch: 0, bearing: 0 });
  const [mapMode, setMapMode]       = useState('satellite');
  const [drawMode, setDrawMode]     = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [mapLoaded, setMapLoaded]   = useState(false);
  const mapRef           = useRef(null);
  const drawStartRef     = useRef(null);
  const drawBoxRef       = useRef(null);
  const pendingFitBoundsRef = useRef(null);

  const threatGeoJSON      = useMemo(() => buildThreatGeoJSON(threats),   [threats]);
  const coverageGeoJSON    = useMemo(() => buildCoverageGeoJSON(fleet),   [fleet]);
  const trajectoryGeoJSON  = useMemo(() => buildTrajectoryGeoJSON(threats), [threats]);

  const toggleLayer = useCallback(
    (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] })),
    [],
  );

  const switchMapMode = useCallback((mode) => {
    setMapMode(mode);
    setViewState((prev) => ({
      ...prev,
      pitch:   mode === '3d' ? 60 : 0,
      bearing: mode === '3d' ? prev.bearing : 0,
    }));
  }, []);

  const resetToWorldView = useCallback(() => {
    setMapMode('satellite');
    setViewState({ ...DEFAULT_VIEW, pitch: 0, bearing: 0 });
    setSelectionBox(null);
  }, []);

  const handleMapLoad = useCallback((evt) => {
    mapRef.current = evt.target;
    setMapLoaded(true);
  }, []);

  // Draw mode: attach pointer listeners for box selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drawMode || !mapLoaded) return;

    const onDown = (e) => {
      e.preventDefault();
      drawStartRef.current = [e.lngLat.lng, e.lngLat.lat];
      drawBoxRef.current = null;
      setSelectionBox(null);
    };

    const onMove = (e) => {
      if (!drawStartRef.current) return;
      const start = drawStartRef.current;
      const end   = [e.lngLat.lng, e.lngLat.lat];
      const sw    = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
      const ne    = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
      const box   = { sw, ne };
      drawBoxRef.current = box;
      setSelectionBox(box);
    };

    const onUp = () => {
      const box = drawBoxRef.current;
      drawStartRef.current = null;
      drawBoxRef.current   = null;

      if (box && (box.ne[0] - box.sw[0] > 0.001 || box.ne[1] - box.sw[1] > 0.001)) {
        const bounds  = [box.sw, box.ne];
        const padding = { top: 80, bottom: 80, left: 80, right: 80 };
        const camera  = map.cameraForBounds(bounds, { padding });
        if (camera) {
          const c   = camera.center;
          const lng = Array.isArray(c) ? c[0] : c.lng;
          const lat = Array.isArray(c) ? c[1] : c.lat;
          setViewState((prev) => ({
            ...prev,
            longitude: lng, latitude: lat, zoom: camera.zoom,
            pitch: 60, bearing: 0,
          }));
        }
        pendingFitBoundsRef.current = bounds;
        switchMapMode('3d');
        setDrawMode(false);
        setTimeout(() => setSelectionBox(null), 1500);
      } else {
        setSelectionBox(null);
      }
    };

    map.dragPan.disable();
    map.on('mousedown', onDown);
    map.on('mousemove', onMove);
    map.on('mouseup',   onUp);

    return () => {
      map.dragPan.enable();
      map.off('mousedown', onDown);
      map.off('mousemove', onMove);
      map.off('mouseup',   onUp);
      drawStartRef.current = null;
      drawBoxRef.current   = null;
    };
  }, [drawMode, mapLoaded, switchMapMode]);

  // When switching to 3D with pending bounds, fit after style loads
  useEffect(() => {
    const map    = mapRef.current;
    const bounds = pendingFitBoundsRef.current;
    if (!map || !mapLoaded || mapMode !== '3d' || !bounds) return;

    const onIdle = () => {
      map.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 80 },
        duration: 1200, pitch: 60, bearing: 0,
      });
      map.off('idle', onIdle);
      pendingFitBoundsRef.current = null;
    };
    map.once('idle', onIdle);
    return () => { map.off('idle', onIdle); };
  }, [mapMode, mapLoaded]);

  // Sync viewState from map move
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const onMoveEnd = () => {
      const c = map.getCenter();
      setViewState((prev) => ({
        ...prev,
        longitude: c.lng, latitude: c.lat,
        zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing(),
      }));
    };
    map.on('moveend', onMoveEnd);
    return () => map.off('moveend', onMoveEnd);
  }, [mapLoaded]);

  const selectionGeoJSON = useMemo(() => {
    if (!selectionBox) return null;
    return bboxToGeoJSON(selectionBox.sw, selectionBox.ne);
  }, [selectionBox]);

  const deployedCount = fleet.filter((d) => d.status === 'deployed').length;
  const hasCollisions = !!collisions?.features?.length;

  if (!isTokenValid) {
    return (
      <div style={{
        position: 'relative', width: '100%', height: '100%', background: '#0b1121',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        gap: '1rem', padding: '2rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.9rem',
      }}>
        <div style={{ color: '#f87171', fontWeight: 600 }}>Mapbox: Invalid or missing token</div>
        <p style={{ maxWidth: '32rem', textAlign: 'center', lineHeight: 1.6 }}>
          Set <code style={{ background: '#1e293b', padding: '0.2rem 0.4rem', borderRadius: 4 }}>VITE_MAPBOX_TOKEN</code> in your <code>.env</code> to a <strong>public</strong> Mapbox token (<code>pk.*</code>).
          Do not use a secret token (<code>sk.*</code>). Get a public token at{' '}
          <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
            account.mapbox.com
          </a>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0b1121' }}>
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onLoad={handleMapLoad}
        mapboxAccessToken={TOKEN}
        mapStyle={MAP_STYLES[mapMode]}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        cursor={drawMode ? 'crosshair' : undefined}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Selection box highlight */}
        {selectionGeoJSON && (
          <Source id="selection" type="geojson" data={selectionGeoJSON}>
            <Layer {...SELECT_FILL} />
            <Layer {...SELECT_LINE} />
          </Source>
        )}

        {/* Land risk polygons — rendered first so threats/coverage appear on top */}
        {layers.landRisk && landRisk && (
          <Source id="land-risk" type="geojson" data={landRisk}>
            <Layer {...LAND_RISK_FILL} />
            <Layer {...LAND_RISK_LINE} />
          </Source>
        )}

        {/* Drone coverage circles */}
        {layers.coverage && (
          <Source id="coverage" type="geojson" data={coverageGeoJSON}>
            <Layer {...COVER_FILL} />
            <Layer {...COVER_LINE} />
          </Source>
        )}

        {/* Threat zones */}
        {layers.threats && (
          <Source id="threats" type="geojson" data={threatGeoJSON}>
            <Layer {...THREAT_FILL} />
            <Layer {...THREAT_LINE} />
          </Source>
        )}

        {/* Storm trajectory arrows */}
        {layers.threats && (
          <Source id="trajectories" type="geojson" data={trajectoryGeoJSON}>
            <Layer {...TRAJECTORY_LINE} />
            <Layer {...TRAJECTORY_TIP} />
          </Source>
        )}

        {/* Collision zones — where dangerous sky meets dangerous ground */}
        {layers.collisions && collisions && (
          <Source id="collisions" type="geojson" data={collisions}>
            <Layer {...COLLISION_FILL} />
            <Layer {...COLLISION_LINE} />
          </Source>
        )}

        {/* Drone position markers */}
        {layers.drones &&
          fleet.map((drone) => (
            <Marker
              key={drone.id}
              longitude={drone.lng}
              latitude={drone.lat}
              anchor="center"
            >
              <DroneMarker drone={drone} />
            </Marker>
          ))}
      </Map>

      {/* ── HUD Overlay ───────────────────────────────────────────── */}
      <div className="map-hud-overlay">

        {/* Coordinates — top-left */}
        <div className="map-hud-coords map-hud-panel">
          <div className="map-hud-row">
            <span className="map-hud-label">LAT</span>
            <span className="map-hud-value">{viewState.latitude.toFixed(4)}°</span>
          </div>
          <div className="map-hud-row">
            <span className="map-hud-label">LON</span>
            <span className="map-hud-value">{viewState.longitude.toFixed(4)}°</span>
          </div>
          <div className="map-hud-row">
            <span className="map-hud-label">ZOOM</span>
            <span className="map-hud-value">{viewState.zoom.toFixed(1)}</span>
          </div>
        </div>

        {/* Collision alert badge — top-center, only when collisions detected */}
        {hasCollisions && layers.collisions && (
          <div className="map-collision-alert">
            <span className="map-collision-dot" />
            COLLISION ZONES ACTIVE
          </div>
        )}

        {/* Mode toggle + Draw — top-right */}
        <div className="map-mode-controls map-hud-panel">
          <div className="map-layer-header">MODE</div>
          <button
            className={`map-layer-btn ${mapMode === 'satellite' ? 'active' : ''}`}
            onClick={() => switchMapMode('satellite')}
            disabled={drawMode}
          >
            <span className="map-layer-dot satellites" />
            SATELLITE
          </button>
          <button
            className={`map-layer-btn ${mapMode === '3d' ? 'active' : ''}`}
            onClick={() => switchMapMode('3d')}
            disabled={drawMode}
          >
            <span className="map-layer-dot threed" />
            3D
          </button>
          <div className="map-mode-divider" />
          <button
            className={`map-layer-btn ${drawMode ? 'active' : ''}`}
            onClick={() => setDrawMode((d) => !d)}
          >
            <span className="map-layer-dot draw" />
            {drawMode ? 'DRAWING… CLICK & DRAG' : 'DRAW AREA'}
          </button>
          {mapMode === '3d' && (
            <button className="map-layer-btn" onClick={resetToWorldView}>
              <span className="map-layer-dot reset" />
              RESET VIEW
            </button>
          )}
        </div>

        {/* Layer toggles — bottom-right */}
        <div className="map-layer-controls map-hud-panel">
          <div className="map-layer-header">LAYERS</div>
          {LAYER_META.map(({ key, label }) => (
            <button
              key={key}
              className={`map-layer-btn ${layers[key] ? 'active' : ''}`}
              onClick={() => toggleLayer(key)}
            >
              <span className={`map-layer-dot ${key}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Projection meta — bottom-left */}
        <div className="map-hud-meta">
          <div>PROJ: MERCATOR</div>
          <div>DATUM: WGS84</div>
          <div className="highlight">{deployedCount} UNITS DEPLOYED</div>
        </div>

      </div>
    </div>
  );
}
