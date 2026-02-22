import { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/zerostrike.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/* ── Coordinates display ─────────────────────────────────────────────── */
const INIT_VIEW = { longitude: -122.05, latitude: 37.41, zoom: 10.5, pitch: 0, bearing: 0 };

/* ── Agent feed data ─────────────────────────────────────────────────── */
const INIT_ENTRIES = [
  { time: '14:20:41', icon: 'gps_fixed',      color: '#ef4444', msg: 'Collision detected: Cell-3 → SCU corridor' },
  { time: '14:20:38', icon: 'flight_takeoff',  color: '#60a5fa', msg: 'Dispatching drone-2 from Moffett' },
  { time: '14:20:35', icon: 'warning',         color: '#facc15', msg: 'Reclassifying zone r25c52 → critical' },
  { time: '14:20:31', icon: 'route',           color: '#4ade80', msg: 'Route optimized: ETA 10.3 min' },
  { time: '14:20:27', icon: 'radar',           color: '#94a3b8', msg: 'Perimeter scan complete — sector 7 clear' },
  { time: '14:20:23', icon: 'gps_fixed',      color: '#ef4444', msg: 'Thermal anomaly flagged: grid r12c44' },
  { time: '14:20:19', icon: 'flight_takeoff',  color: '#60a5fa', msg: 'Drone-5 RTB — battery at 18%' },
  { time: '14:20:15', icon: 'auto_fix_high',   color: '#f97316', msg: 'Pattern match: swarm behavior in zone D' },
  { time: '14:20:11', icon: 'route',           color: '#4ade80', msg: 'Reassigning drone-3 to corridor north' },
  { time: '14:20:07', icon: 'sensors',         color: '#22d3ee', msg: 'LIDAR sweep — obstacle map updated' },
  { time: '14:20:03', icon: 'gps_fixed',      color: '#ef4444', msg: 'Intrusion alert: boundary fence sector 2' },
  { time: '14:19:58', icon: 'warning',         color: '#facc15', msg: 'Risk escalation: zone r30c10 → elevated' },
  { time: '14:19:54', icon: 'flight_takeoff',  color: '#60a5fa', msg: 'Drone-1 holding pattern — awaiting clearance' },
  { time: '14:19:49', icon: 'alt_route',       color: '#4ade80', msg: 'Alternate path computed: avoiding no-fly zone' },
  { time: '14:19:44', icon: 'radar',           color: '#94a3b8', msg: 'Acoustic sensor ping — sector 4 nominal' },
  { time: '14:19:39', icon: 'crisis_alert',    color: '#ef4444', msg: 'Movement cluster detected: east perimeter' },
  { time: '14:19:34', icon: 'auto_fix_high',   color: '#f97316', msg: 'Object ID: vehicle — confidence 94.2%' },
  { time: '14:19:29', icon: 'flight_takeoff',  color: '#60a5fa', msg: 'Dispatching drone-4 to intercept point' },
  { time: '14:19:24', icon: 'route',           color: '#4ade80', msg: 'Geofence updated — new boundary active' },
  { time: '14:19:19', icon: 'sensors',         color: '#22d3ee', msg: 'IR camera calibrated — thermal baseline set' },
];

const LIVE_POOL = [
  { icon: 'gps_fixed',     color: '#ef4444', msg: 'Motion spike: quadrant NW-3 active' },
  { icon: 'flight_takeoff', color: '#60a5fa', msg: 'Drone-6 launched — heading bearing 045°' },
  { icon: 'warning',        color: '#facc15', msg: 'Threat level adjusted: zone r18c22 → watch' },
  { icon: 'route',          color: '#4ade80', msg: 'Convoy route recalculated: +2.1 min' },
  { icon: 'radar',          color: '#94a3b8', msg: 'Full sweep complete — 97.3% coverage' },
  { icon: 'crisis_alert',   color: '#ef4444', msg: 'Anomalous RF signature — triangulating' },
  { icon: 'auto_fix_high',  color: '#f97316', msg: 'Classification update: fauna — false positive' },
  { icon: 'flight_takeoff', color: '#60a5fa', msg: 'Drone-2 loiter extended — high-value target' },
  { icon: 'alt_route',      color: '#4ade80', msg: 'Waypoint inserted: emergency corridor B' },
  { icon: 'sensors',        color: '#22d3ee', msg: 'Satellite uplink confirmed — data synced' },
];

/* ── Square cursor ───────────────────────────────────────────────────── */
function SquareCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div className="zs-cursor" style={{ left: pos.x, top: pos.y }}>
      <div className="zs-cursor-tl" />
      <div className="zs-cursor-tr" />
      <div className="zs-cursor-bl" />
      <div className="zs-cursor-br" />
      <div className="zs-cursor-h" />
      <div className="zs-cursor-v" />
      <div className="zs-cursor-dot" />
    </div>
  );
}

/* ── Live clock ──────────────────────────────────────────────────────── */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  return <>{p(now.getHours())}:{p(now.getMinutes())}:{p(now.getSeconds())}</>;
}

/* ── Sparkline SVG (static points string) ─────────────────────────────── */
function Spark({ points, stroke }) {
  return (
    <svg width="44" height="14" viewBox="0 0 44 14" style={{ flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
    </svg>
  );
}

/* ── Live sparkline: points array 0–14, newest at right ───────────────── */
function LiveSpark({ points, stroke }) {
  if (!points.length) return <svg width="44" height="14" viewBox="0 0 44 14" style={{ flexShrink: 0 }} />;
  const w = 44, h = 14;
  const n = points.length;
  const pts = points.map((y, i) => `${(i / Math.max(1, n - 1)) * w},${h - Math.max(0, Math.min(h, y))}`).join(' ');
  return (
    <svg width="44" height="14" viewBox="0 0 44 14" style={{ flexShrink: 0 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}

/* ── Key Metrics with realistic live movement ─────────────────────────── */
const KEY_METRICS_CONFIG = [
  { label: 'ACTIVE THREATS',  baseVal: 12,  min: 9,  max: 15,  color: '#ef4444', unit: '', fixed: false },
  { label: 'DRONES DEPLOYED', baseVal: 2,   min: 1,  max: 3,   color: '#22c55e', unit: '', fixed: true },
  { label: 'AREA MONITORED',  baseVal: 243, min: 238, max: 248, color: '#f97316', unit: ' ha', fixed: false },
  { label: 'AVG RESPONSE',    baseVal: 4.2, min: 3.6, max: 4.8, color: '#facc15', unit: ' m', fixed: false },
];

function KeyMetricsLive() {
  const [metrics, setMetrics] = useState(() =>
    KEY_METRICS_CONFIG.map(({ baseVal }) => ({
      val: baseVal,
      points: Array.from({ length: 18 }, (_, j) => 4 + (Math.sin(j * 0.5) * 3) + Math.random() * 2),
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m, i) => {
          const cfg = KEY_METRICS_CONFIG[i];
          const lastY = m.points[m.points.length - 1] ?? 7;
          const delta = (Math.random() - 0.5) * 1.8;
          const newY = Math.max(1.5, Math.min(12.5, lastY + delta));
          const newPoints = [...m.points.slice(1), newY];
          const valDelta = (Math.random() - 0.5) * (cfg.unit === ' m' ? 0.15 : cfg.unit === ' ha' ? 1.2 : 0.4);
          const newVal = cfg.fixed ? cfg.baseVal : Math.max(cfg.min, Math.min(cfg.max, m.val + valDelta));
          return { val: newVal, points: newPoints };
        })
      );
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {KEY_METRICS_CONFIG.map((cfg, i) => {
        const m = metrics[i];
        const val = cfg.fixed ? cfg.baseVal : m.val;
        const displayVal = cfg.unit === ' m' ? val.toFixed(1) : Math.round(val);
        return (
          <div key={cfg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'rgba(200,205,214,0.8)', letterSpacing: '0.08em' }}>{cfg.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, transition: 'opacity 0.2s' }}>
                {displayVal}{cfg.unit}
              </span>
              <LiveSpark points={m.points} stroke={cfg.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Live Feed: user camera (same feed on left and right) ─────────────── */
const videoStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};
function LiveFeedCamera() {
  const videoLeftRef  = useRef(null);
  const videoRightRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera not supported');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        [videoLeftRef.current, videoRightRef.current].forEach((el) => {
          if (el) {
            el.srcObject = s;
            el.play().catch(() => {});
          }
        });
      })
      .catch((err) => {
        setError(err.message || 'Camera access denied');
      });
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6,
      }}>
        <span className="material-icons-outlined" style={{ fontSize: 24, color: 'rgba(249,115,22,0.35)' }}>videocam_off</span>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.6)', textAlign: 'center', padding: '0 8px' }}>{error}</span>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
        <video ref={videoLeftRef} autoPlay playsInline muted style={videoStyle} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
        <video ref={videoRightRef} autoPlay playsInline muted style={videoStyle} />
      </div>
    </>
  );
}

/* ── Main dashboard ──────────────────────────────────────────────────── */
export default function ZeroStrikeDashboard() {
  const [entries, setEntries]     = useState(INIT_ENTRIES);
  const [viewState, setViewState] = useState(INIT_VIEW);
  const [drawMode, setDrawMode]   = useState(false);
  const [rectCurrent, setRectCurrent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState(''); // '' | 'loading' | 'error'
  const [searchTransitioning, setSearchTransitioning] = useState(false);
  const poolIdx        = useRef(0);
  const mapInstanceRef = useRef(null);
  const rectStart      = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q || !TOKEN) return;
    setSearchStatus('loading');
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${TOKEN}&limit=1`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      const feature = data.features?.[0];
      if (!feature) {
        setSearchStatus('error');
        return;
      }
      const [lng, lat] = feature.center;
      const bbox = feature.bbox;
      const map = mapInstanceRef.current;
      const duration = 2800; // Slower so we can appreciate the animation
      const onTransitionEnd = () => {
        const c = map?.getCenter();
        if (c) setViewState((prev) => ({ ...prev, longitude: c.lng, latitude: c.lat, zoom: map.getZoom() }));
        setTimeout(() => setSearchTransitioning(false), 400); // Let squares fade out
      };
      setSearchTransitioning(true);
      if (map && bbox && bbox.length === 4) {
        map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration });
        map.once('moveend', onTransitionEnd);
      } else if (map) {
        map.flyTo({ center: [lng, lat], zoom: 12, duration });
        map.once('moveend', onTransitionEnd);
      } else {
        setViewState((prev) => ({ ...prev, longitude: lng, latitude: lat, zoom: 12 }));
        setTimeout(() => setSearchTransitioning(false), 400);
      }
      setSearchStatus('');
    } catch (err) {
      setSearchStatus('error');
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      const t    = new Date().toTimeString().slice(0, 8);
      const pool = LIVE_POOL[poolIdx.current % LIVE_POOL.length];
      setEntries((prev) => [{ ...pool, time: t }, ...prev].slice(0, 50));
      poolIdx.current++;
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="zs-shell">
      <SquareCursor />

      {/* ── Full-screen Mapbox background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          onLoad={(evt) => { mapInstanceRef.current = evt.target; }}
          mapboxAccessToken={TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        />
      </div>

      {/* ── Search transition: squares fade in/out over the map ── */}
      {searchTransitioning && (
        <div className="zs-search-squares">
          {Array.from({ length: 120 }, (_, i) => (
            <div key={i} className="zs-search-square" />
          ))}
        </div>
      )}

      {/* ── UI layer ── */}
      <div className="zs-ui">

        {/* ── HEADER ── */}
        <header className="zs-header">
          {/* Left: logo + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30,
                background: '#f97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>ZS</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff' }}>
                ZeroStrike
              </span>
              <span style={{
                fontSize: 8, fontWeight: 600, letterSpacing: '0.12em',
                padding: '2px 6px',
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.3)',
                color: '#f97316',
              }}>
                MISSION CONTROL
              </span>
            </div>

            <form style={{ position: 'relative' }} onSubmit={handleSearch}>
              <span className="material-icons-outlined" style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                fontSize: 14, color: 'rgba(249,115,22,0.5)',
              }}>search</span>
              <input
                className="zs-search"
                placeholder="Search place or address…"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchStatus(''); }}
                onKeyDown={(e) => e.key === 'Escape' && (setSearchQuery(''), setSearchStatus(''))}
              />
              {searchStatus === 'loading' && (
                <span style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'rgba(249,115,22,0.7)' }}>Searching…</span>
              )}
              {searchStatus === 'error' && (
                <span style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: 'rgba(239,68,68,0.9)' }}>Not found</span>
              )}
            </form>
          </div>

          {/* Right: telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 10, letterSpacing: '0.08em' }}>
            {[
              ['air',      '7 M/S NW'],
              ['layers',   '243.4 HA'],
              ['wb_sunny', '36°C'],
            ].map(([icon, label]) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(200,205,214,0.7)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: 'rgba(249,115,22,0.7)' }}>{icon}</span>
                {label}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f97316' }}>
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>schedule</span>
              <LiveClock />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 9, color: '#22c55e', letterSpacing: '0.12em' }}>ONLINE</span>
            </div>
          </div>
        </header>

        {/* ── INFO BAR ── */}
        <div className="zs-infobar">
          <div className="zs-infobar-inner">

            {/* 1 — Empty slot */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: 'rgba(249,115,22,0.85)' }}>widgets</span>
                <span className="zs-section-label" style={{ color: 'rgba(249,115,22,0.85)' }}>Empty Slot</span>
                <span className="zs-badge zs-badge-empty" style={{ marginLeft: 'auto' }}>UNUSED</span>
              </div>
              <div style={{
                flex: 1, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px dashed rgba(249,115,22,0.25)',
              }}>
                <span className="material-icons-outlined" style={{ fontSize: 20, color: 'rgba(249,115,22,0.5)' }}>add</span>
              </div>
            </div>

            <div className="zs-col-sep" />

            {/* 2 — Global view */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>public</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Global View</span>
                <span className="zs-badge zs-badge-live" style={{ marginLeft: 'auto' }}>LIVE</span>
              </div>
              <div style={{ height: 64, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(249,115,22,0.3)', overflow: 'hidden' }}>
                <svg viewBox="0 0 360 140" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                  <rect width="360" height="140" fill="transparent" />
                  {/* Grid lines */}
                  <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  <line x1="180" y1="0" x2="180" y2="140" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  {/* Continents */}
                  {[
                    'M40,30 L80,25 L100,35 L105,50 L95,60 L80,65 L65,60 L50,55 L40,45Z',
                    'M85,70 L95,68 L105,80 L100,100 L90,110 L80,105 L75,90 L80,75Z',
                    'M160,25 L180,22 L190,28 L185,40 L175,42 L165,38 L160,30Z',
                    'M165,50 L185,48 L195,55 L190,80 L180,95 L170,90 L160,75 L160,60Z',
                    'M200,20 L260,18 L280,30 L275,50 L260,55 L240,50 L220,45 L200,40 L195,30Z',
                    'M270,80 L295,78 L300,90 L290,100 L275,98 L268,90Z',
                  ].map((d, i) => (
                    <path key={i} d={d} fill="rgba(249,115,22,0.22)" stroke="rgba(249,115,22,0.7)" strokeWidth="0.8" />
                  ))}
                  <circle cx="75"  cy="45"  r="2.5" fill="#f97316" opacity="1" />
                  <circle cx="175" cy="35"  r="2.5" fill="#f97316" opacity="1" />
                  <circle cx="250" cy="38"  r="2"   fill="#22c55e" opacity="1" />
                  <circle cx="285" cy="88"  r="2"   fill="#22c55e" opacity="1" />
                </svg>
              </div>
            </div>

            <div className="zs-col-sep" />

            {/* 3 — Key metrics (live values + moving sparklines) */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>analytics</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Key Metrics</span>
                <span style={{ marginLeft: 'auto', fontSize: 8, color: 'rgba(249,115,22,0.9)', letterSpacing: '0.1em' }}>REAL-TIME</span>
              </div>
              <KeyMetricsLive />
            </div>

            <div className="zs-col-sep" />

            {/* 4 — CCTV feed */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>videocam</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Live Feed</span>
                <span className="zs-badge zs-badge-rec zs-pulse" style={{ marginLeft: 'auto' }}>● REC</span>
              </div>
              <div className="zs-cctv" style={{ height: 64, background: '#000', border: '1px solid rgba(249,115,22,0.35)', position: 'relative' }}>
                <LiveFeedCamera />
                {/* Center divider — splits feed into two screens */}
                <div style={{
                  position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
                  transform: 'translateX(-50%)',
                  background: 'rgba(249,115,22,0.5)',
                  zIndex: 10, pointerEvents: 'none',
                }} />
                {/* Scanlines overlay */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(249,115,22,0.04) 2px, rgba(249,115,22,0.04) 4px)',
                }} />
                {/* Corner brackets */}
                {[
                  { top: 4, left: 4, borderTop: '1.5px solid rgba(249,115,22,0.85)', borderLeft: '1.5px solid rgba(249,115,22,0.85)' },
                  { top: 4, right: 4, borderTop: '1.5px solid rgba(249,115,22,0.85)', borderRight: '1.5px solid rgba(249,115,22,0.85)' },
                  { bottom: 4, left: 4, borderBottom: '1.5px solid rgba(249,115,22,0.85)', borderLeft: '1.5px solid rgba(249,115,22,0.85)' },
                  { bottom: 4, right: 4, borderBottom: '1.5px solid rgba(249,115,22,0.85)', borderRight: '1.5px solid rgba(249,115,22,0.85)' },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 8, height: 8, ...s }} />
                ))}
                <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 7, color: 'rgba(249,115,22,0.75)', letterSpacing: '0.06em' }}>
                  <LiveClock /> — CAM-04
                </div>
                <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 7, color: 'rgba(239,68,68,0.9)', letterSpacing: '0.1em' }}>REC</div>
              </div>
            </div>

          </div>

          {/* 5 — Drone status */}
          <div className="zs-drone-col">
            <div className="zs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Hatch pattern */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.14,
                background: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(249,115,22,0.8) 4px, rgba(249,115,22,0.8) 5px)',
              }} />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px 4px' }}>
                <video
                  src="/drone%20rotating.MP4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: 70, objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(249,115,22,0.4)) brightness(1.3) contrast(1.1)', display: 'block' }}
                  title="ZeroStrike Drone"
                />
              </div>
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px',
                background: 'rgba(0,0,0,0.5)',
                borderTop: '1px solid rgba(249,115,22,0.35)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons-outlined" style={{ fontSize: 12, color: '#22c55e' }}>battery_charging_full</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>4364<span style={{ color: 'rgba(200,205,214,0.4)', fontWeight: 400 }}>/4666 mAh</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons-outlined" style={{ fontSize: 12, color: '#60a5fa' }}>thermostat</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>0<span style={{ color: 'rgba(200,205,214,0.4)', fontWeight: 400 }}>°C</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN ROW ── */}
        <div className="zs-main">

          {/* Map pass-through area — pointer-events none so scroll/zoom reach Mapbox */}
          <div className="zs-map-section" style={{ pointerEvents: drawMode ? 'auto' : 'none' }}>
            {/* Draw-rectangle overlay: when active, capture mouse and zoom to selection */}
            {drawMode && (
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 15, cursor: 'crosshair',
                }}
                onMouseDown={(e) => {
                  rectStart.current = { x: e.clientX, y: e.clientY };
                  setRectCurrent({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  if (rectStart.current) setRectCurrent({ x: e.clientX, y: e.clientY });
                }}
                onMouseUp={() => {
                  const map = mapInstanceRef.current;
                  const start = rectStart.current;
                  if (!map || !start || !rectCurrent) return;
                  const x1 = start.x, y1 = start.y, x2 = rectCurrent.x, y2 = rectCurrent.y;
                  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2), minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
                  if (maxX - minX < 8 || maxY - minY < 8) {
                    rectStart.current = null;
                    setRectCurrent(null);
                    setDrawMode(false);
                    return;
                  }
                  const sw = map.unproject([minX, maxY]);
                  const ne = map.unproject([maxX, minY]);
                  map.fitBounds([sw, ne], { padding: 40, duration: 800 });
                  rectStart.current = null;
                  setRectCurrent(null);
                  setDrawMode(false);
                }}
                onMouseLeave={() => {
                  if (rectStart.current) {
                    rectStart.current = null;
                    setRectCurrent(null);
                  }
                }}
              >
                {rectStart.current && rectCurrent && (
                  <div
                    style={{
                      position: 'fixed',
                      left: Math.min(rectStart.current.x, rectCurrent.x),
                      top: Math.min(rectStart.current.y, rectCurrent.y),
                      width: Math.abs(rectCurrent.x - rectStart.current.x),
                      height: Math.abs(rectCurrent.y - rectStart.current.y),
                      border: '2px solid rgba(249,115,22,0.9)',
                      background: 'rgba(249,115,22,0.12)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            )}
            {/* Grid + vignette over the map */}
            <div className="zs-map-grid" />
            <div className="zs-map-vignette" />

            {/* Left toolbar */}
            <div className="zs-toolbar" style={{ pointerEvents: 'auto' }}>
              {['near_me', 'grid_view', 'map', 'eco'].map((icon, i) => (
                <button key={icon} className={`zs-tb-btn${i === 1 ? ' zs-active' : ''}`}>
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>{icon}</span>
                </button>
              ))}
              <div className="zs-tb-sep" />
              <button className="zs-tb-btn">
                <span className="material-icons-outlined" style={{ fontSize: 16 }}>settings</span>
              </button>
            </div>

            {/* Top-left: overview label */}
            <div className="zs-map-label zs-map-label-top" style={{ pointerEvents: 'none' }}>
              <div style={{ width: 5, height: 5, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              Mission Map Active
            </div>

            {/* Coordinate readout — bottom left */}
            <div className="zs-map-coord" style={{
              position: 'absolute', bottom: 10, left: 58, zIndex: 20, pointerEvents: 'none',
              padding: '6px 10px',
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              {[
                ['LAT', viewState.latitude.toFixed(5) + '°'],
                ['LON', viewState.longitude.toFixed(5) + '°'],
                ['ZOOM', viewState.zoom.toFixed(1)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.55)', letterSpacing: '0.12em', minWidth: 32 }}>{label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#c8cdd6', letterSpacing: '0.04em' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Bottom-right map controls */}
            <div className="zs-map-label zs-map-label-bottom" style={{ pointerEvents: 'auto' }}>
              <button className="zs-label-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>open_with</span>
                PAN
              </button>
              <button
                className={`zs-label-btn${drawMode ? ' zs-active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => setDrawMode((d) => !d)}
                title={drawMode ? 'Cancel and click again to exit draw mode' : 'Draw a rectangle to zoom to area'}
              >
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>crop_free</span>
                {drawMode ? 'DRAW…' : 'ZOOM'}
              </button>
              <button className="zs-label-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>lock</span>
                LOCK
              </button>
            </div>
          </div>

          {/* ── Agent Activity Sidebar ── */}
          <div className="zs-sidebar">

            {/* Header */}
            <div className="zs-sidebar-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 20, height: 20,
                  background: 'rgba(249,115,22,0.15)',
                  border: '1px solid rgba(249,115,22,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons-outlined" style={{ fontSize: 12, color: '#f97316' }}>psychology</span>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>
                    Agent Activity
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(200,205,214,0.35)', letterSpacing: '0.1em', marginTop: 1 }}>
                    AUTONOMOUS DECISION STREAM
                  </div>
                </div>
                <span className="zs-badge zs-badge-live" style={{ marginLeft: 'auto' }}>LIVE</span>
              </div>
            </div>

            {/* Feed */}
            <div className="zs-sidebar-feed" style={{ padding: '6px 0' }}>
              {entries.map((entry, i) => (
                <div key={`${entry.time}-${i}`} className="zs-entry">
                  <span className="material-icons-outlined" style={{ fontSize: 13, color: entry.color, flexShrink: 0, marginTop: 1 }}>
                    {entry.icon}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'rgba(200,205,214,0.85)', lineHeight: 1.45 }}>{entry.msg}</div>
                    <div style={{ fontSize: 8, color: 'rgba(200,205,214,0.3)', marginTop: 2, letterSpacing: '0.06em' }}>{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Command input */}
            <div className="zs-sidebar-input">
              <span className="material-icons-outlined" style={{ fontSize: 13, color: 'rgba(249,115,22,0.4)' }}>terminal</span>
              <input
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 10, color: '#c8cdd6', fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.04em',
                }}
                placeholder="SEND COMMAND TO AGENT..."
              />
              <button style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(249,115,22,0.5)', transition: 'color 0.15s' }}>
                <span className="material-icons-outlined" style={{ fontSize: 14 }}>send</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="zs-footer">
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
              <div style={{ width: 5, height: 5, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              System Link: Stable
            </span>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>GPS: 14 Satellites · RTK Fixed</span>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>Proj: Mercator · WGS84</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>Telemetry: 100ms</span>
            <span style={{ color: '#f97316', fontWeight: 600 }}>Admin: MF-CONTROLLER-ALPHA</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
