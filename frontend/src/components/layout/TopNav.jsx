import { NavLink } from 'react-router-dom';
import StatusIndicator from '../hud/StatusIndicator';
import SystemClock from '../hud/SystemClock';

export default function TopNav() {
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
          <span>SYS</span>
          <span className="top-nav-status-value">NOMINAL</span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span>DRONES</span>
          <span className="top-nav-status-value">7 / 9</span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="warning" />
          <span>THREATS</span>
          <span className="top-nav-status-value" style={{ color: 'var(--orange)' }}>3 ACTIVE</span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span>COVERAGE</span>
          <span className="top-nav-status-value">94.2%</span>
        </div>
        <div className="top-nav-status-item">
          <StatusIndicator status="online" />
          <span>PRED MODEL</span>
          <span className="top-nav-status-value">ONLINE</span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="top-nav-right">
        <div className="alert-badge">
          <StatusIndicator status="warning" />
          3 ALERTS
        </div>
        <div className="top-nav-divider" />
        <SystemClock />
      </div>
    </header>
  );
}
