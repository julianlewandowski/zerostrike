import { motion } from "framer-motion";

interface TimelineProps {
  timeProgress: number;
}

interface TimelineEvent {
  time: string;
  actual: string;
  optimized: string;
  actualStatus: "critical" | "warning" | "info";
  optimizedStatus: "success" | "info";
  threshold: number;
}

const events: TimelineEvent[] = [
  { time: "14:00", actual: "Fire detected — delayed alert", optimized: "AI detects heat anomaly, instant alert", actualStatus: "warning", optimizedStatus: "success", threshold: 0 },
  { time: "15:30", actual: "Manual evacuation begins — roads congested", optimized: "Automated route optimization, phased evac", actualStatus: "critical", optimizedStatus: "success", threshold: 0.2 },
  { time: "17:00", actual: "Fire jumps highway — 3 towns engulfed", optimized: "Predictive firebreaks deployed, fire contained", actualStatus: "critical", optimizedStatus: "success", threshold: 0.4 },
  { time: "20:00", actual: "Emergency services overwhelmed", optimized: "Coordinated drone + ground response", actualStatus: "critical", optimizedStatus: "info", threshold: 0.65 },
  { time: "23:00", actual: "222 confirmed casualties", optimized: "12 minor injuries, 0 fatalities", actualStatus: "critical", optimizedStatus: "success", threshold: 0.85 },
];

const statusColors = {
  critical: "bg-danger",
  warning: "bg-fire",
  info: "bg-muted-foreground",
  success: "bg-optimized",
};

const Timeline = ({ timeProgress }: TimelineProps) => {
  const visibleEvents = events.filter((e) => timeProgress >= e.threshold);
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Event Timeline — October 29, 2024
      </h3>
      <div className="space-y-3">
        {visibleEvents.map((event) => (
          <motion.div
            key={event.time}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-[50px_1fr_1fr] gap-3 items-start"
          >
            <span className="text-[11px] font-mono text-muted-foreground pt-1">{event.time}</span>
            <div className="flex items-start gap-2 p-2 rounded-md metric-bg border border-border">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${statusColors[event.actualStatus]}`} />
              <span className="text-[11px] text-secondary-foreground leading-tight">{event.actual}</span>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-md metric-bg border border-glow-optimized">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${statusColors[event.optimizedStatus]}`} />
              <span className="text-[11px] text-secondary-foreground leading-tight">{event.optimized}</span>
            </div>
          </motion.div>
        ))}
        {visibleEvents.length === 0 && (
          <p className="text-[11px] font-mono text-muted-foreground/40 italic">Press play to begin simulation...</p>
        )}
      </div>
    </div>
  );
};

export default Timeline;
