import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Step = ({ number, title, sub, isLast }) => {
  return (
    <div className="relative flex items-start group">
      {/* Line connecting steps */}
      {!isLast && (
        <div className="absolute left-[19px] top-[40px] bottom-[-40px] w-[2px] bg-slate-800 group-hover:bg-cyan-900/50 transition-colors" />
      )}
      
      <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-sm group-hover:border-cyan-500 group-hover:text-cyan-400 transition-all shadow-[0_0_0_4px_#020408]">
        {number}
      </div>
      
      <div className="ml-8 pb-12">
        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 font-mono">{sub}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="relative w-full py-32 bg-[#020408] border-t border-slate-800/50 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: The Kill Chain List */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                the kill chain
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                every cell on the map is scored using three layers: fuel risk from satellite vegetation and terrain data, atmospheric risk from live weather models measuring convective energy and moisture, and consequence risk based on proximity to people and infrastructure.
              </p>
            </motion.div>

            <div className="space-y-2">
              <Step number="01" title="satellite + weather + terrain data" sub="ingestion layer" />
              <Step number="02" title="grid scoring engine" sub="fuel × atmospheric × consequence" />
              <Step number="03" title="storm tracking & projection" sub="6-hour horizon" />
              <Step number="04" title="collision detection" sub="storm paths × high-risk zones" />
              <Step number="05" title="priority queue" sub="ranked threat zones" />
              <Step number="06" title="fleet optimizer" sub="match drones to threats in <3 sec" />
              <Step number="07" title="drone dispatch" sub="intercept & neutralize" isLast />
            </div>
          </div>

          {/* Right: Visual Representation */}
          <div className="relative h-[800px] hidden lg:block">
            <motion.div style={{ y }} className="absolute inset-0 flex items-center justify-center">
              {/* Central Flow Visualization */}
              <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900/30 border border-slate-800 rounded-lg p-8 backdrop-blur-sm">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[background-position_0%_0%_to_100%_100%_20s_linear_infinite]" />
                
                {/* Animated Nodes */}
                <div className="flex flex-col h-full justify-between relative z-10">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-black/40 p-3 rounded border border-slate-800"
                    >
                      <div className={`w-2 h-2 rounded-full ${i === 7 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                      <div className="h-2 bg-slate-800 rounded w-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                          className={`h-full ${i === 7 ? 'bg-red-500' : 'bg-cyan-500/50'}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Connecting Lines */}
                <div className="absolute left-1/2 top-8 bottom-8 w-px bg-slate-800 -z-0" />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
