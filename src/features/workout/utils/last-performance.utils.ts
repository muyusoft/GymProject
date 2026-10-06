import type { SessionResult } from "@/shared/types/history.types";
import type { WeightUnit } from "@/shared/types/training.types";
import type { ExerciseTemplate } from "../types/workout.types";

/** Lo mejor de la última sesión terminada de un ejercicio: su peso más alto y las reps de su peor serie con él. */
export interface LastPerformance {
  weight: number;
  unit: WeightUnit;
  reps: number;
}

export function lastPerformance(
  latest: SessionResult | undefined,
): LastPerformance | null {
  const done = (latest?.sets ?? []).flatMap((set) =>
    set.completed && set.weight !== null && set.reps !== null
      ? [{ weight: set.weight, unit: set.unit, reps: set.reps }]
      : [],
  );
  const heaviest = done.reduce<LastPerformance | null>(
    (top, set) => (top === null || set.weight > top.weight ? set : top),
    null,
  );
  if (!heaviest) return null;
  const atTopWeight = done.filter(
    (set) => set.weight === heaviest.weight && set.unit === heaviest.unit,
  );
  return { ...heaviest, reps: Math.min(...atTopWeight.map((set) => set.reps)) };
}

/**
 * La plantilla con el peso de la última vez en lugar del peso del plan, que solo sirve de punto de partida
 * mientras no hay historial. No aplica a ejercicios sin peso ni si la unidad del plan cambió desde entonces.
 */
export function withLastWeight(
  template: ExerciseTemplate,
  last: LastPerformance | null,
): ExerciseTemplate {
  if (!last || template.targetWeight === null || last.unit !== template.unit)
    return template;
  return { ...template, targetWeight: last.weight };
}
