import type { Trend } from "../types/progress.types";

const EPSILON = 1e-6;

export function trendOf(previous: number, current: number): Trend {
  const delta = current - previous;
  if (Math.abs(delta) < EPSILON) return { direction: "same", delta: 0 };
  return { direction: delta > 0 ? "up" : "down", delta };
}

/** Cambio relativo (0.08 = +8%); null si no había base con la que comparar. */
export function percentChange(previous: number, current: number): number | null {
  if (previous <= 0) return null;
  return (current - previous) / previous;
}
