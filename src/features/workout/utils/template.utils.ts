import type { PlanExerciseRow } from "@/shared/db/types";
import type { Equipment, WeightUnit } from "@/shared/types/training.types";
import { formatClock } from "@/shared/utils/duration.utils";
import { weightStepFor } from "@/shared/utils/equipment.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { ExerciseTemplate } from "../types/workout.types";

const SEPARATOR = " · ";

function setsBy(template: ExerciseTemplate): string {
  const work = template.reps ?? formatClock(template.seconds ?? 0);
  return `${template.sets} × ${work}`;
}

function weightText(template: ExerciseTemplate, locale: string): string | null {
  if (template.targetWeight === null) return null;
  return formatWeight({ value: template.targetWeight, unit: template.unit, locale });
}

/** "88 lb · 4 × 12 · 1:30" (peso, series y descanso). */
export function formatTemplateSummary(template: ExerciseTemplate, locale: string): string {
  return [weightText(template, locale), setsBy(template), formatClock(template.restSec)]
    .filter((part): part is string => part !== null)
    .join(SEPARATOR);
}

/** "4 × 12 · 88 lb" (series y peso) para las listas de Hoy. */
export function formatSetsAndWeight(template: ExerciseTemplate, locale: string): string {
  return [setsBy(template), weightText(template, locale)]
    .filter((part): part is string => part !== null)
    .join(SEPARATOR);
}

interface BuildTemplateOptions {
  planExercise: PlanExerciseRow;
  equipment: Equipment;
  increments: readonly { equipment: "dumbbell" | "machine" | "plates"; unit: WeightUnit; step: number }[];
}

export function buildTemplate({ planExercise, equipment, increments }: BuildTemplateOptions): ExerciseTemplate {
  return {
    sets: planExercise.sets,
    reps: planExercise.reps,
    seconds: planExercise.seconds,
    restSec: planExercise.restSec,
    targetWeight: planExercise.targetWeight,
    unit: planExercise.unit,
    loadType: planExercise.loadType,
    weightStep: weightStepFor({ increments, equipment, unit: planExercise.unit }),
  };
}
