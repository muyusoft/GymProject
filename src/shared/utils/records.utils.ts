import { oneRepMaxKg, type ValidSet } from "./one-rep-max.utils";
import { convertWeight } from "./weight.utils";

const EPSILON = 1e-6;

/** "weight": más peso que nunca con esas reps. "strength": mejor 1RM estimado, aunque el peso sea menor. */
export type RecordKind = "weight" | "strength";

function isHeavierAtSameReps(candidate: ValidSet, pool: readonly ValidSet[]): boolean {
  const sameReps = pool.filter((set) => set.reps === candidate.reps);
  if (sameReps.length === 0) return false;
  const heaviest = Math.max(...sameReps.map((set) => convertWeight(set.weight, set.unit, "kg")));
  return convertWeight(candidate.weight, candidate.unit, "kg") > heaviest + EPSILON;
}

const inKg = (set: ValidSet) => convertWeight(set.weight, set.unit, "kg");

/**
 * Qué récord es la serie, o null si no lo es. Se compara contra las series completadas de otras sesiones con
 * el mismo tipo de carga; sin historial no hay nada que superar. Primero el peso más alto de siempre (se
 * reconoce sin hacer cuentas); si no, una mejor fuerza estimada; si no, más peso que nunca con esas reps.
 */
export function recordKind(candidate: ValidSet, history: readonly ValidSet[]): RecordKind | null {
  const pool = history.filter((set) => set.loadType === candidate.loadType);
  if (pool.length === 0) return null;
  if (inKg(candidate) > Math.max(...pool.map(inKg)) + EPSILON) return "weight";
  const bestEstimate = Math.max(...pool.map(oneRepMaxKg));
  if (oneRepMaxKg(candidate) > bestEstimate + EPSILON) return "strength";
  return isHeavierAtSameReps(candidate, pool) ? "weight" : null;
}

/** Récord = nueva mejor marca de 1RM estimado, o más peso con las mismas reps. */
export function isRecord(candidate: ValidSet, history: readonly ValidSet[]): boolean {
  return recordKind(candidate, history) !== null;
}
