import { useState, useEffect } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function SystemClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = pad(now.getUTCHours());
  const m = pad(now.getUTCMinutes());
  const s = pad(now.getUTCSeconds());

  const yyyy = now.getUTCFullYear();
  const mo   = pad(now.getUTCMonth() + 1);
  const dd   = pad(now.getUTCDate());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <div className="system-clock">{h}:{m}:{s}</div>
      <div className="system-date">{yyyy}-{mo}-{dd} // UTC // OPR: CHIEF-01</div>
    </div>
  );
}
