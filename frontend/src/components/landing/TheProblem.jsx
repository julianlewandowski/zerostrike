import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const Stat = ({ value, label, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex flex-col items-start space-y-2">
      <motion.span 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay }}
        className="text-4xl md:text-5xl font-mono font-bold text-red-500 tracking-tighter"
      >
        {value}
      </motion.span>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
        className="text-sm text-slate-400 uppercase tracking-widest font-mono border-l-2 border-red-900/50 pl-3"
      >
        {label}
      </motion.span>
    </div>
  );
};

const TacticalMapVisual = () => {
  // Generate random "terrain" data points
  const terrainPath = "M0,600 L50,580 L120,590 L200,550 L300,570 L450,520 L550,540 L700,500 L850,520 L950,480 L1000,600 Z";
  
  return (
    <div className="relative w-full h-full bg-[#050a14] overflow-hidden">
      {/* 1. Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:160px_160px]" />

      {/* 2. Abstract Terrain / Topography Map (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        {/* Contour Lines */}
        <path d="M-100,400 Q200,300 400,450 T900,400" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
        <path d="M-100,450 Q200,350 400,500 T900,450" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M-100,500 Q200,400 400,550 T900,500" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.1" />
        
        {/* Danger Zone Polygon */}
        <path d="M300,200 L500,150 L600,300 L450,400 L250,350 Z" fill="rgba(239, 68, 68, 0.05)" stroke="rgba(239, 68, 68, 0.3)" strokeDasharray="4 4" />
      </svg>

      {/* 3. Fire Spread Visualization */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
        {/* Core Fire */}
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-red-600/20 rounded-full blur-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-48 h-48 bg-orange-600/10 rounded-full blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          
          {/* Digital Fire Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-red-500 rounded-full"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 200, 
                y: (Math.random() - 0.5) * 200, 
                opacity: 0 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Scanning Radar Line */}
      <motion.div 
        className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-red-500/50 to-transparent z-10"
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-red-500/10 to-transparent" />
      </motion.div>

      {/* 5. HUD Overlays */}
      <div className="absolute top-4 left-4 p-2 border border-red-900/50 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono text-red-400">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          ACTIVE IGNITION DETECTED
        </div>
        <div className="text-red-500/70">SECTOR 7G // UNCONTAINED</div>
      </div>

      <div className="absolute bottom-4 right-4 text-right">
        <div className="text-[10px] font-mono text-slate-500 mb-1">GROWTH RATE</div>
        <div className="text-2xl font-mono font-bold text-red-500 tracking-wider">
          <motion.span 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            +124
          </motion.span>
          <span className="text-sm ml-1 text-red-800">ha/hr</span>
        </div>
      </div>

      {/* Random Data Points */}
      <div className="absolute top-1/3 right-1/4 w-2 h-2 border border-cyan-500/50 rounded-full" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 border border-cyan-500/50 rounded-full" />
      <svg className="absolute inset-0 pointer-events-none">
        <line x1="25%" y1="66%" x2="30%" y2="60%" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
        <circle cx="30%" cy="60%" r="2" fill="rgba(56,189,248,0.5)" />
      </svg>
    </div>
  );
};

const TheProblem = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section className="relative w-full py-32 bg-[#020408] overflow-hidden border-t border-slate-800/50">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-[2px] w-8 bg-red-500" />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-hero font-black text-white mb-8 leading-[0.9] tracking-tighter italic">
                every year,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                  we're losing.
                </span>
              </h2>

              <div className="text-lg text-slate-400 leading-relaxed mb-12 border-l border-slate-700 pl-6 space-y-4">
                <p>
                  wildfires cause massive damage every year. last year alone, they caused $225 billion in direct economic damage worldwide, and hundreds of lives lost.
                </p>
                <p>
                  response times to wildfires are too slow (often 4-6 hours), and by then it's too late.
                </p>
                <p>
                  meanwhile, dry lightning strikes are the leading cause of wildfires, accounting for 60% of all wildfires. this is when lightning strikes from storms that produce no rain, and ignites dry terrain with zero warning and suppression.
                </p>
                <p>
                  by the time humans intervene, it's already out of control.
                </p>
                <p>
                  current systems rely on people watching dashboards, making phone calls, coordinating across agencies.
                </p>
                <p>
                  the technology to predict these strikes exists. the technology to neutralize them exists. but nobody has connected them before, until now.
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <Stat value="30+" label="lives lost (2025 LA)" delay={0.2} />
              <Stat value="$250B" label="damage (single event)" delay={0.4} />
              <Stat value="4h+" label="avg response time" delay={0.6} />
              <Stat value="60%" label="dry lightning cause" delay={0.8} />
            </div>
          </div>

          {/* Right Visual - Map Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            className="relative h-[500px] w-full bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden group shadow-2xl shadow-red-900/10"
          >
            <TacticalMapVisual />
            
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,8,0.8)_100%)] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
