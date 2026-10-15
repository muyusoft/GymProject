import type { SessionExercise } from "../types/workout.types";
import { isExerciseDone } from "./session-stats.utils";

/**
 * Las reps a proponer para el plan al terminar un ejercicio, o null si no hay nada que proponer. Solo con
 * objetivo fijo (con rango, salirse de él es parte de la progresión), con el ejercicio del plan (no un
 * sustituto) y si todas las series se hicieron con las mismas reps: series dispares son cansancio, no un
 * objetivo nuevo.
 */
export function planRepsOffer(exercise: SessionExercise): number | null {
  const { template, slot, sets } = exercise;
  if (template.reps === null || template.repsMin !== null) return null;
  if (slot.isSubstituted || !isExerciseDone(exercise)) return null;
  const reps = new Set(sets.map((set) => set.reps));
  const [only] = [...reps];
  if (reps.size !== 1 || only === null || only === undefined) return null;
  return only === template.reps ? null : only;
}
