import { motion } from 'framer-motion';
import { Github, Linkedin, Globe, ExternalLink } from 'lucide-react';

const TeamMember = ({ name, role, pic, github, linkedin, site, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className="aspect-square bg-slate-900 rounded-lg border border-slate-800 mb-6 overflow-hidden relative">
        <img src={pic} alt={name} className="absolute inset-0 w-full h-full object-cover object-top" />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-cyan-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <a href={github} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 rounded-full hover:bg-cyan-500 hover:text-black transition-colors">
            <Github size={20} />
          </a>
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 rounded-full hover:bg-cyan-500 hover:text-black transition-colors">
            <Linkedin size={20} />
          </a>
          <a href={site} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 rounded-full hover:bg-cyan-500 hover:text-black transition-colors">
            <Globe size={20} />
          </a>
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{name}</h3>
      <p className="text-sm text-slate-400 font-mono uppercase tracking-wider">{role}</p>
    </motion.div>
  );
};

const AboutUs = () => {
  return (
    <section className="relative w-full py-32 bg-[#020408] border-t border-slate-800/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-6"
          >
            built in 24 hours
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400"
          >
            we built this at hackeurope, europe's biggest hackathon ever.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <TeamMember name="Julian Lewandowski" role="Platform" pic="/julianpic.jpg" github="https://github.com/julianlewandowski" linkedin="https://www.linkedin.com/in/julianlew/" site="https://julianlew.com" delay={0.2} />
          <TeamMember name="Emmanuel Karibiye" role="Platform" pic="/emmanuelpic.jpg" github="https://github.com/dlegend4000" linkedin="https://www.linkedin.com/in/emmanuel-karibiye-509b9a1b3/" site="https://emmanuelkaribiye.dev" delay={0.3} />
          <TeamMember name="Eniola Olumeyan" role="Prediction Model" pic="/eniolapic.jpg" github="https://github.com/powerusere" linkedin="https://www.linkedin.com/in/eniolabo/" site="https://eniola.dev" delay={0.4} />
          <TeamMember name="Aditya Joshi" role="Hardware" pic="/adityapic.jpg" github="https://github.com/firesmasher231" linkedin="https://www.linkedin.com/in/aditya-joshi-632626244/" site="https://adityajoshi.cc" delay={0.5} />
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 border-t border-slate-800 pt-16">
          <div className="flex gap-6">
            <a href="https://github.com/julianlewandowski/zerostrike" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Github size={20} />
              <span className="font-mono text-sm">View Source</span>
            </a>
            <a href="https://devpost.com/software/zerostrike" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ExternalLink size={20} />
              <span className="font-mono text-sm">Devpost</span>
            </a>
          </div>
          
          <p className="text-cyan-500/50 font-mono text-sm tracking-[0.3em] uppercase">
            ZeroStrike. The Palantir for Wildfires.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
