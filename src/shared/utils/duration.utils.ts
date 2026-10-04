const SECONDS_PER_SET = 40;
const SECONDS_PER_MINUTE = 60;
const MINUTE_ROUNDING = 5;
const CLOCK_PAD = 2;

export interface TimedExercise {
  sets: number;
  restSec: number;
  /** Ejercicios por tiempo: la serie dura estos segundos en vez de 40. */
  seconds?: number | null;
}

/** Regla de producto: series × (40 s por serie + descanso), redondeada a 5 min. */
export function estimateDurationMinutes(
  exercises: readonly TimedExercise[],
): number {
  const totalSeconds = exercises.reduce(
    (sum, { sets, restSec, seconds }) =>
      sum + sets * ((seconds ?? SECONDS_PER_SET) + restSec),
    0,
  );
  const minutes = totalSeconds / SECONDS_PER_MINUTE;
  return Math.round(minutes / MINUTE_ROUNDING) * MINUTE_ROUNDING;
}

/** 90 → "1:30". */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(CLOCK_PAD, "0")}`;
}
