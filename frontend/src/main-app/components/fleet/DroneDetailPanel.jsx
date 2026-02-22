import {
  AreaChart, Area,
  LineChart, Line,
  CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';

function HudTooltip({ active, payload, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(3, 6, 8, 0.95)',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      padding: '3px 8px',
      fontSize: 9,
      color: 'var(--cyan)',
      letterSpacing: '0.1em',
      fontFamily: 'var(--font-mono)',
    }}>
      {payload[0].value}{unit}
    </div>
  );
}

const AXIS_TICK  = { fill: '#3a5a68', fontSize: 8, fontFamily: 'var(--font-mono)' };
const GRID_STYLE = { stroke: 'rgba(0,229,255,0.05)', strokeDasharray: '3 3' };

export default function DroneDetailPanel({ drone, onClose }) {
  const isActive = drone.status !== 'standby';
  const batteryColor = drone.battery <= 25 ? '#ff2020' : drone.battery <= 50 ? '#ff6a00' : '#00ff99';

  return (
    <div className="drone-detail-panel">
      {/* Header */}
      <div className="detail-header">
        <div className={`detail-drone-id ${drone.status === 'warning' ? 'orange' : ''}`}
          style={{ color: drone.status === 'warning' ? 'var(--orange)' : undefined }}>
          {drone.id}
        </div>
        <div className={`detail-status-badge ${drone.status}`}>
          {drone.status.toUpperCase()}
        </div>
        <button className="detail-close-btn" onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      <div className="detail-body">
        {/* Battery history */}
        <div className="detail-section">
          <div className="detail-section-title">Battery — 2H History</div>
          <div className="detail-chart-wrap">
            <ResponsiveContainer width="100%" height={88}>
              <AreaChart data={drone.batteryHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id={`batt-grad-${drone.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={batteryColor} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={batteryColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} vertical={false} />
                <XAxis
                  dataKey="t"
                  stroke="transparent"
                  tick={AXIS_TICK}
                  tickFormatter={(v) => v === 0 ? 'T-2h' : v === 120 ? 'NOW' : ''}
                  interval={12}
                />
                <YAxis domain={[0, 100]} stroke="transparent" tick={AXIS_TICK} width={22} />
                <Tooltip content={<HudTooltip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={batteryColor}
                  strokeWidth={1.5}
                  fill={`url(#batt-grad-${drone.id})`}
                  dot={false}
                  activeDot={{ r: 3, fill: batteryColor, stroke: 'none' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Altitude + Speed */}
        <div className="detail-section">
          <div className="detail-section-title">Telemetry — 2H</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div className="detail-chart-label">ALT (M)</div>
              <ResponsiveContainer width="100%" height={72}>
                <LineChart data={drone.altHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="t" stroke="transparent" tick={false} />
                  <YAxis stroke="transparent" tick={AXIS_TICK} width={22} />
                  <Tooltip content={<HudTooltip unit=" m" />} />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--cyan)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: 'var(--cyan)', stroke: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="detail-chart-label">SPD (KN)</div>
              <ResponsiveContainer width="100%" height={72}>
                <LineChart data={drone.speedHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid {...GRID_STYLE} vertical={false} />
                  <XAxis dataKey="t" stroke="transparent" tick={false} />
                  <YAxis stroke="transparent" tick={AXIS_TICK} width={22} />
                  <Tooltip content={<HudTooltip unit=" kn" />} />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--orange)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: 'var(--orange)', stroke: 'none' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Mission data */}
        <div className="detail-section">
          <div className="detail-section-title">Mission Data</div>
          <div className="detail-metrics">
            <div className="metric-row">
              <span className="metric-label">Mission</span>
              <span className="metric-value">{drone.mission}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Payload</span>
              <span className={`metric-value ${drone.payloadPct < 20 ? 'red' : drone.payloadPct < 50 ? 'orange' : 'cyan'}`}>
                {drone.payloadPct}%
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Flight Time</span>
              <span className="metric-value">{drone.flightTime}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Heading</span>
              <span className="metric-value">{drone.heading}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Position</span>
              <span className="metric-value" style={{ fontSize: 10 }}>
                {drone.lat.toFixed(2)}°N {Math.abs(drone.lng).toFixed(2)}°W
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="detail-actions">
        <button
          className="detail-action-btn"
          disabled={drone.status !== 'standby'}
        >
          DEPLOY
        </button>
        <button
          className="detail-action-btn orange"
          disabled={drone.status === 'standby'}
        >
          RTB
        </button>
        <button
          className="detail-action-btn"
          disabled={drone.status === 'standby'}
        >
          REASSIGN
        </button>
      </div>
    </div>
  );
}
