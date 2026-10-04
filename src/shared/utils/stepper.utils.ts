const PRECISION = 1000;

export interface StepperRange {
  min: number;
  max: number;
}

export function clampValue(value: number, { min, max }: StepperRange): number {
  return Math.min(max, Math.max(min, value));
}

/** Redondea para que 2.5 + 2.5 + 0.1 no arrastre error de coma flotante. */
export function stepValue(
  value: number,
  delta: number,
  range: StepperRange,
): number {
  const next = Math.round((value + delta) * PRECISION) / PRECISION;
  return clampValue(next, range);
}

export function isAtMin(value: number, { min }: StepperRange): boolean {
  return value <= min;
}

export function isAtMax(value: number, { max }: StepperRange): boolean {
  return value >= max;
}
