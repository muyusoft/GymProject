import { useEffect, useRef, useState } from "react";
import { remainingSeconds } from "../utils/elapsed.utils";

const TICK_MS = 250;

/**
 * Segundos que faltan para `endsAt` (hora de fin, no un contador). `onDone` corre una vez por cada hora de fin.
 * Con endsAt null no hace nada.
 */
export function useCountdown(endsAt: number | null, onDone: () => void): number {
  const [now, setNow] = useState(() => Date.now());
  const notifiedFor = useRef<number | null>(null);
  const remaining = endsAt === null ? 0 : remainingSeconds(endsAt, now);

  useEffect(() => {
    if (endsAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [endsAt]);

  useEffect(() => {
    if (endsAt === null || remaining > 0 || notifiedFor.current === endsAt) return;
    notifiedFor.current = endsAt;
    onDone();
  }, [endsAt, remaining, onDone]);

  return remaining;
}
