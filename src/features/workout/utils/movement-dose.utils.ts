import type { Movement, MovementDose } from "../types/warmup.types";

/** La clave de traducción de la dosis (bajo `movement.dose`) y su cantidad para el plural. */
export function doseKey({ amount, unit, isPerSide }: MovementDose): { key: string; count: number } {
  if (unit === "steps") return { key: "steps", count: amount };
  const base = unit === "seconds" ? "seconds" : "reps";
  return { key: isPerSide ? `${base}PerSide` : base, count: amount };
}

const SECONDS_PER_REP = 3;
const SECONDS_PER_STEP = 2;
const SECONDS_PER_MINUTE = 60;

/** Segundos que toma un movimiento, contando los dos lados; sirve para estimar los minutos. */
export function movementSeconds({ dose }: Movement): number {
  const perUnit = { reps: SECONDS_PER_REP, steps: SECONDS_PER_STEP, seconds: 1 }[dose.unit];
  const sides = dose.isPerSide ? 2 : 1;
  return dose.amount * perUnit * sides;
}

/** Minutos redondeados hacia arriba, nunca menos de uno. */
export function totalMinutes(movements: readonly Movement[]): number {
  const seconds = movements.reduce((sum, movement) => sum + movementSeconds(movement), 0);
  return Math.max(1, Math.ceil(seconds / SECONDS_PER_MINUTE));
}
