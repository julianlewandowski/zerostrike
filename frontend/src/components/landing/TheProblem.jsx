import { useRef } from 'react';
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
                <span className="text-red-500 font-mono text-sm tracking-[0.2em]">CRITICAL THREAT</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-8 leading-tight">
                Every Year,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                  We're Losing.
                </span>
              </h2>
              
              <p className="text-lg text-slate-400 leading-relaxed mb-12 border-l border-slate-700 pl-6">
                Dry lightning — strikes from storms that produce no rain — ignites bone-dry terrain with zero warning and zero suppression in place. By the time humans detect the fire, it's already out of control. Current systems rely on people watching dashboards, making phone calls, coordinating across agencies. The technology to predict these storms exists. The technology to neutralize them exists. But nobody has connected them — until now.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              <Stat value="30+" label="Lives Lost (2025 LA)" delay={0.2} />
              <Stat value="$250B" label="Damage (Single Event)" delay={0.4} />
              <Stat value="4h+" label="Avg Response Time" delay={0.6} />
              <Stat value="60%" label="Dry Lightning Cause" delay={0.8} />
            </div>
          </div>

          {/* Right Visual - Map Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            className="relative h-[600px] w-full bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden group"
          >
            {/* Map Background Layer */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-118.2437,34.0522,9,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGZ5N3R5aGgwMDVnM3Bwa3lzM3B4bXF1In0.example')] bg-cover bg-center grayscale mix-blend-luminosity" />
            
            {/* Threat Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent mix-blend-overlay" />
            
            {/* Animated Fire Spread */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full animate-pulse-fire" />
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* UI Elements */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <div className="bg-black/80 backdrop-blur border border-red-500/30 p-3 rounded text-xs font-mono text-red-400">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  WILDFIRE DETECTED
                </div>
                <div>LAT: 34.0522 N / LON: 118.2437 W</div>
              </div>
              <div className="bg-black/80 backdrop-blur border border-slate-700 p-3 rounded text-xs font-mono text-slate-400 text-right">
                <div>RESPONSE DELAY</div>
                <div className="text-2xl text-white font-bold">04:12:00</div>
              </div>
            </div>

            {/* Central Warning */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="w-32 h-32 border border-red-500/50 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <div className="w-24 h-24 border border-red-500/30 rounded-full border-dashed" />
              </div>
              <div className="mt-4 bg-red-950/80 text-red-500 px-4 py-1 text-xs font-mono tracking-widest border border-red-500/50">
                UNCONTROLLED
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
