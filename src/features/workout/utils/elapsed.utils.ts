import { formatClock } from "@/shared/utils/duration.utils";

const MS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const CLOCK_PAD = 2;

/** Reloj de la sesión: "06:12" y, pasada la hora, "1:05:09". */
export function formatElapsed(elapsedMs: number): string {
  const total = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const rest = total % SECONDS_PER_HOUR;
  if (hours > 0) {
    const minutes = String(Math.floor(rest / SECONDS_PER_MINUTE)).padStart(CLOCK_PAD, "0");
    return `${hours}:${minutes}:${String(rest % SECONDS_PER_MINUTE).padStart(CLOCK_PAD, "0")}`;
  }
  const clock = formatClock(rest);
  return clock.padStart("00:00".length, "0");
}

/** Segundos que faltan según la hora de fin (no un contador), así sigue bien con la pantalla bloqueada. */
export function remainingSeconds(endsAt: number, now: number): number {
  return Math.max(0, Math.ceil((endsAt - now) / MS_PER_SECOND));
}

/** Fracción del anillo que queda, de 1 (recién empezado) a 0 (terminado). */
export function ringFraction(remaining: number, totalSec: number): number {
  if (totalSec <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / totalSec));
}

export interface RestWindow {
  endsAt: number;
  totalSec: number;
}

interface AdjustOptions extends RestWindow {
  deltaSec: number;
  now: number;
}

/** −15 / +15: mueve la hora de fin y el total; nunca termina antes de ahora. */
export function adjustRest({ endsAt, totalSec, deltaSec, now }: AdjustOptions): RestWindow {
  const nextEnd = Math.max(now, endsAt + deltaSec * MS_PER_SECOND);
  return { endsAt: nextEnd, totalSec: Math.max(0, totalSec + deltaSec) };
}
