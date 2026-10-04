import type { LoadType, WeightUnit } from "@/shared/types/training.types";
import { convertWeight } from "./weight.utils";

const EPLEY_DIVISOR = 30;

/** Fórmula de Epley: peso × (1 + reps / 30). */
export function epley(weight: number, reps: number): number {
  return weight * (1 + reps / EPLEY_DIVISOR);
}

export interface PerformedSet {
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  loadType?: LoadType;
  completed: boolean;
}

export interface ValidSet {
  weight: number;
  unit: WeightUnit;
  reps: number;
  loadType: LoadType | undefined;
}

/** Solo cuentan las series completadas con peso y reps; por tiempo o peso corporal no tienen 1RM. */
export function toValidSet(set: PerformedSet): ValidSet | null {
  if (!set.completed || set.weight === null || set.weight <= 0) return null;
  if (set.reps === null || set.reps <= 0) return null;
  return { weight: set.weight, unit: set.unit, reps: set.reps, loadType: set.loadType };
}

/** 1RM estimado en kg: se convierte para comparar, el peso registrado no cambia. */
export function oneRepMaxKg(set: ValidSet): number {
  return epley(convertWeight(set.weight, set.unit, "kg"), set.reps);
}

export interface BestSet extends ValidSet {
  oneRepMaxKg: number;
}

/** La mejor serie de una sesión: la de mayor 1RM estimado. */
export function bestSetOfSession(sets: readonly PerformedSet[]): BestSet | null {
  let best: BestSet | null = null;
  for (const set of sets) {
    const valid = toValidSet(set);
    if (!valid) continue;
    const estimate = oneRepMaxKg(valid);
    if (!best || estimate > best.oneRepMaxKg) best = { ...valid, oneRepMaxKg: estimate };
  }
  return best;
}
