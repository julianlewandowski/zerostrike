import StatusIndicator from '../hud/StatusIndicator';

const BATTERY_COLOR = (pct) => {
  if (pct <= 25) return 'var(--red)';
  if (pct <= 50) return 'var(--orange)';
  return 'var(--green)';
};

const DOT_STATUS = {
  deployed: 'online',
  standby:  'standby',
  warning:  'warning',
  offline:  'offline',
};

export default function DroneCard({ drone, selected, onClick }) {
  const bColor = BATTERY_COLOR(drone.battery);
  const isActive = drone.status !== 'standby';

  return (
    <div
      className={`drone-card-fleet ${drone.status} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* ID + status */}
      <div className="card-header-row">
        <div className="card-drone-id">{drone.id}</div>
        <div className={`card-status-badge ${drone.status}`}>
          {drone.status.toUpperCase()}
        </div>
      </div>

      {/* Battery */}
      <div className="battery-bar-wrap">
        <div className="battery-bar-track">
          <div
            className="battery-bar-fill"
            style={{ width: `${drone.battery}%`, background: bColor, boxShadow: `0 0 6px ${bColor}60` }}
          />
        </div>
        <span className="battery-bar-pct" style={{ color: bColor }}>
          {drone.battery}%
        </span>
      </div>

      {/* Stats grid */}
      <div className="card-stats">
        <div className="card-stat-row">
          <span className="card-stat-label">Altitude</span>
          <span className="card-stat-value">{isActive ? `${drone.altitude} m` : '—'}</span>
        </div>
        <div className="card-stat-row">
          <span className="card-stat-label">Speed</span>
          <span className="card-stat-value">{isActive ? `${drone.speed} kn` : '—'}</span>
        </div>
        <div className="card-stat-row">
          <span className="card-stat-label">Heading</span>
          <span className="card-stat-value">{drone.heading}</span>
        </div>
        <div className="card-stat-row">
          <span className="card-stat-label">Payload</span>
          <span className="card-stat-value">{drone.payloadPct}%</span>
        </div>
      </div>

      {/* Mission */}
      <div className="card-mission">
        <StatusIndicator status={DOT_STATUS[drone.status]} />
        {drone.mission}
      </div>
    </div>
  );
}
