import type { PlanExercisePatch, PlanExerciseRow } from "@/shared/db/types";
import type { LoadType, WeightUnit } from "@/shared/types/training.types";
import { convertWeight, roundToIncrement } from "@/shared/utils/weight.utils";
import {
  parseProgressionRule,
  repRangeMin,
  serializeProgressionRule,
} from "@/shared/utils/progression-rule.utils";

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
  /** Objetivo de repeticiones: el tope del rango. */
  reps: number;
  /** Mínimo del rango; igual a `reps` significa objetivo fijo, sin rango. */
  repsMin: number;
  seconds: number;
  restSec: number;
  isProgressionEnabled: boolean;
}

export function loadTypeUsesWeight(loadType: LoadType): boolean {
  return (
    loadType === "per_arm" || loadType === "total" || loadType === "plates"
  );
}

export function loadTypeUsesTime(loadType: LoadType): boolean {
  return loadType === "time";
}

export function draftFromPlanExercise(row: PlanExerciseRow): ConfigDraft {
  const rule = parseProgressionRule(row.progressionRule);
  const reps = row.reps ?? CONFIG_LIMITS.reps.min;
  return {
    loadType: row.loadType,
    unit: row.unit,
    weight: row.targetWeight ?? 0,
    sets: row.sets,
    reps,
    repsMin: repRangeMin(rule, reps) ?? reps,
    seconds: row.seconds ?? DEFAULT_SECONDS,
    restSec: row.restSec,
    isProgressionEnabled: rule.enabled,
  };
}

/** Al cambiar el objetivo, el mínimo lo acompaña si no había rango y nunca queda por encima. */
export function patchReps(
  draft: ConfigDraft,
  reps: number,
): Pick<ConfigDraft, "reps" | "repsMin"> {
  const hadRange = draft.repsMin < draft.reps;
  return { reps, repsMin: hadRange ? Math.min(draft.repsMin, reps) : reps };
}

function hasRepRange(draft: ConfigDraft): boolean {
  return !loadTypeUsesTime(draft.loadType) && draft.repsMin < draft.reps;
}

/** Solo se guarda lo que el tipo de carga usa: sin peso en tiempo, sin reps en tiempo, sin segundos en reps. */
export function draftToPatch(
  draft: ConfigDraft,
  currentRule: string | null,
): PlanExercisePatch {
  const { sessions } = parseProgressionRule(currentRule);
  const rule = {
    enabled: draft.isProgressionEnabled,
    sessions,
    ...(hasRepRange(draft) && { repsMin: draft.repsMin }),
  };
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
export function switchUnit({
  weight,
  from,
  to,
  step,
}: SwitchUnitOptions): number {
  return roundToIncrement(convertWeight(weight, from, to), step);
}
