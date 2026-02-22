const ITEMS = [
  { code: 'STRK-009', level: 'crit', text: 'DRY LIGHTNING DETECTED — ZONE C7 // PROBABILITY 91% // DISPATCH RECOMMENDED' },
  { code: 'WTHR-027', level: 'warn', text: 'HUMIDITY DROP TO 8% — ZONE A APPROACHING FIRE WEATHER THRESHOLD' },
  { code: 'DPLT-014', level: '',     text: 'ZS-02 DEPLOYED — SEEDING MISSION ZONE B INITIATED' },
  { code: 'SEED-013', level: '',     text: 'ZS-01 SEEDING COMPLETE — ZONE A STORM CELL NEUTRALIZED // MISSION SUCCESS' },
  { code: 'BATT-004', level: 'warn', text: 'ZS-04 BATTERY CRITICAL 22% — AUTO RTB PROTOCOL ACTIVATED' },
  { code: 'PRED-031', level: 'warn', text: 'STORM CLUSTER FORMING — SECTOR NORTH // WATCH ADVISORY ISSUED' },
  { code: 'SENS-102', level: '',     text: 'SENSOR GRID UPDATED — 142 ACTIVE NODES // COVERAGE NOMINAL' },
];

// Duplicate for seamless loop
const DISPLAY = [...ITEMS, ...ITEMS];

export default function TickerBar() {
  return (
    <div className="ticker-bar">
      <div className="ticker-label">SIGINT</div>
      <div className="ticker-track">
        <div className="ticker-content">
          {DISPLAY.map((item, i) => (
            <span key={i} className="ticker-item">
              <span className={`ticker-code ${item.level}`}>[{item.code}]</span>
              {item.text}
              <span className="ticker-sep"> // </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
