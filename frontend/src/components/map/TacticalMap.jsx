import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/map.css';
import DroneMarker from './DroneMarker';
import {
  DRONES,
  THREATS,
  buildThreatGeoJSON,
  buildCoverageGeoJSON,
} from '../../data/mapData';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// GeoJSON layer style definitions
const THREAT_FILL  = { id: 'threat-fill',  type: 'fill', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.13 } };
const THREAT_LINE  = { id: 'threat-line',  type: 'line', paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-opacity': 0.7 } };
const COVER_FILL   = { id: 'cover-fill',   type: 'fill', paint: { 'fill-color': '#00e5ff', 'fill-opacity': 0.05 } };
const COVER_LINE   = { id: 'cover-line',   type: 'line', paint: { 'line-color': '#00e5ff', 'line-width': 1, 'line-opacity': 0.25, 'line-dasharray': [5, 4] } };

const LAYER_META = [
  { key: 'drones',   label: 'DRONES' },
  { key: 'threats',  label: 'THREATS' },
  { key: 'coverage', label: 'COVERAGE' },
];

export default function TacticalMap() {
  const [layers, setLayers] = useState({ drones: true, threats: true, coverage: true });
  const [viewState, setViewState] = useState({ longitude: 10, latitude: 20, zoom: 2 });

  const threatGeoJSON   = useMemo(() => buildThreatGeoJSON(THREATS),       []);
  const coverageGeoJSON = useMemo(() => buildCoverageGeoJSON(DRONES), []);

  const toggleLayer = useCallback(
    (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] })),
    []
  );

  const deployedCount = DRONES.filter((d) => d.status === 'deployed').length;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapboxAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

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

        {/* Drone position markers */}
        {layers.drones &&
          DRONES.map((drone) => (
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
