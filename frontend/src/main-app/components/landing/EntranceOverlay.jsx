import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_LINES = [
  { text: 'ZEROSTRIKE TACTICAL SYSTEMS v1.0.0',            highlight: true },
  { text: 'INITIALIZING THREAT PREDICTION ENGINE......... OK' },
  { text: 'LOADING NEURAL CLIMATE MODEL (4.2 GB)......... OK' },
  { text: 'DRONE FLEET HANDSHAKE: 7/9 UNITS ONLINE...... OK' },
  { text: 'SATELLITE UPLINK: AES-256 / ENCRYPTED......... OK' },
  { text: 'COVERAGE ZONE EU-THETA: 94.2% NOMINAL......... OK' },
  { text: '──────────────────────────────────────────────────', sep: true },
  { text: 'ACCESS GRANTED — ENTERING COMMAND CENTER',         special: true },
];

const LINE_INTERVAL = 360; // ms between lines

export default function EntranceOverlay() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timers = [];

    // Reveal lines one-by-one
    BOOT_LINES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), i * LINE_INTERVAL)
      );
    });

    // Show progress bar after first line
    timers.push(setTimeout(() => setShowProgress(true), LINE_INTERVAL * 0.5));

    // Kick progress to 100% (CSS transition handles the smooth fill)
    timers.push(setTimeout(() => setProgress(100), LINE_INTERVAL * 0.6));

    // Begin exit after all lines visible
    const exitStart = BOOT_LINES.length * LINE_INTERVAL + 700;
    timers.push(setTimeout(() => setExiting(true), exitStart));
    timers.push(setTimeout(() => navigate('/dashboard'), exitStart + 750));

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className={`entrance-overlay${exiting ? ' exiting' : ''}`}>
      <div className="entrance-terminal">
        {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
          <div
            key={i}
            className={[
              'entrance-line',
              line.highlight ? 'highlight' : '',
              line.special  ? 'special'   : '',
              line.sep      ? 'sep'        : '',
            ].filter(Boolean).join(' ')}
          >
            {!line.sep && <span className="entrance-prompt">&gt;</span>}
            <span>{line.text}</span>
            {i === visibleCount - 1 && !line.sep && !line.special && (
              <span className="entrance-cursor" />
            )}
          </div>
        ))}

        {showProgress && (
          <div className="entrance-progress-wrap">
            <div
              className="entrance-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
