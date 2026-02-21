import { NavLink } from 'react-router-dom';
import StatusIndicator from '../hud/StatusIndicator';
import SystemClock from '../hud/SystemClock';
import { useData } from '../../context/DataContext';

export default function TopNav() {
  const { fleet, threats } = useData();

  const deployedCount = fleet.filter((d) => d.status === 'deployed').length;
  const activeThreats = threats.filter(
    (t) => t.level === 'critical' || t.level === 'warning',
  ).length;
  const alertCount    = threats.filter((t) => t.level === 'critical').length;

  return (
    <header className="top-nav">
      {/* Logo */}
      <div className="top-nav-logo">
        <div className="top-nav-wordmark">ZEROSTRIKE</div>
        <div className="top-nav-subtitle">Wildfire Tactical Command // v1.0.0</div>
      </div>

      <div className="top-nav-divider" />

      {/* Screen navigation */}
      <nav className="top-nav-links">
        <NavLink to="/dashboard" end className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/fleet"     className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Fleet</NavLink>
        <NavLink to="/predictions" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>Predictions</NavLink>
      </nav>

      <div className="top-nav-divider" />

      {/* System status pills */}
      <div className="top-nav-status-group">
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span className="top-nav-status-pair"><span>SYS</span> <span className="top-nav-status-value">NOMINAL</span></span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span className="top-nav-status-pair">
            <span>DRONES</span>
            <span className="top-nav-status-value">{deployedCount} / {fleet.length}</span>
          </span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status={activeThreats > 0 ? 'warning' : 'online'} />
          <span className="top-nav-status-pair">
            <span>THREATS</span>
            <span
              className="top-nav-status-value"
              style={{ color: activeThreats > 0 ? 'var(--orange)' : undefined }}
            >
              {activeThreats} ACTIVE
            </span>
          </span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span className="top-nav-status-pair"><span>COVERAGE</span> <span className="top-nav-status-value">94.2%</span></span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span className="top-nav-status-pair"><span>PRED MODEL</span> <span className="top-nav-status-value">ONLINE</span></span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="top-nav-right">
        <div className="alert-badge">
          <StatusIndicator status={alertCount > 0 ? 'warning' : 'online'} />
          {alertCount > 0 ? `${alertCount} ALERT${alertCount > 1 ? 'S' : ''}` : 'NO ALERTS'}
        </div>
        <div className="top-nav-divider" />
        <SystemClock />
      </div>
    </header>
  );
}
