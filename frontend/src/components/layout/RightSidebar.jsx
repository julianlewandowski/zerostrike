import StatusIndicator from '../hud/StatusIndicator';
import { useData } from '../../context/DataContext';

const EVENTS = [
  { id: 1,  time: '14:23:01', code: 'STRK-009', level: 'critical', msg: 'Dry lightning detected — Attica, probability 91%, dispatch recommended' },
  { id: 2,  time: '14:21:44', code: 'DPLT-014', level: 'info',     msg: 'ZS-02 deployed to Valencia seeding coordinates' },
  { id: 3,  time: '14:19:30', code: 'WTHR-027', level: 'warning',  msg: 'Humidity drop to 8% — Provence approaching fire weather threshold' },
  { id: 4,  time: '14:17:12', code: 'SEED-013', level: 'info',     msg: 'ZS-01 seeding complete — Zone Alpha mission success' },
  { id: 5,  time: '14:14:55', code: 'STRK-008', level: 'info',     msg: 'Storm cell dissipated — Zone Alpha neutralized' },
  { id: 6,  time: '14:11:03', code: 'BATT-004', level: 'warning',  msg: 'ZS-04 battery critical (22%) — auto RTB initiated' },
  { id: 7,  time: '14:08:29', code: 'STRK-007', level: 'warning',  msg: 'Lightning risk elevated — Valencia coast, monitoring' },
  { id: 8,  time: '14:05:51', code: 'DPLT-013', level: 'info',     msg: 'ZS-06 assigned patrol — Aegean sector' },
  { id: 9,  time: '14:03:17', code: 'SENS-102', level: 'info',     msg: 'Sensor grid refresh — 142 active nodes confirmed' },
  { id: 10, time: '13:58:44', code: 'PRED-031', level: 'warning',  msg: 'Storm cluster forming — Sardinia watch advisory' },
];

function formatEta(etaMin) {
  if (etaMin == null) return 'MONITORING';
  const h = Math.floor(etaMin / 60).toString().padStart(2, '0');
  const m = (etaMin % 60).toString().padStart(2, '0');
  return `ETA ${h}:${m}:00`;
}

function formatCoord(lat, lng) {
  const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr} ${lngStr}`;
}

export default function RightSidebar() {
  const { threats } = useData();

  return (
    <aside className="right-sidebar">
      {/* Active Threats */}
      <div className="sidebar-section">
        <div className="panel-header">
          <StatusIndicator status="critical" />
          Active Threats
          <span className="panel-header-label">{threats.length} DETECTED</span>
        </div>
        <div className="sidebar-section-body" style={{ gap: 6 }}>
          {threats.map((t) => {
            const isOrange = t.level !== 'critical';
            return (
              <div key={t.id} className={`threat-card ${isOrange ? 'orange' : ''}`}>
                <div className="threat-card-header">
                  <span className="threat-id">{t.id}</span>
                  <span className="threat-probability">{t.probability}%</span>
                </div>
                <div className="threat-location">{formatCoord(t.lat, t.lng)}</div>
                <div className="threat-eta">{formatEta(t.etaMin)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Atmosphere */}
      <div className="sidebar-section">
        <div className="panel-header">
          Atmosphere
          <span className="panel-header-label">LIVE</span>
        </div>
        <div className="sidebar-section-body">
          <div className="metric-row">
            <span className="metric-label">Rel. Humidity</span>
            <span className="metric-value orange">8%</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Wind</span>
            <span className="metric-value">24 kn NE</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Temp</span>
            <span className="metric-value orange">41°C</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Active Storm Cells</span>
            <span className="metric-value red">7</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Fire Weather Index</span>
            <span className="metric-value red">EXTREME</span>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="sidebar-section grow">
        <div className="panel-header">
          Event Log
          <span className="panel-header-label">LIVE</span>
        </div>
        <div className="event-log">
          {EVENTS.map((e) => (
            <div key={e.id} className={`event-entry ${e.level}`}>
              <span className="event-time">{e.time}</span>
              <span className="event-code">{e.code}</span>
              <span className="event-message">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
