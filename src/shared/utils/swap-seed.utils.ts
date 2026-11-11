import type { PlanExerciseRow } from "@/shared/db/types";
import type { LoadType, WeightUnit } from "@/shared/types/training.types";

export interface SwapSeed {
  targetWeight: number | null;
  unit: WeightUnit;
  loadType: LoadType;
}

interface SeedOptions {
  planExercise: Pick<PlanExerciseRow, "exerciseId" | "targetWeight" | "unit" | "loadType">;
  substitute: { id: string; defaultLoadType: LoadType };
  /** La última serie con peso que se registró del sustituto, si existe. */
  lastSet: SwapSeed | null;
}

/**
 * Con qué peso arranca el sustituto: el de su último registro. Sin historial queda vacío, porque
 * el peso del ejercicio original no es comparable entre equipos. Volver al original recupera el del plan.
 */
export function buildSwapSeed({ planExercise, substitute, lastSet }: SeedOptions): SwapSeed {
  if (substitute.id === planExercise.exerciseId) {
    return { targetWeight: planExercise.targetWeight, unit: planExercise.unit, loadType: planExercise.loadType };
  }
  return lastSet ?? { targetWeight: null, unit: planExercise.unit, loadType: substitute.defaultLoadType };
}
