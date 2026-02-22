import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Radar, Brain, Plane } from 'lucide-react';

const Card = ({ icon: Icon, title, desc, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="relative group h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      <div className="relative h-full bg-[#0a1118] border border-slate-800 p-8 rounded-xl hover:border-cyan-500/50 transition-colors duration-300 flex flex-col">
        <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center mb-6 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-4 tracking-wide">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm flex-grow">
          {desc}
        </p>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600 group-hover:border-cyan-500 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600 group-hover:border-cyan-500 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-600 group-hover:border-cyan-500 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600 group-hover:border-cyan-500 transition-colors" />
      </div>
    </motion.div>
  );
};

const TheSolution = () => {
  return (
    <section className="relative w-full py-32 bg-[#020408] border-t border-slate-800/50">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="text-cyan-400 font-mono text-sm tracking-[0.2em] border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded">
              what we built
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-6"
          >
            agentic wildfire prevention
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400"
          >
            we stop dry lightning strikes to prevent wildfires before they start.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            icon={Radar}
            title="we predict with data"
            desc="we pull from 120 data sources: NASA satellites, ESA geospatial datasets, a decade of fire history, and live moisture readings, combined into a single risk layer updated every hour. our model scores land risk, strike probability, and consequence to flag the highest-risk dry lightning zones."
            delay={0.3}
          />
          <Card
            icon={Brain}
            title="we decide with predictions"
            desc="the moment a storm cell trajectory intersects a red zone, our system flags it, identifies which drone in the fleet can intercept fastest, and generates a dispatch route in under three seconds. no committees. no phone calls. no delays."
            delay={0.5}
          />
          <Card
            icon={Plane}
            title="we act on decisions"
            desc="drones fly to the calculated intercept point and release cloud-seeding agents, triggering precipitation over the high-risk area before a single spark lands. we reduce dry lightning ignition risk by 95%, cutting wildfire starts by 58%."
            delay={0.7}
          />
        </div>
      </div>
    </section>
  );
};

export default TheSolution;
