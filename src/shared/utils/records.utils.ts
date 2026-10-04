import { oneRepMaxKg, type ValidSet } from "./one-rep-max.utils";
import { convertWeight } from "./weight.utils";

const EPSILON = 1e-6;

/**
 * Récord = nueva mejor marca de 1RM estimado, o más peso con las mismas reps.
 * Se compara contra las series completadas de otras sesiones con el mismo tipo de carga;
 * sin historial no hay nada que superar, así que la primera marca no cuenta como récord.
 */
export function isRecord(candidate: ValidSet, history: readonly ValidSet[]): boolean {
  const pool = history.filter((set) => set.loadType === candidate.loadType);
  if (pool.length === 0) return false;

  const candidateEstimate = oneRepMaxKg(candidate);
  const bestEstimate = Math.max(...pool.map(oneRepMaxKg));
  if (candidateEstimate > bestEstimate + EPSILON) return true;

  const sameReps = pool.filter((set) => set.reps === candidate.reps);
  if (sameReps.length === 0) return false;
  const heaviest = Math.max(...sameReps.map((set) => convertWeight(set.weight, set.unit, "kg")));
  return convertWeight(candidate.weight, candidate.unit, "kg") > heaviest + EPSILON;
}
