import { useMemo } from "react";
import { motion } from "framer-motion";

interface ImpactDashboardProps {
  timeProgress: number;
}

// ── Live damage counters (tick up during simulation) ─────────────────────────
const SPAIN_MAX_DAMAGE = 12_200_000_000;   // €12.2B
const LA_MAX_DAMAGE    = 250_000_000_000;  // $250B+

function euro(val: number): string {
  return `€${Math.round(val).toLocaleString("en-US")}`;
}
function usd(val: number): string {
  return `$${Math.round(val).toLocaleString("en-US")}`;
}
function num(val: number): string {
  return Math.round(val).toLocaleString("en-US");
}

// ── Spain Oct 2024 timeline ───────────────────────────────────────────────────
const SPAIN_EVENTS = [
  { label: "29 Oct 14:00", text: "Fire ignites in Chiva sierra. No automated alert.",           threshold: 0    },
  { label: "29 Oct 17:00", text: "Locals report smoke via calls. Roads already gridlocked.",    threshold: 0.18 },
  { label: "29 Oct 19:00", text: "First local firefighters arrive — severely under-resourced.", threshold: 0.3  },
  { label: "30 Oct 02:00", text: "Regional authorities mobilised. Fire still unchecked.",        threshold: 0.5  },
  { label: "31 Oct 14:00", text: "Military (UME) deployed — 1,400 troops. Too late.",           threshold: 0.68 },
  { label: "02 Nov 14:00", text: "PM Sánchez visits. EU civil protection mechanism activated.", threshold: 0.82 },
  { label: "05 Nov 14:00", text: "400,000+ ha burned across Spain. Fire still not contained.",  threshold: 1.0  },
];

// ── LA Jan 2025 timeline ─────────────────────────────────────────────────────
const LA_EVENTS = [
  { label: "07 Jan 10:30", text: "Palisades Fire ignites at Piedra Morada Dr, Pacific Palisades.", threshold: 0    },
  { label: "07 Jan 14:00", text: "Eaton Fire ignites in Altadena. Santa Ana winds at 80+ mph.",   threshold: 0.05 },
  { label: "07 Jan 18:00", text: "Hurst Fire breaks out in Sylmar. Three fires burning at once.",  threshold: 0.10 },
  { label: "08 Jan 06:00", text: "100,000+ evacuation orders. Palisades 0% contained at dawn.",   threshold: 0.22 },
  { label: "09 Jan 12:00", text: "State of emergency. Firefighters stretched across all fronts.",  threshold: 0.38 },
  { label: "11 Jan 14:00", text: "3,000+ structures confirmed destroyed. 30 deaths reported.",     threshold: 0.55 },
  { label: "15 Jan 14:00", text: "Palisades: 23,448 ac. Eaton: 14,117 ac. Still 40% contained.",  threshold: 0.74 },
  { label: "28 Jan 14:00", text: "Full containment. 37,000+ acres burned. $250B+ economic damage.", threshold: 1.0  },
];

// ── "What Our System Changes" rows ────────────────────────────────────────────
const systemRows = [
  {
    phase:    "Pre-event",
    without:  "Budget cuts to prevention, no AI monitoring, generic seasonal warnings",
    with:     "Continuous satellite + ML monitoring. System flags high-risk zones days before ignition.",
  },
  {
    phase:    "Detection",
    without:  "Depopulated areas — nobody to report until fire visible from km away",
    with:     "Autonomous satellite/drone detection within minutes of ignition. Zero human dependency.",
  },
  {
    phase:    "Response",
    without:  "Humans can't decide fast enough. Multiple agencies coordinating by phone.",
    with:     "AI generates suppression plan in <3 seconds. Dispatches nearest assets. Recalculates every 30s.",
  },
  {
    phase:    "Aid",
    without:  "Days to activate EU Civil Protection Mechanism, fly in aircraft from France & Germany.",
    with:     "Resources pre-positioned by risk forecast. No bureaucratic delay. Drones don't cross borders.",
  },
  {
    phase:    "Economics",
    without:  "10:1 loss-to-budget ratio. Reactive spending after catastrophe.",
    with:     "$100M system preventing 20% of damage saves €2.4B — 24× ROI.",
  },
];

export default function ImpactDashboard({ timeProgress }: ImpactDashboardProps) {
  const t = timeProgress;

  const spainDamage = useMemo(() => SPAIN_MAX_DAMAGE * t, [t]);
  const laDamage    = useMemo(() => LA_MAX_DAMAGE    * t, [t]);

  return (
    <div className="space-y-3">

      {/* ══ LIVE ECONOMIC DAMAGE COUNTERS ═════════════════════════════════════ */}
      <div className="rounded-xl border border-border surface-elevated p-4">
        <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
          💶 Economic Damage — Live Counter
        </p>

        <div className="grid grid-cols-2 divide-x divide-border">

          {/* Spain — amber */}
          <div className="flex flex-col items-end pr-6 gap-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-orange-400">Spain 2024</span>
            <span
              className="font-mono font-bold tabular-nums leading-none text-orange-500 break-all text-right"
              style={{ fontSize: "clamp(13px, 1.9vw, 26px)" }}
            >
              {euro(spainDamage)}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/50">€43B EU-wide wildfire losses</span>
          </div>

          {/* LA — red (bigger threat) */}
          <div className="flex flex-col items-start pl-6 gap-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-red-400">LA Jan 2025</span>
            <span
              className="font-mono font-bold tabular-nums leading-none text-red-500 break-all"
              style={{ fontSize: "clamp(13px, 1.9vw, 26px)" }}
            >
              {usd(laDamage)}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/50">Palisades + Eaton + Hurst fires</span>
          </div>

        </div>
      </div>

      {/* ══ CASE STUDY COMPARISON TABLE ══════════════════════════════════════ */}
      <div className="rounded-xl border border-border surface-elevated overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/20">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            Two Continents · Same Failure · One Solution
          </p>
        </div>

        <div className="grid grid-cols-[160px_1fr_1fr] px-4 py-2 border-b border-border/60 bg-muted/10">
          <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/60" />
          <span className="text-[8px] font-mono uppercase tracking-widest text-orange-400">Spain 2024</span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-red-400">LA Jan 2025</span>
        </div>

        {[
          { label: "🔥 Area burned",       spain: "400,000+ ha",            la: "37,000 acres (~15k ha)"    },
          { label: "💰 Damage",            spain: "€12.2B+ (€43B EU-wide)", la: "$250B+"                    },
          { label: "💀 Lives lost",        spain: "30+",                    la: "30"                        },
          { label: "🏠 Structures",        spain: "Thousands + farmland",   la: "16,000+"                   },
          { label: "⏱ Response delay",    spain: "Days for international aid", la: "4+ hrs, no units on scene" },
          { label: "🌱 Root cause",        spain: "Slashed budgets, depopulated rural zones", la: "Human-only chain, no AI orchestration" },
        ].map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[160px_1fr_1fr] items-start px-4 py-2.5 border-b border-border/30 last:border-0 hover:bg-white/[0.015] transition-colors"
          >
            <span className="text-[9px] font-mono text-muted-foreground">{row.label}</span>
            <span className="text-[10px] font-mono font-semibold text-orange-400">{row.spain}</span>
            <span className="text-[10px] font-mono font-semibold text-red-400">{row.la}</span>
          </div>
        ))}
      </div>

      {/* ══ WHAT OUR SYSTEM CHANGES ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 overflow-hidden"
      >
        <div className="px-4 py-2.5 border-b border-emerald-500/20">
          <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">
            ⚡ What Our System Changes
          </p>
        </div>

        <div className="grid grid-cols-[100px_1fr_1fr] px-4 py-2 border-b border-emerald-500/15 bg-emerald-950/10">
          <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/60">Phase</span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-red-400/70">Without System</span>
          <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-400/70">With ZeroStrike</span>
        </div>

        {systemRows.map((row) => (
          <div
            key={row.phase}
            className="grid grid-cols-[100px_1fr_1fr] items-start px-4 py-2.5 border-b border-emerald-500/10 last:border-0 hover:bg-emerald-950/10 transition-colors gap-3"
          >
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wide pt-0.5">{row.phase}</span>
            <span className="text-[9px] font-mono text-muted-foreground/60 leading-snug">{row.without}</span>
            <span className="text-[9px] font-mono text-emerald-400 leading-snug">{row.with}</span>
          </div>
        ))}

        {/* ROI callout */}
        <div className="px-4 py-3 bg-emerald-950/20 border-t border-emerald-500/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-emerald-400/60 mb-0.5">Projected ROI</p>
            <p className="text-base font-bold font-mono text-emerald-400">24× Return</p>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground leading-snug text-right max-w-xs">
            A $100M system preventing just 20% of Spain's losses saves €2.4B+.
            Scale to the EU and LA: potential savings exceed $30B per event cycle.
          </p>
        </div>
      </motion.div>

      {/* ══ RESPONSE TIMELINE ════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            ⏱ Response Timeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Spain */}
          <div className="rounded-xl border border-orange-500/25 surface-elevated p-4">
            <p className="text-[9px] font-mono uppercase tracking-widest text-orange-400 mb-3">
              Spain — Oct 29, 2024
            </p>
            <div className="space-y-2.5">
              {SPAIN_EVENTS.map((e) => (
                <div
                  key={e.label}
                  className="flex gap-2.5 items-start transition-opacity duration-500"
                  style={{ opacity: timeProgress >= e.threshold ? 1 : 0.1 }}
                >
                  <span className="text-[9px] font-mono text-orange-400/70 min-w-[96px] shrink-0 pt-px tabular-nums">
                    {e.label}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground leading-tight">{e.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LA — red (bigger threat) */}
          <div className="rounded-xl border border-red-500/25 surface-elevated p-4">
            <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 mb-3">
              Los Angeles — Jan 7, 2025
            </p>
            <div className="space-y-2.5">
              {LA_EVENTS.map((e) => (
                <div
                  key={e.label}
                  className="flex gap-2.5 items-start transition-opacity duration-500"
                  style={{ opacity: timeProgress >= e.threshold ? 1 : 0.1 }}
                >
                  <span className="text-[9px] font-mono text-red-400/70 min-w-[96px] shrink-0 pt-px tabular-nums">
                    {e.label}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground leading-tight">{e.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
