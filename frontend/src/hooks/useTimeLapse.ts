import { useState, useRef, useCallback, useEffect } from "react";

const DURATION_MS = 8000;
const TICK_MS = 50;

export function useTimeLapse() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    stop();
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + TICK_MS / DURATION_MS;
        if (next >= 1) {
          stop();
          return 1;
        }
        return next;
      });
    }, TICK_MS);
  }, [stop]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setProgress(0);
  }, [stop]);

  const seek = useCallback(
    (value: number) => {
      setProgress(Math.max(0, Math.min(1, value)));
      if (isPlaying) {
        stop();
        setIsPlaying(true);
        intervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + TICK_MS / DURATION_MS;
            if (next >= 1) {
              stop();
              return 1;
            }
            return next;
          });
        }, TICK_MS);
      }
    },
    [isPlaying, stop]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { progress, isPlaying, play, pause, reset, seek };
}
