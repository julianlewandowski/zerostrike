import StatusIndicator from '../hud/StatusIndicator';
import { useData } from '../../context/DataContext';

const DOT_STATUS = {
  deployed: 'online',
  standby:  'standby',
  warning:  'warning',
  offline:  'offline',
};

function batteryColor(pct) {
  if (pct <= 25) return 'var(--red)';
  if (pct <= 50) return 'var(--orange)';
  return 'var(--text-dim)';
}

export default function LeftSidebar() {
  const { fleet } = useData();

  return (
    <aside className="left-sidebar">
      {/* System Health */}
      <div className="sidebar-section">
        <div className="panel-header">
          <StatusIndicator status="online" />
          System Health
        </div>
        <div className="sidebar-section-body">
          <div className="metric-row">
            <span className="metric-label">Prediction Model</span>
            <span className="metric-value green">ONLINE</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Drone Uplink</span>
            <span className="metric-value cyan">
              {fleet.filter((d) => d.status !== 'standby').length} / {fleet.length} ACTIVE
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Sensor Grid</span>
            <span className="metric-value cyan">142 NODES</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Comms Latency</span>
            <span className="metric-value">42 ms</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Last Sync</span>
            <span className="metric-value">00:00:03 AGO</span>
          </div>
        </div>
      </div>

      {/* Fleet */}
      <div className="sidebar-section grow">
        <div className="panel-header">
          <StatusIndicator status="online" />
          Drone Fleet
          <span className="panel-header-label">{fleet.length} UNITS</span>
        </div>
        <div className="drone-list">
          {fleet.map((drone) => (
            <div key={drone.id} className={`drone-card ${drone.status}`}>
              <StatusIndicator status={DOT_STATUS[drone.status] ?? 'offline'} />
              <div className="drone-card-meta">
                <div className="drone-card-row">
                  <span className="drone-id">{drone.id}</span>
                  <span className={`drone-status ${drone.status}`}>
                    {drone.status.toUpperCase()}
                  </span>
                </div>
                <div className="drone-card-row">
                  <span className="drone-mission">{drone.mission}</span>
                  <span className="drone-battery" style={{ color: batteryColor(drone.battery) }}>
                    {drone.battery}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24h Mission Stats */}
      <div className="sidebar-section">
        <div className="panel-header">
          Mission Stats
          <span className="panel-header-label">24 H</span>
        </div>
        <div className="sidebar-section-body">
          <div className="metric-row">
            <span className="metric-label">Deployments</span>
            <span className="metric-value cyan">14</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Neutralized</span>
            <span className="metric-value green">11</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Success Rate</span>
            <span className="metric-value green">78.6%</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Area Protected</span>
            <span className="metric-value">12,400 km²</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
