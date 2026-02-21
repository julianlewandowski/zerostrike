import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  actualValue: string | number;
  optimizedValue: string | number;
  unit?: string;
  savedLabel?: string;
  savedValue?: string;
  icon: React.ReactNode;
  delay?: number;
  timeProgress: number;
}

function parseDisplayValue(val: string | number): number {
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[€$,+\s]/g, "");
  if (cleaned.endsWith("B")) return parseFloat(cleaned) * 1_000_000_000;
  if (cleaned.endsWith("M")) return parseFloat(cleaned) * 1_000_000;
  return parseFloat(cleaned) || 0;
}

function formatValue(original: string | number, fraction: number): string {
  const max = parseDisplayValue(original);
  const current = max * fraction;
  if (typeof original === "number") return Math.round(current).toLocaleString();
  const str = String(original);
  if (str.startsWith("€")) {
    if (str.includes("B")) return `€${(current / 1_000_000_000).toFixed(1)}B`;
    if (str.includes("M")) return `€${Math.round(current / 1_000_000)}M`;
    return `€${Math.round(current).toLocaleString()}`;
  }
  if (str.includes("+")) return `${Math.round(current).toLocaleString()}+`;
  return Math.round(current).toLocaleString();
}

const MetricCard = ({
  label,
  actualValue,
  optimizedValue,
  unit = "",
  savedLabel,
  savedValue,
  icon,
  delay = 0,
  timeProgress,
}: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="metric-bg rounded-lg border border-border p-5 relative overflow-hidden group hover:border-glow-fire transition-colors duration-300"
  >
    <div className="flex items-center gap-2 mb-4">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-danger mb-1">Actual</p>
        <p className="text-2xl font-bold font-mono text-gradient-fire">
          {formatValue(actualValue, timeProgress)}
          {unit && <span className="text-sm ml-1 text-muted-foreground">{unit}</span>}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-optimized mb-1">Optimized</p>
        <p className="text-2xl font-bold font-mono text-gradient-optimized">
          {formatValue(optimizedValue, timeProgress)}
          {unit && <span className="text-sm ml-1 text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
    {savedLabel && timeProgress >= 1 && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="mt-3 pt-3 border-t border-border"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{savedLabel}</span>
          <span className="text-sm font-bold font-mono text-saved">{savedValue}</span>
        </div>
      </motion.div>
    )}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-fire/5 to-transparent" />
  </motion.div>
);

export default MetricCard;
