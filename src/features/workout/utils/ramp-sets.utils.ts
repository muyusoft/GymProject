import type { WeightUnit } from "@/shared/types/training.types";
import { roundToIncrement } from "@/shared/utils/weight.utils";
import type { RampSet } from "../types/warmup.types";

/** Por debajo de esto (unos 20 kg) basta una sola serie de aproximación. Regla de producto, no de estudio. */
const LIGHT_LOAD: Record<WeightUnit, number> = { kg: 20, lb: 45 };
const LIGHT_RAMP = { reps: 8, ratio: 0.5 };
const EMPTY_BAR_REPS = 10;
const RAMP_STEPS = [
  { reps: 5, ratio: 0.5 },
  { reps: 3, ratio: 0.75 },
] as const;

export interface RampRequest {
  /** Peso de trabajo del día, en su unidad registrada. */
  weight: number;
  unit: WeightUnit;
  /** Salto del equipo, para que cada peso se pueda cargar. */
  step: number;
}

function rampSet(reps: number, weight: number): RampSet {
  return { reps, weight: weight > 0 ? weight : null };
}

/** Series de aproximación para el primer compuesto con peso; no cuentan para récords, volumen ni progresión. */
export function rampSets({ weight, unit, step }: RampRequest): readonly RampSet[] {
  if (weight <= 0) return [];
  if (weight < LIGHT_LOAD[unit]) {
    return [rampSet(LIGHT_RAMP.reps, roundToIncrement(weight * LIGHT_RAMP.ratio, step))];
  }
  return [
    { reps: EMPTY_BAR_REPS, weight: null },
    ...RAMP_STEPS.map(({ reps, ratio }) => rampSet(reps, roundToIncrement(weight * ratio, step))),
  ];
}
