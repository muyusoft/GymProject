import { useEffect, useState } from "react";
import { formatElapsed } from "../utils/elapsed.utils";

const TICK_MS = 1000;

/** Reloj de la sesión; se detiene si la sesión ya terminó. */
export function useElapsed(startedAt: number, endedAt: number | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endedAt !== null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [endedAt]);

  return formatElapsed((endedAt ?? now) - startedAt);
}
