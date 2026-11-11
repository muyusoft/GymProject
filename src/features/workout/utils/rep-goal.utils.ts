import type { SessionResult } from "@/shared/types/history.types";
import { effortOfSets, type EffortLevel } from "@/shared/utils/effort.utils";
import type { ExerciseTemplate } from "../types/workout.types";

/** Cuántas repeticiones sumar al mismo peso según cómo se sintió la última vez; sin respuesta, una. */
const REPS_TO_ADD: Record<EffortLevel, number> = { easy: 2, solid: 1, limit: 0 };
const DEFAULT_REPS_TO_ADD = 1;

interface GoalOptions {
  template: ExerciseTemplate;
  /** Peso con el que arranca la sesión de hoy (el del plan o el sugerido). */
  startWeight: number | null;
  /** La última sesión terminada del ejercicio, si existe. */
  latest?: SessionResult | undefined;
  /** La pregunta de esfuerzo de Ajustes; apagada, la respuesta guardada no cuenta. */
  trackRpe?: boolean;
}

/** Series hechas con peso y reps en la unidad del ejercicio. */
function loggedSets(
  latest: SessionResult,
  unit: ExerciseTemplate["unit"],
): { weight: number; reps: number }[] {
  return latest.sets.flatMap((set) =>
    set.completed &&
    set.unit === unit &&
    set.weight !== null &&
    set.reps !== null
      ? [{ weight: set.weight, reps: set.reps }]
      : [],
  );
}

function repsToAdd(latest: SessionResult, trackRpe: boolean): number {
  const effort = trackRpe ? effortOfSets(latest.sets.filter((set) => set.completed)) : null;
  return effort === null ? DEFAULT_REPS_TO_ADD : REPS_TO_ADD[effort];
}

/**
 * Repeticiones con las que arrancan las series de hoy. Sin rango, el objetivo del plan. Con rango
 * (doble progresión): al subir de peso se vuelve al mínimo; al mismo peso, la peor serie de la última vez
 * más lo que diga el esfuerzo (al límite 0, con 1 o 2 en reserva 1, con 3 o más 2), sin pasar del objetivo.
 */
export function goalReps({
  template,
  startWeight,
  latest,
  trackRpe = false,
}: GoalOptions): number | null {
  const { reps, repsMin } = template;
  if (reps === null || repsMin === null || startWeight === null) return reps;
  const done = latest ? loggedSets(latest, template.unit) : [];
  if (!latest || done.length === 0) return reps;

  const lastWeight = Math.max(...done.map((set) => set.weight));
  if (startWeight > lastWeight) return repsMin;
  if (startWeight < lastWeight) return reps;
  const lastReps = Math.min(...done.map((set) => set.reps));
  const next = lastReps + repsToAdd(latest, trackRpe);
  return Math.min(Math.max(next, repsMin), reps);
}
