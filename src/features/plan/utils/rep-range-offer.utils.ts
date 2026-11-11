import type { LoadType } from "@/shared/types/training.types";
import {
  parseProgressionRule,
  repRangeMin,
  serializeProgressionRule,
} from "@/shared/utils/progression-rule.utils";

/**
 * El mínimo propuesto es ⅔ del tope: da los mismos rangos que el asistente (8–12, 10–15, 4–6, 6–8)
 * sin tener que saber el objetivo ni si el ejercicio es compuesto.
 */
const RANGE_MIN_RATIO = 2 / 3;

/** Por tiempo no hay reps y con peso corporal no hay peso que subir: la doble progresión no aplica. */
const LOAD_TYPES_WITHOUT_RANGE: ReadonlySet<LoadType> = new Set([
  "time",
  "bodyweight",
]);

interface FixedRepsCandidate {
  reps: number | null;
  loadType: LoadType;
  progressionRule: string | null;
}

/** El mínimo que se propondría para un objetivo fijo; null si no queda un rango real (por ejemplo, 1 rep). */
export function proposedRepsMin(reps: number): number | null {
  const repsMin = Math.round(reps * RANGE_MIN_RATIO);
  return repsMin >= 1 && repsMin < reps ? repsMin : null;
}

/** Un ejercicio con peso y reps fijas, al que se le puede proponer un rango. */
export function canOfferRepRange(candidate: FixedRepsCandidate): boolean {
  const { reps, loadType, progressionRule } = candidate;
  if (reps === null || LOAD_TYPES_WITHOUT_RANGE.has(loadType)) return false;
  if (repRangeMin(parseProgressionRule(progressionRule), reps) !== null)
    return false;
  return proposedRepsMin(reps) !== null;
}

/** La regla del ejercicio con el rango propuesto; conserva el resto (interruptor y sesiones). */
export function withProposedRange(
  progressionRule: string | null,
  reps: number,
): string {
  const rule = parseProgressionRule(progressionRule);
  const repsMin = proposedRepsMin(reps);
  return serializeProgressionRule(
    repsMin === null ? rule : { ...rule, repsMin },
  );
}
