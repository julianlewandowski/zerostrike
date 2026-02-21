import StatusIndicator from '../hud/StatusIndicator';

function formatEta(minutes) {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function etaClass(minutes, status) {
  if (status === 'neutralized') return '';
  if (minutes <= 30) return 'urgent';
  if (minutes <= 60) return 'soon';
  return '';
}

function confClass(conf) {
  if (conf >= 85) return 'high-conf';
  if (conf >= 70) return 'med-conf';
  return 'low-conf';
}

const COLUMNS = [
  { key: 'id',          label: 'Event ID',   sortable: false },
  { key: 'zone',        label: 'Zone',       sortable: false },
  { key: 'prob',        label: 'Prob %',     sortable: true  },
  { key: 'risk',        label: 'Risk',       sortable: true  },
  { key: 'etaMin',      label: 'ETA',        sortable: true  },
  { key: 'humidity',    label: 'Humid / Wind', sortable: false },
  { key: 'conf',        label: 'Conf %',     sortable: true  },
  { key: 'recommendation', label: 'Action', sortable: false  },
  { key: 'status',      label: 'Status',     sortable: false },
];

export default function PredictionTable({ data, sortKey, sortDir, onSort }) {
  return (
    <div className="pred-table-wrap">
      <table className="pred-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={[
                  col.sortable ? 'sortable' : '',
                  sortKey === col.key ? 'sort-active' : '',
                ].join(' ')}
                onClick={() => col.sortable && onSort(col.key)}
              >
                {col.label}
                {col.sortable && (
                  <span className={`sort-icon ${sortKey === col.key ? 'active' : ''}`}>
                    {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.id} className={`${p.risk} ${p.status}`}>
              {/* ID */}
              <td><span className="pred-id">{p.id}</span></td>

              {/* Zone */}
              <td>
                <div style={{ color: 'var(--text-primary)', fontSize: 11 }}>{p.zone}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: 9, marginTop: 1 }}>{p.coords}</div>
              </td>

              {/* Probability */}
              <td>
                <span className={`pred-prob ${p.prob === 0 ? 'zero' : p.risk}`}>
                  {p.prob === 0 ? 'NEUT' : `${p.prob}%`}
                </span>
              </td>

              {/* Risk badge */}
              <td><span className={`risk-badge ${p.risk}`}>{p.risk.toUpperCase()}</span></td>

              {/* ETA */}
              <td>
                <span className={`pred-eta ${etaClass(p.etaMin, p.status)}`}>
                  {formatEta(p.etaMin)}
                </span>
              </td>

              {/* Conditions */}
              <td>
                <div style={{ fontSize: 10 }}>
                  <span style={{ color: p.humidity <= 12 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                    {p.humidity}% RH
                  </span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>/</span>
                  <span>{p.wind}</span>
                </div>
              </td>

              {/* Confidence */}
              <td>
                <span className={`pred-conf ${confClass(p.conf)}`}>{p.conf}%</span>
              </td>

              {/* Recommendation */}
              <td><span className={`rec-badge ${p.recommendation}`}>{p.recommendation}</span></td>

              {/* Status */}
              <td>
                <div className={`pred-status ${p.status}`}>
                  <StatusIndicator
                    status={
                      p.status === 'dispatching' ? 'online'
                      : p.status === 'neutralized' ? 'offline'
                      : 'standby'
                    }
                  />
                  {p.status.toUpperCase()}
                  {p.updatedMin && (
                    <span style={{ color: 'var(--text-dim)', marginLeft: 4 }}>
                      {p.updatedMin}m ago
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
