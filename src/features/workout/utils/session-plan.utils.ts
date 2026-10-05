import type { setLogs } from "@/shared/db/schema";
import type { SessionResult } from "@/shared/types/history.types";
import type {
  ExerciseInsight,
  ExerciseTemplate,
  SessionSet,
} from "../types/workout.types";
import { goalReps } from "./rep-goal.utils";

export type NewSetLog = typeof setLogs.$inferInsert;

interface InitialSetsOptions {
  sessionId: string;
  exerciseId: string;
  template: ExerciseTemplate;
  insight: ExerciseInsight;
  createId: () => string;
  /** La última sesión terminada del ejercicio; con rango de reps decide con cuántas arranca hoy. */
  latest?: SessionResult | undefined;
}

/**
 * Series de la sesión para un ejercicio, todas pendientes. Si la regla de subir peso se cumple,
 * la sesión (no el plan) arranca con el peso sugerido. Con rango de reps, arranca con la meta de hoy.
 */
export function buildInitialSets({
  sessionId,
  exerciseId,
  template,
  insight,
  createId,
  latest,
}: InitialSetsOptions): NewSetLog[] {
  const weight = insight.increase ?? template.targetWeight;
  const reps = goalReps({ template, startWeight: weight, latest });
  return Array.from({ length: template.sets }, (_, setIndex) => ({
    id: createId(),
    sessionId,
    exerciseId,
    setIndex,
    weight,
    unit: template.unit,
    loadType: template.loadType,
    reps,
    seconds: template.seconds,
    completed: false,
    isPR: false,
  }));
}

/** "+ Serie" repite los valores de la última serie del ejercicio. */
export function nextSetValues(
  last: SessionSet | undefined,
  template: ExerciseTemplate,
): Pick<SessionSet, "weight" | "unit" | "reps" | "seconds" | "loadType"> {
  return {
    weight: last?.weight ?? template.targetWeight,
    unit: last?.unit ?? template.unit,
    reps: last?.reps ?? template.reps,
    seconds: last?.seconds ?? template.seconds,
    loadType: last?.loadType ?? template.loadType,
  };
}
