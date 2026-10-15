import type { MuscleGroup } from "@/shared/types/training.types";
import type { SessionExercise } from "../types/workout.types";
import type { DayMuscleLoad } from "./warmup-selection.utils";

export interface PrimaryMuscle {
  exerciseId: string;
  group: MuscleGroup;
}

export interface ExerciseSets {
  exerciseId: string;
  sets: number;
}

/** Cada serie suma uno a cada músculo principal de su ejercicio (de exercise_muscles). */
export function muscleLoad(exercises: readonly ExerciseSets[], muscles: readonly PrimaryMuscle[]): DayMuscleLoad {
  const load: DayMuscleLoad = {};
  for (const { exerciseId, sets } of exercises) {
    for (const muscle of muscles) {
      if (muscle.exerciseId === exerciseId) load[muscle.group] = (load[muscle.group] ?? 0) + sets;
    }
  }
  return load;
}

const UNLOADED = new Set(["bodyweight", "time"]);
const MIN_COMPOUND_GROUPS = 2;

/** El peso de trabajo: el de la primera serie, o el del plan si aún no tiene. */
export function workingWeight(exercise: SessionExercise): number {
  return exercise.sets[0]?.weight ?? exercise.template.targetWeight ?? 0;
}

/**
 * El primer ejercicio compuesto con peso: el único que lleva aproximación.
 * Compuesto = dos o más músculos principales distintos en exercise_muscles.
 */
export function findRampExercise(
  exercises: readonly SessionExercise[],
  muscles: readonly PrimaryMuscle[],
): SessionExercise | null {
  const isCompound = (exerciseId: string) =>
    new Set(muscles.filter((muscle) => muscle.exerciseId === exerciseId).map((muscle) => muscle.group)).size >=
    MIN_COMPOUND_GROUPS;
  return (
    exercises.find(
      (exercise) =>
        !UNLOADED.has(exercise.template.loadType) && workingWeight(exercise) > 0 && isCompound(exercise.exerciseId),
    ) ?? null
  );
}
