import { useCallback, useEffect, useState } from "react";

const TICK_MS = 1000;

interface Countdown {
  secondsLeft: number;
  isDone: boolean;
  restart: () => void;
}

/** Cuenta atrás por segundos desde `seconds`; `restart` la vuelve a empezar. */
export function useCountdown(seconds: number): Countdown {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const isDone = secondsLeft <= 0;

  useEffect(() => {
    if (isDone) return undefined;
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(left - 1, 0)), TICK_MS);
    return () => clearInterval(timer);
  }, [isDone]);

  const restart = useCallback(() => setSecondsLeft(seconds), [seconds]);

  return { secondsLeft, isDone, restart };
}
