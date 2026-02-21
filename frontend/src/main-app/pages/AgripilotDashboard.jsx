/**
 * AgripilotDashboard — AGRIPILOT Active Flight UI
 *
 * Wraps the real TacticalMap (Mapbox + live engine data) inside the
 * AGRIPILOT chrome (header, info bar, sidebar, footer).
 *
 * Routes to /dashboard — bypasses CommandShell so no TopNav/TickerBar overlap.
 */

import { useMemo } from 'react';
import TacticalMap from '../components/map/TacticalMap';
import { DataProvider, useData } from '../context/DataContext';
import '../styles/agripilot.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// ── Top-level: inject DataProvider ───────────────────────────────────────────
export default function AgripilotDashboard() {
  return (
    <DataProvider>
      <AgripilotShell />
    </DataProvider>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
function AgripilotShell() {
  const { fleet, threats, isLive, lastUpdated } = useData();

  const deployed    = useMemo(() => fleet.filter((d) => d.status === 'deployed').length, [fleet]);
  const criticalCt  = useMemo(() => threats.filter((t) => t.level === 'critical').length, [threats]);
  const avgBattery  = useMemo(() => {
    if (!fleet.length) return 0;
    return Math.round(fleet.reduce((s, d) => s + d.battery, 0) / fleet.length);
  }, [fleet]);
  const activeDrone = useMemo(() => fleet.find((d) => d.status === 'deployed') || fleet[0], [fleet]);
  const updatedStr  = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="ag-shell">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header
        className="ag-glass"
        style={{
          height: 56,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left: logo + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32, height: 32,
                background: '#f97316',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span className="material-icons-outlined" style={{ color: '#fff', fontSize: 20 }}>agriculture</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
              Agripilot
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <span
              className="material-icons-outlined"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="search"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.06)',
                height: 32,
                paddingLeft: 34,
                paddingRight: 16,
                fontSize: 13,
                width: 256,
                outline: 'none',
                color: '#fff',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Right: live telemetry */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            fontSize: 12, fontFamily: "'JetBrains Mono', monospace", opacity: 0.85,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>air</span>
            <span>7 m/s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>layers</span>
            <span>{(deployed * 80).toFixed(1)} ha</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>warning_amber</span>
            <span style={{ color: criticalCt > 0 ? '#ef4444' : '#94a3b8' }}>
              {criticalCt} CRITICAL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-icons-outlined" style={{ fontSize: 16 }}>schedule</span>
            <span>{updatedStr}</span>
          </div>
          {/* Live/Mock badge */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '2px 10px',
              border: `1px solid ${isLive ? 'rgba(34,197,94,0.4)' : 'rgba(100,116,139,0.3)'}`,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: isLive ? '#22c55e' : '#64748b',
            }}
          >
            <span className="ag-pulse" style={{ background: isLive ? '#22c55e' : '#475569' }} />
            {isLive ? 'LIVE' : 'MOCK'}
          </div>
        </div>
      </header>

      {/* ── INFO BAR ────────────────────────────────────────────────── */}
      <div
        className="ag-glass"
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }}
      >
        {/* Boxes 1-4 grouped */}
        <div
          className="ag-glass-card"
          style={{
            flex: 1,
            display: 'flex',
            margin: '12px 0 12px 12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* 1. Field Scan */}
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 18, color: '#cbd5e1' }}>water_drop</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>
                    Field Scan - #19
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    border: '1px solid rgba(34,197,94,0.6)',
                    color: '#4ade80',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                  }}>
                    ACTIVE
                  </span>
                </div>
                <div className="ag-info-sub">MF-214</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#64748b' }}>00:00</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#374151', letterSpacing: '0.3em' }}>- - -</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#64748b' }}>00:00</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.03)' }}>
              {['play_arrow','pause','mic','stop'].map((icon) => (
                <span key={icon} className="material-icons-outlined" style={{ fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}>{icon}</span>
              ))}
            </div>
          </div>

          <div className="ag-col-divider" />

          {/* 2. Camera Setup */}
          <div style={{ flex: 1, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 18, color: '#cbd5e1' }}>settings_remote</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>
                    Camera Setup
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    border: '1px solid rgba(249,115,22,0.6)',
                    color: '#f97316',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                  }}>
                    ACTION
                  </span>
                </div>
                <div className="ag-info-sub">MF-214</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Mode',  opts: ['Auto', 'Manual'],       active: 0 },
                { label: 'Lens',  opts: ['Precision', 'Wide'],    active: 1 },
              ].map(({ label, opts, active }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: 2, border: '1px solid rgba(255,255,255,0.04)' }}>
                    {opts.map((opt, i) => (
                      <button
                        key={opt}
                        style={{
                          padding: '6px 16px',
                          background: i === active ? '#f97316' : 'transparent',
                          color: i === active ? '#fff' : '#64748b',
                          fontWeight: i === active ? 700 : 400,
                          fontSize: 10,
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ag-col-divider" />

          {/* 3. Coverage — real data */}
          <div style={{ flex: 1, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 18, color: '#cbd5e1' }}>layers</span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Coverage</span>
                <div className="ag-info-sub">ACTIVE ZONE</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Deployed',  value: `${deployed} / ${fleet.length}`,    unit: 'drones' },
                { label: 'Avg Batt',  value: avgBattery,                          unit: '%' },
                { label: 'Threats',   value: threats.length,                      unit: 'active' },
              ].map(({ label, value, unit }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', fontSize: 11,
                    paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff' }}>
                    {value} <span style={{ color: '#64748b' }}>{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ag-col-divider" />

          {/* 4. Recordings */}
          <div style={{ flex: 1, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 18, color: '#cbd5e1' }}>save</span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Recordings</span>
                <div className="ag-info-sub">SN-309</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 10, textAlign: 'center' }}>
              {[{ label: 'Photos', v: '--' }, { label: 'Videos', v: '--' }, { label: 'Pinpoints', v: '--' }].map(({ label, v }) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.25)', padding: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ color: '#64748b', fontSize: 8, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Drone Status — real fleet data */}
        <div style={{ width: 300, flexShrink: 0, padding: 12 }}>
          <div
            className="ag-glass-card"
            style={{ position: 'relative', overflow: 'hidden', height: '100%', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}
          >
            {/* diagonal stripe texture */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: 'repeating-linear-gradient(-45deg,transparent,transparent 4px,white 4px,white 5px)' }} />
            {/* Fleet summary */}
            <div style={{ position: 'relative', zIndex: 1, padding: '12px 16px', flex: 1 }}>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Fleet Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {fleet.slice(0, 6).map((d) => (
                  <div
                    key={d.id}
                    style={{
                      padding: '4px 8px',
                      border: `1px solid ${d.status === 'deployed' ? 'rgba(34,197,94,0.4)' : d.status === 'warning' ? 'rgba(249,115,22,0.4)' : 'rgba(100,116,139,0.2)'}`,
                      fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                      color: d.status === 'deployed' ? '#4ade80' : d.status === 'warning' ? '#f97316' : '#64748b',
                    }}
                  >
                    {d.id}
                  </div>
                ))}
              </div>
            </div>
            {/* Battery row */}
            <div
              style={{
                position: 'relative', zIndex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'rgba(0,0,0,0.3)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons-outlined" style={{ color: '#22c55e', fontSize: 14 }}>battery_charging_full</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {activeDrone?.battery ?? '--'}
                  <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>% avg</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-icons-outlined" style={{ color: '#60a5fa', fontSize: 14 }}>flight</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {deployed}
                  <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}> deployed</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Map area — real TacticalMap */}
        <section style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <TacticalMap />
        </section>

        {/* Right sidebar */}
        <div
          className="ag-glass"
          style={{ width: 280, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.04)' }}
        >
          <aside
            className="ag-glass-sidebar"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24, color: '#fff' }}>
                Spray Configuration
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 8 }}>
                  Template
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '8px 12px',
                      fontSize: 12,
                      appearance: 'none',
                      outline: 'none',
                      color: '#cbd5e1',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option>No preset selected</option>
                  </select>
                  <span
                    className="material-icons-outlined"
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#64748b', pointerEvents: 'none' }}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Threat summary fed from live data */}
              {threats.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                    Active Threats
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {threats.slice(0, 4).map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '6px 10px',
                          background: 'rgba(0,0,0,0.2)',
                          border: `1px solid ${t.level === 'critical' ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.15)'}`,
                          fontSize: 10,
                        }}
                      >
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: t.level === 'critical' ? '#f87171' : '#fb923c' }}>
                          {t.id}
                        </span>
                        <span style={{ color: '#64748b' }}>{t.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state / placeholder */}
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '40px 0',
                  border: '2px dashed rgba(255,255,255,0.06)',
                  opacity: 0.4,
                }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 36, marginBottom: 8 }}>grid_view</span>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: 4 }}>
                  Select a template
                </p>
                <p style={{ fontSize: 10, color: '#64748b' }}>Choose a spray template to begin</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        className="ag-glass"
        style={{
          height: 32,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em', textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 24 }}>
          <span className={isLive ? 'ag-footer-live' : 'ag-footer-mock'} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="ag-pulse" style={{ background: isLive ? '#22c55e' : '#475569' }} />
            {isLive ? 'Engine: Live' : 'Engine: Mock data'}
          </span>
          <span style={{ color: '#64748b' }}>GPS: 14 Satellites (Precise)</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span style={{ color: '#64748b' }}>Telemetry Refresh: 0.1s</span>
          <span className="ag-footer-brand">Admin Active: MF-CONTROLLER-ALPHA</span>
        </div>
      </footer>

    </div>
  );
}
