import { motion } from 'framer-motion';

const cards = [
  {
    id: '01',
    category: 'prediction engine',
    title: 'XGBoost fire ignition model',
    accent: 'cyan',
    tags: ['XGBoost', 'ERA5', 'NDVI', 'CAPE'],
    body: 'Trained on 28,000 real fire ignitions from the 2020 California Lightning Complex, correlated with ERA5 atmospheric reanalysis data. The model predicts ignition probability from atmospheric conditions — CAPE, dewpoint depression, cloud base height, relative humidity — plus terrain slope and vegetation dryness (NDVI). Validated at 78% precision on held-out data. When retrained with real ERA5 weather features, the fire-weather signal nearly doubled in importance, confirming the model learns real physics.',
  },
  {
    id: '02',
    category: 'platform',
    title: 'three-layer severity engine',
    accent: 'cyan',
    tags: ['Flask', 'Firebase', 'GeoJSON', 'React', 'Mapbox GL'],
    body: 'A fuel risk scorer (vegetation dryness + terrain slope + fuel type), an atmospheric scorer (CAPE, dewpoint depression, cloud base height, humidity, precipitation efficiency), and a consequence scorer (population proximity + infrastructure density). These combine into a composite severity grid at 0.05° resolution (~5.5 km cells). Storm cells are projected forward over a 6-hour horizon using haversine kinematics, and collision detection flags where projected storms intersect high-severity terrain. The pipeline outputs prioritized GeoJSON threat zones served via a Flask REST API on Firebase Cloud Functions, visualised in a mission-control dashboard with live drone positions, trajectory projections, and collision overlays.',
  },
  {
    id: '03',
    category: 'agentic layer',
    title: 'Claude autonomous decision loop',
    accent: 'amber',
    tags: ['Claude', 'Tool Use', 'Fleet Telemetry', 'Satellite'],
    body: 'Claude powers the autonomous decision loop with full access to the live threat map, storm trajectories, drone fleet telemetry, and satellite imagery. When a collision is detected, the agent autonomously selects the optimal drone, calculates an intercept route, and dispatches it — replacing the multi-hour human decision bottleneck with a sub-second response.',
  },
  {
    id: '04',
    category: 'hardware',
    title: 'drone integration & payload release',
    accent: 'red',
    tags: ['DJI MSDK v5', 'Android', 'ESP32', 'Firestore'],
    body: 'Since DJI exposes no direct API, we built a custom Android app on DJI MSDK v5 that intercepts the phone-to-remote control link, injecting programmatic waypoint missions. An ESP32-controlled servo mechanism mounted on a DJI Mini 4 Pro releases cloud seeding payload at calculated release points. Firestore acts as the real-time message bus bridging the dashboard, the Android app, and the ESP32 across separate networks.',
  },
];

const accentMap = {
  cyan: {
    tag: 'text-cyan-400 border-cyan-900 bg-cyan-950/40',
    num: 'text-cyan-400',
    dot: 'bg-cyan-400',
    border: 'group-hover:border-cyan-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.06)]',
    label: 'text-cyan-500',
  },
  amber: {
    tag: 'text-amber-400 border-amber-900 bg-amber-950/40',
    num: 'text-amber-400',
    dot: 'bg-amber-400',
    border: 'group-hover:border-amber-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(251,191,36,0.06)]',
    label: 'text-amber-500',
  },
  red: {
    tag: 'text-rose-400 border-rose-900 bg-rose-950/40',
    num: 'text-rose-400',
    dot: 'bg-rose-400',
    border: 'group-hover:border-rose-500/50',
    glow: 'group-hover:shadow-[0_0_30px_rgba(251,113,133,0.06)]',
    label: 'text-rose-500',
  },
};

const BuildCard = ({ card, index }) => {
  const a = accentMap[card.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative bg-black/30 border border-slate-800 rounded-sm p-8 transition-all duration-300 ${a.border} ${a.glow}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className={`font-mono text-[10px] tracking-[0.25em] uppercase ${a.label}`}>
            {card.category}
          </span>
          <div className="mt-1">
            <span className={`font-mono text-[10px] tracking-widest ${a.num} opacity-40`}>{card.id}</span>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full mt-1 ${a.dot} opacity-70`} />
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-xl leading-snug mb-4 group-hover:text-slate-100 transition-colors">
        {card.title}
      </h3>

      {/* Body */}
      <p className="text-slate-500 text-sm leading-relaxed mb-6 font-mono">
        {card.body}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {card.tags.map(tag => (
          <span
            key={tag}
            className={`text-[10px] font-mono tracking-widest uppercase border rounded-sm px-2 py-0.5 ${a.tag}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const HowWeBuiltIt = () => {
  return (
    <section className="relative w-full py-32 bg-[#020408] border-t border-slate-800/50 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-cyan-900/4 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-900/40" />
            <span className="font-mono text-[11px] text-cyan-500 tracking-[0.3em] uppercase font-semibold">
              how we built it
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-900/40" />
          </div>

          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              under the hood
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              five layers of real engineering — from atmospheric physics to embedded hardware — built over a weekend at HackEurope 2026.
            </p>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <BuildCard key={card.id} card={card} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowWeBuiltIt;
