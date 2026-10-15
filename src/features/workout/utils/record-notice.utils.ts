import { toValidSet, type ValidSet } from "@/shared/utils/one-rep-max.utils";
import { isRecord } from "@/shared/utils/records.utils";
import type { SessionSet } from "../types/workout.types";

/**
 * ¿Avisar del récord de esta serie? Sí si es el primero del ejercicio en la sesión, o si supera a los
 * récords que ya se hicieron en ella. Repetir el mismo peso nuevo sigue siendo récord (lleva trofeo),
 * pero no vuelve a avisar.
 */
export function shouldAnnounceRecord(
  candidate: ValidSet,
  setId: string,
  sets: readonly SessionSet[],
): boolean {
  const earlier = sets.flatMap((set) => {
    const valid = set.id !== setId && set.isPR ? toValidSet(set) : null;
    return valid ? [valid] : [];
  });
  return earlier.length === 0 || isRecord(candidate, earlier);
}
