import type { PlanExercisePatch, PlanExerciseRow } from "@/shared/db/types";
import type { LoadType, WeightUnit } from "@/shared/types/training.types";
import { convertWeight, roundToIncrement } from "@/shared/utils/weight.utils";
import {
  parseProgressionRule,
  serializeProgressionRule,
} from "./progression-rule.utils";

export const CONFIG_LIMITS = {
  sets: { min: 1, max: 10, step: 1 },
  reps: { min: 1, max: 50, step: 1 },
  seconds: { min: 5, max: 600, step: 5 },
  restSec: { min: 0, max: 600, step: 15 },
  weight: { min: 0, max: 1000 },
} as const;

const DEFAULT_SECONDS = 60;

export interface ConfigDraft {
  loadType: LoadType;
  unit: WeightUnit;
  weight: number;
  sets: number;
  reps: number;
  seconds: number;
  restSec: number;
  isProgressionEnabled: boolean;
}

export function loadTypeUsesWeight(loadType: LoadType): boolean {
  return loadType === "per_arm" || loadType === "total" || loadType === "plates";
}

export function loadTypeUsesTime(loadType: LoadType): boolean {
  return loadType === "time";
}

export function draftFromPlanExercise(row: PlanExerciseRow): ConfigDraft {
  return {
    loadType: row.loadType,
    unit: row.unit,
    weight: row.targetWeight ?? 0,
    sets: row.sets,
    reps: row.reps ?? CONFIG_LIMITS.reps.min,
    seconds: row.seconds ?? DEFAULT_SECONDS,
    restSec: row.restSec,
    isProgressionEnabled: parseProgressionRule(row.progressionRule).enabled,
  };
}

/** Solo se guarda lo que el tipo de carga usa: sin peso en tiempo, sin reps en tiempo, sin segundos en reps. */
export function draftToPatch(draft: ConfigDraft, currentRule: string | null): PlanExercisePatch {
  const rule = { ...parseProgressionRule(currentRule), enabled: draft.isProgressionEnabled };
  return {
    loadType: draft.loadType,
    unit: draft.unit,
    targetWeight: loadTypeUsesWeight(draft.loadType) ? draft.weight : null,
    sets: draft.sets,
    reps: loadTypeUsesTime(draft.loadType) ? null : draft.reps,
    seconds: loadTypeUsesTime(draft.loadType) ? draft.seconds : null,
    restSec: draft.restSec,
    progressionRule: serializeProgressionRule(rule),
  };
}

interface SwitchUnitOptions {
  weight: number;
  from: WeightUnit;
  to: WeightUnit;
  step: number;
}

/** Al cambiar de unidad el peso se convierte y se acerca al salto del equipo en la unidad nueva. */
export function switchUnit({ weight, from, to, step }: SwitchUnitOptions): number {
  return roundToIncrement(convertWeight(weight, from, to), step);
}
