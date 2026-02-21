import { motion } from "framer-motion";

interface FireMapProps {
  mode: "actual" | "optimized";
  timeProgress: number;
}

const fireZones = {
  actual: [
    { id: 1, x: 45, y: 30, size: 28, label: "Chiva", threshold: 0 },
    { id: 2, x: 55, y: 45, size: 22, label: "Utiel", threshold: 0.15 },
    { id: 3, x: 38, y: 55, size: 18, label: "Turís", threshold: 0.3 },
    { id: 4, x: 60, y: 35, size: 25, label: "Requena", threshold: 0.45 },
    { id: 5, x: 50, y: 60, size: 20, label: "Llombai", threshold: 0.55 },
    { id: 6, x: 42, y: 42, size: 15, label: "Buñol", threshold: 0.65 },
    { id: 7, x: 65, y: 55, size: 12, label: "Tous", threshold: 0.75 },
    { id: 8, x: 35, y: 38, size: 16, label: "Godelleta", threshold: 0.85 },
  ],
  optimized: [
    { id: 1, x: 45, y: 30, size: 12, label: "Chiva", threshold: 0 },
    { id: 2, x: 55, y: 45, size: 8, label: "Utiel", threshold: 0.2 },
    { id: 3, x: 38, y: 55, size: 5, label: "Turís", threshold: 0.4 },
    { id: 4, x: 60, y: 35, size: 10, label: "Requena", threshold: 0.6 },
  ],
};

const towns = [
  { name: "Valencia", x: 72, y: 48 },
  { name: "Chiva", x: 45, y: 30 },
  { name: "Utiel", x: 55, y: 45 },
  { name: "Requena", x: 62, y: 35 },
  { name: "Turís", x: 38, y: 55 },
  { name: "Buñol", x: 42, y: 42 },
  { name: "Alzira", x: 55, y: 68 },
];

const terrainPaths = [
  "M 10,20 Q 30,15 50,22 T 90,18",
  "M 5,40 Q 25,35 45,42 T 95,38",
  "M 8,60 Q 35,55 55,62 T 92,58",
  "M 12,75 Q 40,70 60,78 T 88,72",
  "M 15,85 Q 45,82 65,88 T 85,84",
];

const roadPaths = [
  "M 72,48 L 45,30",
  "M 72,48 L 55,68",
  "M 45,30 L 42,42 L 38,55",
  "M 45,30 L 62,35 L 55,45",
  "M 42,42 L 55,45",
];

function getHectares(mode: "actual" | "optimized", timeProgress: number) {
  const max = mode === "actual" ? 30000 : 4200;
  return Math.round(max * timeProgress).toLocaleString();
}

const FireMap = ({ mode, timeProgress }: FireMapProps) => {
  const zones = fireZones[mode];
  const isActual = mode === "actual";

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 70% 50%, hsl(var(--secondary)) 0%, hsl(var(--background)) 70%),
            linear-gradient(180deg, hsl(var(--background)) 0%, hsl(220 18% 8%) 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h-${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="hsl(var(--foreground))" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v-${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
        ))}
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {terrainPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.15" opacity="0.12" />
        ))}
        {roadPaths.map((d, i) => (
          <path key={`road-${i}`} d={d} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.3" opacity="0.2" strokeDasharray="1,1" />
        ))}
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="fire-grad">
            <stop offset="0%" stopColor={isActual ? "hsl(15, 85%, 50%)" : "hsl(30, 90%, 55%)"} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isActual ? "hsl(8, 80%, 40%)" : "hsl(40, 80%, 50%)"} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isActual ? "hsl(0, 70%, 30%)" : "hsl(50, 70%, 45%)"} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="contained-grad">
            <stop offset="0%" stopColor="hsl(160, 60%, 45%)" stopOpacity="0.5" />
            <stop offset="70%" stopColor="hsl(160, 50%, 35%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(160, 40%, 30%)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {zones.map((zone) => {
          const zoneProgress =
            zone.threshold < timeProgress ? Math.min(1, (timeProgress - zone.threshold) / (1 - zone.threshold)) : 0;
          const r = (zone.size / 2) * zoneProgress;
          if (zoneProgress <= 0) return null;
          return (
            <g key={zone.id}>
              <circle
                cx={zone.x}
                cy={zone.y}
                r={r}
                fill={isActual ? "url(#fire-grad)" : "url(#contained-grad)"}
                opacity={Math.min(1, zoneProgress + 0.3)}
                style={{ transition: "r 0.1s linear, opacity 0.1s linear" }}
              />
              {isActual && (
                <circle
                  cx={zone.x}
                  cy={zone.y}
                  r={r + 2 * zoneProgress}
                  fill="none"
                  stroke="hsl(15, 85%, 50%)"
                  strokeWidth="0.3"
                  opacity={0.4 * zoneProgress}
                />
              )}
            </g>
          );
        })}
      </svg>
      {towns.map((town) => (
        <div
          key={town.name}
          className="absolute flex flex-col items-center"
          style={{ left: `${town.x}%`, top: `${town.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
          <span className="text-[8px] font-mono text-foreground/50 mt-0.5 whitespace-nowrap">{town.name}</span>
        </div>
      ))}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActual ? "bg-danger animate-pulse-fire" : "bg-optimized"}`} />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {isActual ? "Actual Event — Oct 2024" : "Optimized Response"}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${isActual ? "bg-fire/60" : "bg-optimized/40"}`} />
          <span className="text-[9px] font-mono text-muted-foreground">
            {isActual ? "Fire spread area" : "Contained area"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[1px] bg-muted-foreground/30" style={{ borderTop: "1px dashed" }} />
          <span className="text-[9px] font-mono text-muted-foreground">Road network</span>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-right">
        <p className="text-[9px] font-mono text-muted-foreground uppercase">Area affected</p>
        <p className={`text-lg font-bold font-mono ${isActual ? "text-gradient-fire" : "text-gradient-optimized"}`}>
          {getHectares(mode, timeProgress)}
          <span className="text-[10px] text-muted-foreground ml-1">ha</span>
        </p>
      </div>
    </div>
  );
};

export default FireMap;
