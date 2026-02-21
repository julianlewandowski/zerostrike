import { useState, useMemo } from 'react';
import '../styles/predictions.css';
import StatusIndicator from '../components/hud/StatusIndicator';
import PredictionTable from '../components/predictions/PredictionTable';
import ForecastPanel from '../components/predictions/ForecastPanel';
import { useData } from '../context/DataContext';

const RISK_FILTERS = [
  { key: 'all',      label: 'ALL' },
  { key: 'critical', label: 'CRITICAL', cls: 'red' },
  { key: 'high',     label: 'HIGH',     cls: 'orange' },
  { key: 'medium',   label: 'MEDIUM',   cls: 'yellow' },
  { key: 'low',      label: 'LOW' },
];

const STATUS_FILTERS = [
  { key: 'all',         label: 'ALL' },
  { key: 'active',      label: 'ACTIVE' },
  { key: 'dispatching', label: 'DISPATCHING', cls: 'green' },
  { key: 'neutralized', label: 'NEUTRALIZED' },
];

export default function Predictions() {
  const { predictions } = useData();
  const [riskFilter,   setRiskFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey,      setSortKey]      = useState('prob');
  const [sortDir,      setSortDir]      = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    return predictions
      .filter((p) => riskFilter === 'all'   || p.risk   === riskFilter)
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => {
        const mult = sortDir === 'asc' ? 1 : -1;
        return mult * (a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0);
      });
  }, [predictions, riskFilter, statusFilter, sortKey, sortDir]);

  // Aggregate stats
  const critical    = predictions.filter((p) => p.risk === 'critical' && p.status !== 'neutralized').length;
  const dispatching = predictions.filter((p) => p.status === 'dispatching').length;
  const neutralized = predictions.filter((p) => p.status === 'neutralized').length;
  const dispatchRec = predictions.filter((p) => p.recommendation === 'DISPATCH' && p.status === 'active').length;

  return (
    <div className="predictions-page">
      {/* Header */}
      <div className="predictions-header">
        <div className="pred-title">
          <StatusIndicator status="online" />
          Prediction Feed
          <span className="pred-live-badge">LIVE</span>
        </div>

        <div className="pred-stat-group">
          <div className="pred-stat">
            <span className="pred-stat-value">{predictions.length}</span>
            <span className="pred-stat-label">Total Events</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-value red">{critical}</span>
            <span className="pred-stat-label">Critical</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-value orange">{dispatchRec}</span>
            <span className="pred-stat-label">Dispatch Rec.</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-value yellow">{dispatching}</span>
            <span className="pred-stat-label">Dispatching</span>
          </div>
          <div className="pred-stat">
            <span className="pred-stat-value green">{neutralized}</span>
            <span className="pred-stat-label">Neutralized</span>
          </div>
        </div>

        {/* Filters */}
        <div className="pred-filters">
          {RISK_FILTERS.map(({ key, label, cls }) => (
            <button
              key={key}
              className={`pred-filter-btn ${riskFilter === key ? `active ${cls ?? ''}` : ''}`}
              onClick={() => setRiskFilter(key)}
            >
              {label}
            </button>
          ))}

          <div className="pred-filter-sep" />

          {STATUS_FILTERS.map(({ key, label, cls }) => (
            <button
              key={key}
              className={`pred-filter-btn ${statusFilter === key ? `active ${cls ?? ''}` : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="predictions-body">
        <PredictionTable
          data={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <ForecastPanel />
      </div>
    </div>
  );
}
