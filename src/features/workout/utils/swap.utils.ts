import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import type { SwapSeed } from "@/shared/utils/swap-seed.utils";
import type { PlanSlot } from "../types/workout.types";

export interface Swap extends SwapSeed {
  planExerciseId: string;
  exerciseId: string;
}

export interface DayExercise extends PlanExerciseDetail {
  slot: PlanSlot;
}

/** El plan del día con las sustituciones de esa fecha aplicadas: mismo lugar, series y descanso; otro ejercicio y peso. */
export function applySwaps(
  details: readonly PlanExerciseDetail[],
  swaps: readonly Swap[],
  substitutes: ReadonlyMap<string, PlanExerciseDetail["exercise"]>,
): DayExercise[] {
  return details.map((detail) => {
    const swap = swaps.find((item) => item.planExerciseId === detail.planExercise.id);
    const substitute = swap ? substitutes.get(swap.exerciseId) : undefined;
    const slot = { planExerciseId: detail.planExercise.id, originalExerciseId: detail.exercise.id };
    if (!swap || !substitute) return { ...detail, slot: { ...slot, isSubstituted: false } };
    const { targetWeight, unit, loadType } = swap;
    return {
      planExercise: { ...detail.planExercise, exerciseId: swap.exerciseId, targetWeight, unit, loadType },
      exercise: substitute,
      slot: { ...slot, isSubstituted: true },
    };
  });
}

interface NewSetsOptions {
  planSets: number;
  /** Series ya hechas del ejercicio que se reemplaza. */
  doneSets: number;
  /** Índices de las series que el sustituto ya tiene en esta sesión (si se había usado antes). */
  existingIndexes: readonly number[];
}

/** Cuántas series pendientes crear para el sustituto y desde qué índice; al menos una si aún no tiene ninguna. */
export function planSubstituteSets({ planSets, doneSets, existingIndexes }: NewSetsOptions): { count: number; startIndex: number } {
  const hasExisting = existingIndexes.length > 0;
  const remaining = planSets - doneSets - existingIndexes.length;
  return {
    count: Math.max(hasExisting ? 0 : 1, remaining),
    startIndex: hasExisting ? Math.max(...existingIndexes) + 1 : 0,
  };
}
