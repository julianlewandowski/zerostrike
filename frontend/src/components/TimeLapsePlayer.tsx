import { Play, Pause, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TimeLapsePlayerProps {
  progress: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (value: number) => void;
}

// Generic day labels — works proportionally for both Spain (~7 days) and LA (~21 days)
const timeLabels    = ["Day 1", "Day 4", "Day 8", "Day 14", "Day 21"];
const timeSubLabels = ["Ignition", "Spreading", "Escalating", "Peak activity", "Contained"];

const TimeLapsePlayer = ({ progress, isPlaying, onPlay, onPause, onReset, onSeek }: TimeLapsePlayerProps) => {
  const currentTimeIndex = Math.min(Math.floor(progress * timeLabels.length), timeLabels.length - 1);

  return (
    <div className="surface-elevated border border-border rounded-lg p-3">
      <div className="flex items-center gap-3">

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            {isPlaying
              ? <Pause className="w-3.5 h-3.5 text-primary" />
              : <Play  className="w-3.5 h-3.5 text-primary ml-0.5" />
            }
          </button>
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-md hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Current day display */}
        <div className="flex flex-col min-w-[80px] flex-shrink-0">
          <span className="text-xs font-mono font-bold text-foreground leading-tight">
            {timeLabels[currentTimeIndex]}
          </span>
          <span className="text-[8px] font-mono text-muted-foreground leading-tight">
            {timeSubLabels[currentTimeIndex]}
          </span>
        </div>

        {/* Slider */}
        <div className="flex-1">
          <Slider
            value={[progress * 100]}
            onValueChange={([v]) => onSeek(v / 100)}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* Percentage */}
        <span className="text-[10px] font-mono text-muted-foreground min-w-[36px] text-right flex-shrink-0">
          {Math.round(progress * 100)}%
        </span>

      </div>

      {/* Day markers under the slider */}
      <div className="flex justify-between mt-1.5 px-[52px]">
        {timeLabels.map((label, i) => (
          <span
            key={label}
            className={`text-[8px] font-mono transition-colors duration-300 ${
              i <= currentTimeIndex ? "text-primary" : "text-muted-foreground/30"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TimeLapsePlayer;
