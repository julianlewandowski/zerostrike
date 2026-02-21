import { useState } from 'react';
import '../styles/fleet.css';
import StatusIndicator from '../components/hud/StatusIndicator';
import DroneCard from '../components/fleet/DroneCard';
import DroneDetailPanel from '../components/fleet/DroneDetailPanel';
import { useData } from '../context/DataContext';

const FILTERS = [
  { key: 'all',      label: 'ALL' },
  { key: 'deployed', label: 'DEPLOYED' },
  { key: 'standby',  label: 'STANDBY' },
  { key: 'warning',  label: 'WARNING' },
];

export default function Fleet() {
  const { fleet } = useData();
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all'
    ? fleet
    : fleet.filter((d) => d.status === filter);

  const deployed  = fleet.filter((d) => d.status === 'deployed').length;
  const standby   = fleet.filter((d) => d.status === 'standby').length;
  const warning   = fleet.filter((d) => d.status === 'warning').length;
  const avgBatt   = fleet.length
    ? Math.round(fleet.reduce((s, d) => s + d.battery, 0) / fleet.length)
    : 0;

  function handleCardClick(drone) {
    setSelected(selected?.id === drone.id ? null : drone);
  }

  return (
    <div className="fleet-page">
      {/* Header bar */}
      <div className="fleet-header">
        <div className="fleet-title">
          <StatusIndicator status="online" />
          Fleet Overview
        </div>

        <div className="fleet-stat-group">
          <div className="fleet-stat">
            <span className="fleet-stat-value">{fleet.length}</span>
            <span className="fleet-stat-label">Total</span>
          </div>
          <div className="fleet-stat">
            <span className="fleet-stat-value green">{deployed}</span>
            <span className="fleet-stat-label">Deployed</span>
          </div>
          <div className="fleet-stat">
            <span className="fleet-stat-value">{standby}</span>
            <span className="fleet-stat-label">Standby</span>
          </div>
          {warning > 0 && (
            <div className="fleet-stat">
              <span className="fleet-stat-value orange">{warning}</span>
              <span className="fleet-stat-label">Warning</span>
            </div>
          )}
          <div className="fleet-stat">
            <span className="fleet-stat-value cyan">{avgBatt}%</span>
            <span className="fleet-stat-label">Avg Battery</span>
          </div>
        </div>

        {/* Filters */}
        <div className="fleet-filters">
          {FILTERS.map(({ key, label }) => {
            const count = key === 'all'
              ? fleet.length
              : fleet.filter((d) => d.status === key).length;
            return (
              <button
                key={key}
                className={`fleet-filter-btn ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="fleet-body">
        <div className="fleet-grid">
          {filtered.map((drone) => (
            <DroneCard
              key={drone.id}
              drone={drone}
              selected={selected?.id === drone.id}
              onClick={() => handleCardClick(drone)}
            />
          ))}
        </div>

        {selected && (
          <DroneDetailPanel
            drone={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
