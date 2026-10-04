import { useCallback, useState } from "react";
import { adjustRest, type RestWindow } from "../utils/elapsed.utils";

const MS_PER_SECOND = 1000;

interface RestTimerState {
  rest: RestWindow | null;
  start: (seconds: number) => void;
  add: (deltaSec: number) => void;
  skip: () => void;
}

export function useRestTimer(): RestTimerState {
  const [rest, setRest] = useState<RestWindow | null>(null);

  const start = useCallback((seconds: number) => {
    if (seconds <= 0) return;
    setRest({ endsAt: Date.now() + seconds * MS_PER_SECOND, totalSec: seconds });
  }, []);

  const add = useCallback((deltaSec: number) => {
    setRest((current) => current && adjustRest({ ...current, deltaSec, now: Date.now() }));
  }, []);

  const skip = useCallback(() => setRest(null), []);

  return { rest, start, add, skip };
}
