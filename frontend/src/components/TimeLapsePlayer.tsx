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

const timeLabels = ["14:00", "15:30", "17:00", "20:00", "23:00"];

const TimeLapsePlayer = ({ progress, isPlaying, onPlay, onPause, onReset, onSeek }: TimeLapsePlayerProps) => {
  const currentTimeIndex = Math.min(Math.floor(progress * timeLabels.length), timeLabels.length - 1);

  return (
    <div className="surface-elevated border border-border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Play className="w-3.5 h-3.5 text-primary ml-0.5" />
            )}
          </button>
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-md hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        <span className="text-sm font-mono font-bold text-foreground min-w-[50px]">
          {timeLabels[currentTimeIndex]}
        </span>
        <div className="flex-1">
          <Slider
            value={[progress * 100]}
            onValueChange={([v]) => onSeek(v / 100)}
            max={100}
            step={1}
            className="cursor-pointer"
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground min-w-[36px] text-right">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <div className="flex justify-between mt-2 px-[52px]">
        {timeLabels.map((label, i) => (
          <span
            key={label}
            className={`text-[9px] font-mono transition-colors duration-300 ${
              i <= currentTimeIndex ? "text-primary" : "text-muted-foreground/40"
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
