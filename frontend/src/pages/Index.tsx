import { motion } from "framer-motion";
import { Flame, AlertTriangle } from "lucide-react";
import FireMap from "@/components/FireMap";
import ImpactDashboard from "@/components/ImpactDashboard";
import TimeLapsePlayer from "@/components/TimeLapsePlayer";
import { useTimeLapse } from "@/hooks/useTimeLapse";

const Index = () => {
  const timeLapse = useTimeLapse();

  return (
    <div
      className="min-h-screen bg-background text-foreground mt-8"
      style={{ minHeight: '100vh', backgroundColor: 'hsl(220 20% 7%)', color: 'hsl(210 20% 92%)' }}
    >

      {/* ── Tactical header ── */}
      <header className="border-b border-white/8 px-6 py-2.5 bg-black/60">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/80">
              ZeroStrike · Wildfire Intelligence
            </span>
          </div>

          {/* Dual event title — centre */}
          <div className="text-center">
            <p className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
              Spain 2024 · Los Angeles 2025
            </p>
            <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
              Valencia DANA · Palisades · Eaton · Hurst Fires
            </p>
          </div>

          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-1.5 h-1.5 bg-orange-500 animate-pulse" />
              Spain 2024
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-1.5 h-1.5 bg-red-500 animate-pulse" />
              LA 2025
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 pt-4 pb-12">

        {/* ── Dual case study maps ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[440px] overflow-hidden border border-orange-500/40 bg-black"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-orange-950/30 border-b border-orange-500/25">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-orange-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-orange-400">
                  SPAIN — OCT 2024
                </span>
              </div>
              <span className="text-[8px] font-mono text-orange-500/60 tracking-widest">400,000+ HA BURNED</span>
            </div>
            <div className="flex-1 min-h-0">
              <FireMap mode="spain" timeProgress={timeLapse.progress} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col h-[440px] overflow-hidden border border-red-600/40 bg-black"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-red-950/40 border-b border-red-600/30">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-red-400">
                  LOS ANGELES — JAN 2025
                </span>
              </div>
              <span className="text-[8px] font-mono text-red-500/60 tracking-widest">$250B+ DAMAGE</span>
            </div>
            <div className="flex-1 min-h-0">
              <FireMap mode="la" timeProgress={timeLapse.progress} />
            </div>
          </motion.div>

        </div>

        {/* ── Play controls ── */}
        <div className="mb-4">
          <TimeLapsePlayer
            progress={timeLapse.progress}
            isPlaying={timeLapse.isPlaying}
            onPlay={timeLapse.play}
            onPause={timeLapse.pause}
            onReset={timeLapse.reset}
            onSeek={timeLapse.seek}
          />
        </div>

        {/* ── Impact dashboard ── */}
        <ImpactDashboard timeProgress={timeLapse.progress} />

        {/* ── Final callout at 100% ── */}
        {timeLapse.progress >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-6 rounded-lg border border-orange-500/25 surface-elevated"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Two Catastrophes. One Pattern. One Solution.</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  Whether it's the richest neighbourhoods in America or the rural heartlands of Europe —
                  the result is the same. Spain burned 400,000+ ha for €12.2B. LA burned 37,000 acres for $250B.
                  LA cost 50× more per hectare due to urban–wildland interface and high-value real estate.
                  Humans can't respond fast enough. ZeroStrike's AI-driven early detection,
                  predictive modelling, and autonomous dispatch transforms both from national catastrophes
                  into managed emergency events — with a proven 24× ROI.
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
