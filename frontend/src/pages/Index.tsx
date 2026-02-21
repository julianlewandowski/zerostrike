import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield, Users, Building2, DollarSign, TreePine, Clock } from "lucide-react";
import FireMap from "@/components/FireMap";
import MetricCard from "@/components/MetricCard";
import Timeline from "@/components/Timeline";
import TimeLapsePlayer from "@/components/TimeLapsePlayer";
import { useTimeLapse } from "@/hooks/useTimeLapse";

const Index = () => {
  const [activeView, setActiveView] = useState<"actual" | "optimized">("actual");
  const timeLapse = useTimeLapse();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Spain Wildfire Simulation</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Valencia Region — October 2024
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg surface-elevated border border-border">
            <button
              onClick={() => setActiveView("actual")}
              className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeView === "actual"
                  ? "bg-danger/20 text-danger glow-danger"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3" />
                Actual
              </span>
            </button>
            <button
              onClick={() => setActiveView("optimized")}
              className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeView === "optimized"
                  ? "bg-optimized/20 text-optimized glow-optimized"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Optimized
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6">
        <div className="mb-6">
          <TimeLapsePlayer
            progress={timeLapse.progress}
            isPlaying={timeLapse.isPlaying}
            onPlay={timeLapse.play}
            onPause={timeLapse.pause}
            onReset={timeLapse.reset}
            onSeek={timeLapse.seek}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-lg surface-elevated border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Simulation comparing actual DANA storm wildfire impact vs. AI-optimized emergency response
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={`text-xs font-mono font-bold ${activeView === "actual" ? "text-danger" : "text-optimized"}`}
            >
              {activeView === "actual" ? "⚠ CATASTROPHIC OUTCOME" : "✓ OPTIMIZED OUTCOME"}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full"
              >
                <FireMap mode={activeView} timeProgress={timeLapse.progress} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="space-y-4">
            <MetricCard icon={<Users className="w-4 h-4" />} label="Lives Lost" actualValue={222} optimizedValue={0} savedLabel="Lives Saved" savedValue="222 people" delay={0.1} timeProgress={timeLapse.progress} />
            <MetricCard icon={<Users className="w-4 h-4" />} label="Injuries" actualValue="1,900+" optimizedValue={12} savedLabel="Injuries Prevented" savedValue="99.4%" delay={0.2} timeProgress={timeLapse.progress} />
            <MetricCard icon={<Building2 className="w-4 h-4" />} label="Structures Destroyed" actualValue={12400} optimizedValue={380} savedLabel="Structures Saved" savedValue="96.9%" delay={0.3} timeProgress={timeLapse.progress} />
            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Financial Losses" actualValue="€2.1B" optimizedValue="€180M" savedLabel="Cost Saved" savedValue="€1.92 Billion" delay={0.4} timeProgress={timeLapse.progress} />
            <MetricCard icon={<TreePine className="w-4 h-4" />} label="Hectares Burned" actualValue={30000} optimizedValue={4200} unit="ha" savedLabel="Area Saved" savedValue="86%" delay={0.5} timeProgress={timeLapse.progress} />
          </div>
        </div>

        <div className="mt-8">
          <Timeline timeProgress={timeLapse.progress} />
        </div>

        {timeLapse.progress >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 rounded-lg border border-glow-optimized surface-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-optimized/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-optimized" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Optimized System Impact Summary</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  Using AI-driven early detection, predictive fire modeling, automated evacuation routing,
                  and coordinated drone-ground response, the optimized system would have reduced casualties
                  to zero, saved €1.92 billion in damages, and contained the fire to 14% of its actual
                  spread area — transforming a national catastrophe into a managed emergency event.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
