import { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/zerostrike.css';

const TOKEN        = import.meta.env.VITE_MAPBOX_TOKEN;
// Add VITE_ANTHROPIC_API_KEY=sk-ant-... to your frontend/.env file
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL        = 'claude-sonnet-4-6';

/* ── Map init view ───────────────────────────────────────────────────── */
const INIT_VIEW = { longitude: -122.05, latitude: 37.41, zoom: 10.5, pitch: 0, bearing: 0 };

/* ── Guess city from coordinates ─────────────────────────────────────── */
function guessLocation(lat, lng) {
  if (lat > 52 && lat < 55 && lng > -8  && lng < -5)  return 'Dublin, Ireland';
  if (lat > 36 && lat < 39 && lng > -123 && lng < -121) return 'Bay Area, California, USA';
  if (lat > 51 && lat < 52 && lng > -1  && lng < 1)   return 'London, UK';
  if (lat > 48 && lat < 49 && lng > 2   && lng < 3)   return 'Paris, France';
  if (lat > 40 && lat < 42 && lng > -4  && lng < 4)   return 'Madrid Region, Spain';
  if (lat > 37 && lat < 38 && lng > 23  && lng < 24)  return 'Athens, Greece';
  return `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(3)}°${lng >= 0 ? 'E' : 'W'}`;
}

/* ── Build system prompt with live dashboard context ─────────────────── */
function buildSystemPrompt(ctx) {
  return `You are ZeroStrike Agent — an autonomous AI tactical intelligence system embedded in the ZeroStrike Wildfire Prevention Mission Control dashboard.

MISSION: Prevent wildfires by coordinating cloud-seeding drone deployment to neutralize dry lightning strike zones before ignition occurs. You work in real-time alongside human operators.

━━ LIVE DASHBOARD STATE ━━━━━━━━━━━━━━━━━━━━━━━━━━━
Map Focus     : ${ctx.location}
Coordinates   : ${ctx.lat}°N, ${ctx.lng}°${ctx.lngDir}
Zoom Level    : ${ctx.zoom}

THREAT STATUS
  Active Threats       : ${ctx.threats}
  Highest Risk Zone    : r25c52 (CRITICAL)
  Fire Weather Index   : 74 / 100
  Lightning prob (6h)  : 67%

FLEET STATUS
  Drones Deployed      : ${ctx.dronesDeployed} / 9 total
  Fleet Operational    : 7 / 9
  Drone Battery        : ${ctx.battery} / 4666 mAh
  Drone Core Temp      : ${ctx.droneTemp}°C
  Avg Response Time    : ${ctx.avgResponse} min

ATMOSPHERIC CONDITIONS
  Area Monitored       : ${ctx.area} ha
  Wind                 : 7 m/s NW
  Ambient Temp         : 36°C
  Humidity             : 14%

RECENT ACTIVITY LOG
${ctx.recentActivity}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have full access to and can coordinate:
- Drone fleet dispatch, recall, reroute, hold, and formation commands
- Atmospheric sensor network (12 stations, real-time telemetry)
- Satellite imagery and NOAA fire-weather model integration
- Cloud-seeding payload management (Silver Iodide canisters)
- No-fly zone enforcement and airspace deconfliction
- Threat classification and escalation protocols
- Mission logging and incident reporting

COMMUNICATION PROTOCOL
- Concise, tactical, decisive — think military brevity
- Reason carefully through complex multi-step decisions before acting
- When deploying assets: state action, rationale, ETA, coverage radius, success probability
- Flag decisions requiring human operator confirmation when high-consequence
- Respond in plain text (no markdown headers/bullets in responses, just clear sentences)`;
}

/* ── Stream from Claude API with extended thinking ───────────────────── */
async function streamClaude({ messages, systemPrompt, onThinking, onText, onDone, onError }) {
  if (!ANTHROPIC_KEY) {
    onError('VITE_ANTHROPIC_API_KEY not set. Add it to frontend/.env and restart the dev server.');
    return;
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        thinking: { type: 'enabled', budget_tokens: 8000 },
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.error?.message || msg; } catch {}
      onError(msg);
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';
    let blockType = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === 'content_block_start') {
            blockType = evt.content_block?.type ?? null;
          } else if (evt.type === 'content_block_delta') {
            if (blockType === 'thinking' && evt.delta?.thinking) onThinking(evt.delta.thinking);
            else if (blockType === 'text'    && evt.delta?.text)    onText(evt.delta.text);
          } else if (evt.type === 'message_stop') {
            onDone(); return;
          }
        } catch {}
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || 'Network error');
  }
}

/* ── Utilities ───────────────────────────────────────────────────────── */
const nowStr  = () => new Date().toTimeString().slice(0, 8);
let   _uid    = 0;
const nextId  = (pfx = 'msg') => `${pfx}-${++_uid}-${Date.now()}`;

/* ── Initial chat state ──────────────────────────────────────────────── */
const INITIAL_CHAT = [
  { id: nextId('s'), type: 'system', time: '14:19:19', msg: 'IR camera calibrated — thermal baseline set',    color: '#22d3ee' },
  { id: nextId('s'), type: 'system', time: '14:19:44', msg: 'Acoustic sensor ping — sector 4 nominal',        color: '#94a3b8' },
  { id: nextId('s'), type: 'system', time: '14:20:07', msg: 'LIDAR sweep — obstacle map updated',             color: '#22d3ee' },
  { id: nextId('s'), type: 'system', time: '14:20:35', msg: 'Reclassifying zone r25c52 → critical',           color: '#facc15' },
  {
    id: nextId('a'), type: 'assistant', status: 'done', time: '14:20:41',
    content: 'ZeroStrike Agent online. All systems nominal. Fleet: 7/9 drones operational, 2 deployed. Monitoring 243 ha across active threat zones. Lightning probability elevated at 67% for next 6h window. Ready for commands.',
    thinking: '',
  },
];

const LIVE_POOL = [
  { color: '#ef4444', msg: 'Motion spike: quadrant NW-3 active' },
  { color: '#60a5fa', msg: 'Drone-6 launched — heading bearing 045°' },
  { color: '#facc15', msg: 'Threat level adjusted: zone r18c22 → watch' },
  { color: '#94a3b8', msg: 'Full sweep complete — 97.3% coverage' },
  { color: '#ef4444', msg: 'Anomalous RF signature — triangulating' },
  { color: '#22d3ee', msg: 'Satellite uplink confirmed — data synced' },
  { color: '#f97316', msg: 'Cloud-seeding payload check complete — 94%' },
  { color: '#4ade80', msg: 'Route delta computed: sector 7 → corridor B' },
];

/* ── AgentMessage component ──────────────────────────────────────────── */
function AgentMessage({ msg }) {
  const [thinkingOpen, setThinkingOpen] = useState(false);

  if (msg.type === 'system') {
    return (
      <div style={{
        padding: '5px 10px', borderLeft: `2px solid ${msg.color}55`,
        transition: 'background 0.12s',
      }}>
        <div style={{ fontSize: 9, color: 'rgba(200,205,214,0.55)', lineHeight: 1.4 }}>{msg.msg}</div>
        <div style={{ fontSize: 7, color: 'rgba(200,205,214,0.2)', marginTop: 1, letterSpacing: '0.06em' }}>SYS · {msg.time}</div>
      </div>
    );
  }

  if (msg.type === 'user') {
    return (
      <div style={{ padding: '6px 10px 6px 24px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.28)',
          padding: '5px 8px', fontSize: 10,
          color: '#c8cdd6', letterSpacing: '0.03em', lineHeight: 1.45,
          maxWidth: '90%', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -1, right: -1, width: 5, height: 5, borderTop: '1.5px solid #f97316', borderRight: '1.5px solid #f97316' }} />
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.type === 'assistant') {
    const hasThinking = msg.thinking?.length > 0;
    const isActive    = msg.status === 'thinking' || msg.status === 'streaming';

    return (
      <div style={{ padding: '7px 10px' }}>
        {/* ── Thinking trace ── */}
        {(hasThinking || msg.status === 'thinking') && (
          <div style={{
            marginBottom: 5,
            border: '1px solid rgba(96,165,250,0.18)',
            background: 'rgba(96,165,250,0.04)',
          }}>
            <button
              onClick={() => setThinkingOpen(o => !o)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 7px', background: 'none', border: 'none',
                color: 'rgba(96,165,250,0.75)', fontSize: 8,
                letterSpacing: '0.1em', textAlign: 'left',
              }}
            >
              {msg.status === 'thinking'
                ? <div className="zs-thinking-spinner" />
                : <span className="material-icons-outlined" style={{ fontSize: 10 }}>
                    {thinkingOpen ? 'expand_less' : 'expand_more'}
                  </span>
              }
              {msg.status === 'thinking'
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>REASONING<span className="zs-cursor-blink" style={{ color: '#60a5fa' }}>▌</span></span>
                : `REASONING · ${msg.thinking.length.toLocaleString()} chars`
              }
            </button>
            {thinkingOpen && hasThinking && (
              <div style={{
                padding: '4px 8px 6px',
                fontSize: 8, color: 'rgba(96,165,250,0.5)',
                letterSpacing: '0.015em', lineHeight: 1.65,
                maxHeight: 140, overflowY: 'auto',
                borderTop: '1px solid rgba(96,165,250,0.1)',
                fontFamily: 'JetBrains Mono, monospace',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {msg.thinking}
              </div>
            )}
          </div>
        )}

        {/* ── Response text ── */}
        {(msg.content || msg.status === 'streaming' || msg.status === 'done') && (
          <div style={{
            fontSize: 10, color: '#c8cdd6',
            letterSpacing: '0.025em', lineHeight: 1.6,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {msg.content}
            {isActive && <span className="zs-cursor-blink">▌</span>}
          </div>
        )}

        {/* ── Error ── */}
        {msg.status === 'error' && (
          <div style={{ fontSize: 9, color: '#ef4444', letterSpacing: '0.04em' }}>{msg.content}</div>
        )}

        {/* ── Footer ── */}
        {msg.status === 'done' && (
          <div style={{ fontSize: 7, color: 'rgba(200,205,214,0.2)', marginTop: 3, letterSpacing: '0.06em' }}>
            AGENT · {msg.time}{msg.thinking?.length ? ` · ${msg.thinking.length.toLocaleString()} reasoning chars` : ''}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* ── Square cursor ───────────────────────────────────────────────────── */
function SquareCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div className="zs-cursor" style={{ left: pos.x, top: pos.y }}>
      <div className="zs-cursor-tl" /><div className="zs-cursor-tr" />
      <div className="zs-cursor-bl" /><div className="zs-cursor-br" />
      <div className="zs-cursor-h" /><div className="zs-cursor-v" />
      <div className="zs-cursor-dot" />
    </div>
  );
}

/* ── Live clock ──────────────────────────────────────────────────────── */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const p = (n) => String(n).padStart(2, '0');
  return <>{p(now.getHours())}:{p(now.getMinutes())}:{p(now.getSeconds())}</>;
}

/* ── Live sparkline ──────────────────────────────────────────────────── */
function LiveSpark({ points, stroke }) {
  if (!points.length) return <svg width="44" height="14" viewBox="0 0 44 14" style={{ flexShrink: 0 }} />;
  const w = 44, h = 14, n = points.length;
  const pts = points.map((y, i) => `${(i / Math.max(1, n - 1)) * w},${h - Math.max(0, Math.min(h, y))}`).join(' ');
  return (
    <svg width="44" height="14" viewBox="0 0 44 14" style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </svg>
  );
}

/* ── Key Metrics live ────────────────────────────────────────────────── */
const KEY_METRICS_CONFIG = [
  { label: 'ACTIVE THREATS',  baseVal: 12,  min: 9,  max: 15,  color: '#ef4444', unit: '',    fixed: false },
  { label: 'DRONES DEPLOYED', baseVal: 2,   min: 1,  max: 3,   color: '#22c55e', unit: '',    fixed: true  },
  { label: 'AREA MONITORED',  baseVal: 243, min: 238, max: 248, color: '#f97316', unit: ' ha', fixed: false },
  { label: 'AVG RESPONSE',    baseVal: 4.2, min: 3.6, max: 4.8, color: '#facc15', unit: ' m',  fixed: false },
];

function KeyMetricsLive() {
  const [metrics, setMetrics] = useState(() =>
    KEY_METRICS_CONFIG.map(({ baseVal }) => ({
      val: baseVal,
      points: Array.from({ length: 18 }, (_, j) => 4 + Math.sin(j * 0.5) * 3 + Math.random() * 2),
    }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m, i) => {
          const cfg    = KEY_METRICS_CONFIG[i];
          const lastY  = m.points[m.points.length - 1] ?? 7;
          const newY   = Math.max(1.5, Math.min(12.5, lastY + (Math.random() - 0.5) * 1.8));
          const newVal = cfg.fixed ? cfg.baseVal : Math.max(cfg.min, Math.min(cfg.max, m.val + (Math.random() - 0.5) * (cfg.unit === ' m' ? 0.15 : cfg.unit === ' ha' ? 1.2 : 0.4)));
          return { val: newVal, points: [...m.points.slice(1), newY] };
        })
      );
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {KEY_METRICS_CONFIG.map((cfg, i) => {
        const m = metrics[i];
        const val = cfg.fixed ? cfg.baseVal : m.val;
        const displayVal = cfg.unit === ' m' ? val.toFixed(1) : Math.round(val);
        return (
          <div key={cfg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'rgba(200,205,214,0.8)', letterSpacing: '0.08em' }}>{cfg.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{displayVal}{cfg.unit}</span>
              <LiveSpark points={m.points} stroke={cfg.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Live camera feed ────────────────────────────────────────────────── */
const videoStyle = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' };

function LiveFeedCamera() {
  const videoLeftRef  = useRef(null);
  const videoRightRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera not supported'); return; }
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        [videoLeftRef.current, videoRightRef.current].forEach((el) => {
          if (el) { el.srcObject = s; el.play().catch(() => {}); }
        });
      })
      .catch((err) => setError(err.message || 'Camera access denied'));
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, []);

  if (error) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f0f0f, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
        <span className="material-icons-outlined" style={{ fontSize: 24, color: 'rgba(249,115,22,0.35)' }}>videocam_off</span>
        <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.6)', textAlign: 'center', padding: '0 8px' }}>{error}</span>
      </div>
    );
  }
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
        <video ref={videoLeftRef} autoPlay playsInline muted style={videoStyle} />
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden' }}>
        <video ref={videoRightRef} autoPlay playsInline muted style={videoStyle} />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Main dashboard                                                        */
/* ══════════════════════════════════════════════════════════════════════ */
export default function ZeroStrikeDashboard() {
  /* ── Map state ── */
  const [viewState, setViewState]         = useState(INIT_VIEW);
  const [drawMode, setDrawMode]           = useState(false);
  const [rectCurrent, setRectCurrent]     = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchStatus, setSearchStatus]   = useState('');
  const [searchTransitioning, setSearchTransitioning] = useState(false);
  const mapInstanceRef = useRef(null);
  const rectStart      = useRef(null);

  /* ── Agent chat state ── */
  const [chatMessages, setChatMessages]   = useState(INITIAL_CHAT);
  const [agentInput, setAgentInput]       = useState('');
  const [isProcessing, setIsProcessing]   = useState(false);
  const historyRef   = useRef([]);   // Claude API conversation history
  const livePoolIdx  = useRef(0);
  const feedRef      = useRef(null);
  const processingRef = useRef(false);

  /* ── Auto-scroll chat feed ── */
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [chatMessages]);

  /* ── Live system-event ticker ── */
  useEffect(() => {
    const id = setInterval(() => {
      const pool = LIVE_POOL[livePoolIdx.current % LIVE_POOL.length];
      livePoolIdx.current++;
      setChatMessages((prev) => [...prev, { id: nextId('s'), type: 'system', time: nowStr(), ...pool }]);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  /* ── Build dashboard context snapshot ── */
  const getContext = () => {
    const lat = viewState.latitude;
    const lng = viewState.longitude;
    return {
      location:     guessLocation(lat, lng),
      lat:          lat.toFixed(4),
      lng:          Math.abs(lng).toFixed(4),
      lngDir:       lng >= 0 ? 'E' : 'W',
      zoom:         viewState.zoom.toFixed(1),
      threats:      12,
      dronesDeployed: 2,
      area:         243.4,
      avgResponse:  4.2,
      battery:      4364,
      droneTemp:    0,
      recentActivity: chatMessages
        .filter((m) => m.type === 'system')
        .slice(-5)
        .map((m) => `  [${m.time}] ${m.msg}`)
        .join('\n') || '  No recent events',
    };
  };

  /* ── Send message to Claude ── */
  const sendMessage = async () => {
    const text = agentInput.trim();
    if (!text || processingRef.current) return;

    setAgentInput('');
    processingRef.current = true;
    setIsProcessing(true);

    const now       = nowStr();
    const userId    = nextId('u');
    const agentId   = nextId('a');

    // Add user bubble immediately
    setChatMessages((prev) => [...prev, { id: userId, type: 'user', content: text, time: now }]);
    // Add agent placeholder
    setChatMessages((prev) => [...prev, { id: agentId, type: 'assistant', content: '', thinking: '', status: 'thinking', time: now }]);

    const apiMessages = [...historyRef.current, { role: 'user', content: text }];
    const systemPrompt = buildSystemPrompt(getContext());

    let accThinking = '';
    let accText     = '';

    await new Promise((resolve) => {
      streamClaude({
        messages: apiMessages,
        systemPrompt,
        onThinking: (chunk) => {
          accThinking += chunk;
          setChatMessages((prev) =>
            prev.map((m) => m.id === agentId ? { ...m, thinking: accThinking, status: 'thinking' } : m)
          );
        },
        onText: (chunk) => {
          accText += chunk;
          setChatMessages((prev) =>
            prev.map((m) => m.id === agentId ? { ...m, content: accText, status: 'streaming' } : m)
          );
        },
        onDone: () => {
          setChatMessages((prev) =>
            prev.map((m) => m.id === agentId ? { ...m, content: accText, thinking: accThinking, status: 'done' } : m)
          );
          // Update conversation history with thinking blocks preserved
          const assistantContent = [];
          if (accThinking) assistantContent.push({ type: 'thinking', thinking: accThinking });
          assistantContent.push({ type: 'text', text: accText });
          historyRef.current = [...apiMessages, { role: 'assistant', content: assistantContent }];
          resolve();
        },
        onError: (err) => {
          setChatMessages((prev) =>
            prev.map((m) => m.id === agentId ? { ...m, content: err, status: 'error' } : m)
          );
          resolve();
        },
      });
    });

    processingRef.current = false;
    setIsProcessing(false);
  };

  /* ── Map search ── */
  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q || !TOKEN) return;
    setSearchStatus('loading');
    try {
      const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${TOKEN}&limit=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      const feature = data.features?.[0];
      if (!feature) { setSearchStatus('error'); return; }
      const [lng, lat] = feature.center;
      const bbox = feature.bbox;
      const map  = mapInstanceRef.current;
      const dur  = 2800;
      const onEnd = () => {
        const c = map?.getCenter();
        if (c) setViewState((p) => ({ ...p, longitude: c.lng, latitude: c.lat, zoom: map.getZoom() }));
        setTimeout(() => setSearchTransitioning(false), 400);
      };
      setSearchTransitioning(true);
      if (map && bbox?.length === 4) { map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 60, duration: dur }); map.once('moveend', onEnd); }
      else if (map) { map.flyTo({ center: [lng, lat], zoom: 12, duration: dur }); map.once('moveend', onEnd); }
      else { setViewState((p) => ({ ...p, longitude: lng, latitude: lat, zoom: 12 })); setTimeout(() => setSearchTransitioning(false), 400); }
      setSearchStatus('');
    } catch { setSearchStatus('error'); }
  };

  /* ══════════════════════════════════════════════════════════════════ */
  /*  Render                                                            */
  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="zs-shell">
      <SquareCursor />

      {/* ── Full-screen Mapbox ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          onLoad={(evt) => { mapInstanceRef.current = evt.target; }}
          mapboxAccessToken={TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        />
      </div>

      {/* ── Search transition squares ── */}
      {searchTransitioning && (
        <div className="zs-search-squares">
          {Array.from({ length: 120 }, (_, i) => <div key={i} className="zs-search-square" />)}
        </div>
      )}

      {/* ── UI layer ── */}
      <div className="zs-ui">

        {/* ── HEADER ── */}
        <header className="zs-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>ZS</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff' }}>ZeroStrike</span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.12em', padding: '2px 6px', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                MISSION CONTROL
              </span>
            </div>
            <form style={{ position: 'relative' }} onSubmit={handleSearch}>
              <span className="material-icons-outlined" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'rgba(249,115,22,0.5)' }}>search</span>
              <input
                className="zs-search"
                placeholder="Search place or address…"
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchStatus(''); }}
                onKeyDown={(e) => e.key === 'Escape' && (setSearchQuery(''), setSearchStatus(''))}
              />
              {searchStatus === 'loading' && <span style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'rgba(249,115,22,0.7)' }}>Searching…</span>}
              {searchStatus === 'error'   && <span style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', fontSize: 9,  color: 'rgba(239,68,68,0.9)'   }}>Not found</span>}
            </form>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 10, letterSpacing: '0.08em' }}>
            {[['air', '7 M/S NW'], ['layers', '243.4 HA'], ['wb_sunny', '36°C']].map(([icon, label]) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(200,205,214,0.7)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: 'rgba(249,115,22,0.7)' }}>{icon}</span>
                {label}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f97316' }}>
              <span className="material-icons-outlined" style={{ fontSize: 14 }}>schedule</span>
              <LiveClock />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              <span style={{ fontSize: 9, color: '#22c55e', letterSpacing: '0.12em' }}>ONLINE</span>
            </div>
          </div>
        </header>

        {/* ── INFO BAR ── */}
        <div className="zs-infobar">
          <div className="zs-infobar-inner">

            {/* 1 — Empty slot */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: 'rgba(249,115,22,0.85)' }}>widgets</span>
                <span className="zs-section-label" style={{ color: 'rgba(249,115,22,0.85)' }}>Empty Slot</span>
                <span className="zs-badge zs-badge-empty" style={{ marginLeft: 'auto' }}>UNUSED</span>
              </div>
              <div style={{ flex: 1, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(249,115,22,0.25)' }}>
                <span className="material-icons-outlined" style={{ fontSize: 20, color: 'rgba(249,115,22,0.5)' }}>add</span>
              </div>
            </div>

            <div className="zs-col-sep" />

            {/* 2 — Global view */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>public</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Global View</span>
                <span className="zs-badge zs-badge-live" style={{ marginLeft: 'auto' }}>LIVE</span>
              </div>
              <div style={{ height: 64, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(249,115,22,0.3)', overflow: 'hidden' }}>
                <svg viewBox="0 0 360 140" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                  <line x1="0" y1="70" x2="360" y2="70" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  <line x1="180" y1="0" x2="180" y2="140" stroke="rgba(249,115,22,0.2)" strokeWidth="0.5" />
                  {['M40,30 L80,25 L100,35 L105,50 L95,60 L80,65 L65,60 L50,55 L40,45Z','M85,70 L95,68 L105,80 L100,100 L90,110 L80,105 L75,90 L80,75Z','M160,25 L180,22 L190,28 L185,40 L175,42 L165,38 L160,30Z','M165,50 L185,48 L195,55 L190,80 L180,95 L170,90 L160,75 L160,60Z','M200,20 L260,18 L280,30 L275,50 L260,55 L240,50 L220,45 L200,40 L195,30Z','M270,80 L295,78 L300,90 L290,100 L275,98 L268,90Z'].map((d, i) => (
                    <path key={i} d={d} fill="rgba(249,115,22,0.22)" stroke="rgba(249,115,22,0.7)" strokeWidth="0.8" />
                  ))}
                  <circle cx="75"  cy="45" r="2.5" fill="#f97316" /><circle cx="175" cy="35" r="2.5" fill="#f97316" />
                  <circle cx="250" cy="38" r="2"   fill="#22c55e" /><circle cx="285" cy="88" r="2"   fill="#22c55e" />
                </svg>
              </div>
            </div>

            <div className="zs-col-sep" />

            {/* 3 — Key metrics */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>analytics</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Key Metrics</span>
                <span style={{ marginLeft: 'auto', fontSize: 8, color: 'rgba(249,115,22,0.9)', letterSpacing: '0.1em' }}>REAL-TIME</span>
              </div>
              <KeyMetricsLive />
            </div>

            <div className="zs-col-sep" />

            {/* 4 — CCTV */}
            <div className="zs-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="material-icons-outlined" style={{ fontSize: 14, color: '#f97316' }}>videocam</span>
                <span className="zs-section-label" style={{ color: '#e2e8f0' }}>Live Feed</span>
                <span className="zs-badge zs-badge-rec zs-pulse" style={{ marginLeft: 'auto' }}>● REC</span>
              </div>
              <div className="zs-cctv" style={{ height: 64, background: '#000', border: '1px solid rgba(249,115,22,0.35)', position: 'relative' }}>
                <LiveFeedCamera />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%)', background: 'rgba(249,115,22,0.5)', zIndex: 10, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(249,115,22,0.04) 2px, rgba(249,115,22,0.04) 4px)' }} />
                {[{ top:4, left:4, borderTop:'1.5px solid rgba(249,115,22,0.85)', borderLeft:'1.5px solid rgba(249,115,22,0.85)' },{ top:4, right:4, borderTop:'1.5px solid rgba(249,115,22,0.85)', borderRight:'1.5px solid rgba(249,115,22,0.85)' },{ bottom:4, left:4, borderBottom:'1.5px solid rgba(249,115,22,0.85)', borderLeft:'1.5px solid rgba(249,115,22,0.85)' },{ bottom:4, right:4, borderBottom:'1.5px solid rgba(249,115,22,0.85)', borderRight:'1.5px solid rgba(249,115,22,0.85)' }].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: 8, height: 8, ...s }} />
                ))}
                <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 7, color: 'rgba(249,115,22,0.75)', letterSpacing: '0.06em' }}><LiveClock /> — CAM-04</div>
                <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 7, color: 'rgba(239,68,68,0.9)', letterSpacing: '0.1em' }}>REC</div>
              </div>
            </div>

          </div>

          {/* 5 — Drone panel */}
          <div className="zs-drone-col">
            <div className="zs-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.14, background: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(249,115,22,0.8) 4px, rgba(249,115,22,0.8) 5px)' }} />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 8px 4px' }}>
                <video src="/drone%20rotating.MP4" autoPlay loop muted playsInline
                  style={{ width: '100%', height: 70, objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(249,115,22,0.4)) brightness(1.3) contrast(1.1)', display: 'block' }} />
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(249,115,22,0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons-outlined" style={{ fontSize: 12, color: '#22c55e' }}>battery_charging_full</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>4364<span style={{ color: 'rgba(200,205,214,0.4)', fontWeight: 400 }}>/4666 mAh</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-icons-outlined" style={{ fontSize: 12, color: '#60a5fa' }}>thermostat</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>0<span style={{ color: 'rgba(200,205,214,0.4)', fontWeight: 400 }}>°C</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN ROW ── */}
        <div className="zs-main">

          {/* Map pass-through */}
          <div className="zs-map-section" style={{ pointerEvents: drawMode ? 'auto' : 'none' }}>
            {drawMode && (
              <div
                style={{ position: 'absolute', inset: 0, zIndex: 15, cursor: 'crosshair' }}
                onMouseDown={(e) => { rectStart.current = { x: e.clientX, y: e.clientY }; setRectCurrent({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => { if (rectStart.current) setRectCurrent({ x: e.clientX, y: e.clientY }); }}
                onMouseUp={() => {
                  const map = mapInstanceRef.current; const start = rectStart.current;
                  if (!map || !start || !rectCurrent) return;
                  const minX = Math.min(start.x, rectCurrent.x), maxX = Math.max(start.x, rectCurrent.x);
                  const minY = Math.min(start.y, rectCurrent.y), maxY = Math.max(start.y, rectCurrent.y);
                  if (maxX - minX < 8 || maxY - minY < 8) { rectStart.current = null; setRectCurrent(null); setDrawMode(false); return; }
                  map.fitBounds([map.unproject([minX, maxY]), map.unproject([maxX, minY])], { padding: 40, duration: 800 });
                  rectStart.current = null; setRectCurrent(null); setDrawMode(false);
                }}
                onMouseLeave={() => { if (rectStart.current) { rectStart.current = null; setRectCurrent(null); } }}
              >
                {rectStart.current && rectCurrent && (
                  <div style={{
                    position: 'fixed',
                    left: Math.min(rectStart.current.x, rectCurrent.x), top: Math.min(rectStart.current.y, rectCurrent.y),
                    width: Math.abs(rectCurrent.x - rectStart.current.x), height: Math.abs(rectCurrent.y - rectStart.current.y),
                    border: '2px solid rgba(249,115,22,0.9)', background: 'rgba(249,115,22,0.12)', pointerEvents: 'none',
                  }} />
                )}
              </div>
            )}
            <div className="zs-map-grid" />
            <div className="zs-map-vignette" />

            {/* Left toolbar */}
            <div className="zs-toolbar" style={{ pointerEvents: 'auto' }}>
              {['near_me', 'grid_view', 'map', 'eco'].map((icon, i) => (
                <button key={icon} className={`zs-tb-btn${i === 1 ? ' zs-active' : ''}`}>
                  <span className="material-icons-outlined" style={{ fontSize: 16 }}>{icon}</span>
                </button>
              ))}
              <div className="zs-tb-sep" />
              <button className="zs-tb-btn">
                <span className="material-icons-outlined" style={{ fontSize: 16 }}>settings</span>
              </button>
            </div>

            <div className="zs-map-label zs-map-label-top" style={{ pointerEvents: 'none' }}>
              <div style={{ width: 5, height: 5, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              Mission Map Active
            </div>

            <div className="zs-map-coord" style={{ position: 'absolute', bottom: 10, left: 58, zIndex: 20, pointerEvents: 'none', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[['LAT', viewState.latitude.toFixed(5) + '°'], ['LON', viewState.longitude.toFixed(5) + '°'], ['ZOOM', viewState.zoom.toFixed(1)]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 8, color: 'rgba(249,115,22,0.55)', letterSpacing: '0.12em', minWidth: 32 }}>{label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#c8cdd6', letterSpacing: '0.04em' }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="zs-map-label zs-map-label-bottom" style={{ pointerEvents: 'auto' }}>
              <button className="zs-label-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>open_with</span>PAN
              </button>
              <button className={`zs-label-btn${drawMode ? ' zs-active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setDrawMode((d) => !d)}>
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>crop_free</span>{drawMode ? 'DRAW…' : 'ZOOM'}
              </button>
              <button className="zs-label-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons-outlined" style={{ fontSize: 12 }}>lock</span>LOCK
              </button>
            </div>
          </div>

          {/* ══ AGENT ACTIVITY SIDEBAR ══════════════════════════════════ */}
          <div className="zs-sidebar">

            {/* Header */}
            <div className="zs-sidebar-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, background: isProcessing ? 'rgba(96,165,250,0.15)' : 'rgba(249,115,22,0.15)', border: `1px solid ${isProcessing ? 'rgba(96,165,250,0.35)' : 'rgba(249,115,22,0.35)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                  {isProcessing
                    ? <div className="zs-thinking-spinner" style={{ width: 11, height: 11 }} />
                    : <span className="material-icons-outlined" style={{ fontSize: 12, color: '#f97316' }}>psychology</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>ZeroStrike Agent</div>
                  <div style={{ fontSize: 8, letterSpacing: '0.1em', marginTop: 1, color: isProcessing ? 'rgba(96,165,250,0.7)' : 'rgba(200,205,214,0.35)', transition: 'color 0.3s' }}>
                    {isProcessing ? 'THINKING...' : 'STANDBY · claude-sonnet-4-6'}
                  </div>
                </div>
                <span className={`zs-badge ${isProcessing ? 'zs-badge-thinking' : 'zs-badge-live'}`} style={{ marginLeft: 'auto' }}>
                  {isProcessing ? 'ACTIVE' : 'LIVE'}
                </span>
              </div>
            </div>

            {/* Chat feed */}
            <div className="zs-sidebar-feed" ref={feedRef} style={{ padding: '4px 0' }}>
              {chatMessages.map((msg) => <AgentMessage key={msg.id} msg={msg} />)}
            </div>

            {/* Command input */}
            <form
              className="zs-sidebar-input"
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
              <span className="material-icons-outlined" style={{ fontSize: 13, color: isProcessing ? 'rgba(96,165,250,0.4)' : 'rgba(249,115,22,0.4)', transition: 'color 0.3s' }}>terminal</span>
              <input
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 10, color: '#c8cdd6', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}
                placeholder={isProcessing ? 'Agent is processing…' : 'Send command to agent…'}
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!agentInput.trim()}
                style={{ background: 'none', border: 'none', padding: 0, color: agentInput.trim() ? 'rgba(249,115,22,0.8)' : 'rgba(249,115,22,0.25)', transition: 'color 0.15s' }}
              >
                <span className="material-icons-outlined" style={{ fontSize: 14 }}>send</span>
              </button>
            </form>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="zs-footer">
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
              <div style={{ width: 5, height: 5, background: '#22c55e', animation: 'zs-pulse 1.4s ease-in-out infinite' }} />
              System Link: Stable
            </span>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>GPS: 14 Satellites · RTK Fixed</span>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>Proj: Mercator · WGS84</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ color: 'rgba(200,205,214,0.35)' }}>Telemetry: 100ms</span>
            <span style={{ color: '#f97316', fontWeight: 600 }}>Admin: MF-CONTROLLER-ALPHA</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
