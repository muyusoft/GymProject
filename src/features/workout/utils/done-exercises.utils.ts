import type { WeightUnit } from "@/shared/types/training.types";
import type { TodayExercise } from "../types/workout.types";

export interface DoneLog {
  exerciseId: string;
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  seconds: number | null;
  completed: boolean;
  /** Cuándo se tocó la serie por última vez (ms). */
  updatedAt: number;
}

function lowest(values: readonly (number | null)[]): number | null {
  const known = values.flatMap((value) => (value === null ? [] : [value]));
  return known.length > 0 ? Math.min(...known) : null;
}

/** La plantilla del ejercicio reescrita con lo que de verdad se hizo: series hechas, peor serie y peso más alto. */
function toDoneExercise(
  exercise: TodayExercise,
  done: readonly DoneLog[],
): TodayExercise {
  const heaviest = done.reduce<DoneLog | null>(
    (top, log) =>
      log.weight !== null && log.weight > (top?.weight ?? -1) ? log : top,
    null,
  );
  return {
    ...exercise,
    template: {
      ...exercise.template,
      sets: done.length,
      reps: lowest(done.map((log) => log.reps)),
      repsMin: null,
      seconds: lowest(done.map((log) => log.seconds)),
      targetWeight: heaviest?.weight ?? null,
      unit: heaviest?.unit ?? exercise.template.unit,
    },
  };
}

/**
 * Los ejercicios de un entreno terminado, en el orden en que se hicieron. Los que no tienen ninguna
 * serie hecha no aparecen.
 */
export function buildDoneExercises(
  planned: readonly TodayExercise[],
  logs: readonly DoneLog[],
): TodayExercise[] {
  return planned
    .flatMap((exercise) => {
      const done = logs.filter(
        (log) => log.completed && log.exerciseId === exercise.exerciseId,
      );
      if (done.length === 0) return [];
      return [
        {
          finishedAt: Math.max(...done.map((log) => log.updatedAt)),
          exercise: toDoneExercise(exercise, done),
        },
      ];
    })
    .sort((a, b) => a.finishedAt - b.finishedAt)
    .map((item) => item.exercise);
}
