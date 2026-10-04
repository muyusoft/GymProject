import { findIncrementStep } from "@/shared/db/queries/equipment.queries";
import {
  findPlanExercise,
  updatePlanExercise,
  type PlanExerciseDetail,
} from "@/shared/db/queries/plan-exercise.queries";
import type { PlanExercisePatch } from "@/shared/db/types";
import type { WeightUnit } from "@/shared/types/training.types";
import { equipmentIncrementKey, FALLBACK_WEIGHT_STEP } from "@/shared/utils/equipment.utils";

export interface ExerciseConfig {
  detail: PlanExerciseDetail;
  /** Salto de peso de Ajustes por unidad, según el equipo del ejercicio. */
  steps: Record<WeightUnit, number>;
}

export async function loadExerciseConfig(planExerciseId: string): Promise<ExerciseConfig | null> {
  const detail = await findPlanExercise(planExerciseId);
  if (!detail) return null;
  const equipment = equipmentIncrementKey(detail.exercise.equipment);
  const [lb, kg] = await Promise.all([
    findIncrementStep({ equipment, unit: "lb" }),
    findIncrementStep({ equipment, unit: "kg" }),
  ]);
  return {
    detail,
    steps: { lb: lb ?? FALLBACK_WEIGHT_STEP, kg: kg ?? FALLBACK_WEIGHT_STEP },
  };
}

export function saveExerciseConfig(id: string, patch: PlanExercisePatch): Promise<void> {
  return updatePlanExercise(id, patch);
}
