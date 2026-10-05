import type { SessionResult } from "@/shared/types/history.types";
import type { ExerciseTemplate } from "../types/workout.types";

interface GoalOptions {
  template: ExerciseTemplate;
  /** Peso con el que arranca la sesión de hoy (el del plan o el sugerido). */
  startWeight: number | null;
  /** La última sesión terminada del ejercicio, si existe. */
  latest?: SessionResult | undefined;
}

/**
 * Repeticiones con las que arrancan las series de hoy. Sin rango, el objetivo del plan. Con rango
 * (doble progresión): al subir de peso se vuelve al mínimo; al mismo peso, una más que la peor serie
 * de la última vez, sin pasar del objetivo.
 */
export function goalReps({
  template,
  startWeight,
  latest,
}: GoalOptions): number | null {
  const { reps, repsMin, unit } = template;
  if (reps === null || repsMin === null || startWeight === null) return reps;
  const done = (latest?.sets ?? []).flatMap((set) =>
    set.completed &&
    set.unit === unit &&
    set.weight !== null &&
    set.reps !== null
      ? [{ weight: set.weight, reps: set.reps }]
      : [],
  );
  if (done.length === 0) return reps;

  const lastWeight = Math.max(...done.map((set) => set.weight));
  if (startWeight > lastWeight) return repsMin;
  if (startWeight < lastWeight) return reps;
  const lastReps = Math.min(...done.map((set) => set.reps));
  return Math.min(Math.max(lastReps + 1, repsMin), reps);
}
