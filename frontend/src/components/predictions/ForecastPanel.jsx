import {
  LineChart, Line,
  CartesianGrid, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { FORECAST_24H, MODEL_STATS } from '../../data/predictionData';

const THREAT_LINES = [
  { key: 'STRK-009', color: '#ff2020' },
  { key: 'STRK-010', color: '#ff6a00' },
  { key: 'STRK-007', color: '#e6c20a' },
  { key: 'STRK-004', color: '#00aabf' },
];

const AXIS_TICK = { fill: '#3a5a68', fontSize: 8, fontFamily: 'var(--font-mono)' };

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(3,6,8,0.95)',
      border: '1px solid rgba(0,229,255,0.25)',
      padding: '6px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, letterSpacing: '0.05em' }}>
          {entry.dataKey}: {entry.value}%
        </div>
      ))}
    </div>
  );
}

export default function ForecastPanel() {
  return (
    <div className="forecast-panel">
      {/* 24h forecast chart */}
      <div className="forecast-section" style={{ paddingBottom: 14 }}>
        <div className="forecast-section-title">24H Probability Forecast</div>

        <div className="forecast-legend">
          {THREAT_LINES.map(({ key, color }) => (
            <div key={key} className="forecast-legend-item">
              <div className="forecast-legend-dot" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
              {key}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={FORECAST_24H} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
            <CartesianGrid stroke="rgba(0,229,255,0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="transparent"
              tick={AXIS_TICK}
              interval={5}
            />
            <YAxis
              domain={[0, 100]}
              stroke="transparent"
              tick={AXIS_TICK}
              width={24}
            />
            <ReferenceLine y={70} stroke="rgba(255,106,0,0.2)" strokeDasharray="4 4" />
            <ReferenceLine y={85} stroke="rgba(255,32,32,0.2)"  strokeDasharray="4 4" />
            <Tooltip content={<ForecastTooltip />} />
            {THREAT_LINES.map(({ key, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: color, stroke: 'none' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: 'var(--text-dim)' }}>
            <div style={{ width: 16, height: 1, background: 'rgba(255,106,0,0.4)' }} />
            HIGH (70%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: 'var(--text-dim)' }}>
            <div style={{ width: 16, height: 1, background: 'rgba(255,32,32,0.4)' }} />
            CRITICAL (85%)
          </div>
        </div>
      </div>

      {/* Current conditions */}
      <div className="forecast-section">
        <div className="forecast-section-title">Current Conditions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: 'Rel. Humidity',      value: '8%',       className: 'orange' },
            { label: 'Wind',               value: '24 kn NE', className: '' },
            { label: 'Temperature',        value: '41°C',     className: 'orange' },
            { label: 'Active Storm Cells', value: '7',        className: 'red' },
            { label: 'Fire Weather Index', value: 'EXTREME',  className: 'red' },
            { label: 'Fuel Moisture',      value: '4%',       className: 'red' },
          ].map(({ label, value, className }) => (
            <div key={label} className="model-stat-row">
              <span className="model-stat-label">{label}</span>
              <span className={`model-stat-value ${className}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model stats */}
      <div className="forecast-section">
        <div className="forecast-section-title">Model Performance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: '24h Accuracy',   value: `${MODEL_STATS.accuracy24h}%`, className: 'green' },
            { label: 'False Positive', value: `${MODEL_STATS.falsePositive}%`, className: '' },
            { label: 'Total Preds',    value: MODEL_STATS.totalPredictions,    className: 'cyan' },
            { label: 'Data Points',    value: MODEL_STATS.dataPoints,           className: '' },
            { label: 'Version',        value: MODEL_STATS.version,              className: 'cyan' },
            { label: 'Last Trained',   value: MODEL_STATS.lastTrained,          className: '' },
          ].map(({ label, value, className }) => (
            <div key={label} className="model-stat-row">
              <span className="model-stat-label">{label}</span>
              <span className={`model-stat-value ${className}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
