import type { SessionSet } from "../types/workout.types";

export interface SetCopy {
  id: string;
  patch: Pick<SessionSet, "weight" | "reps" | "seconds">;
}

function differs(set: SessionSet, source: SessionSet): boolean {
  return (
    set.weight !== source.weight ||
    set.reps !== source.reps ||
    set.seconds !== source.seconds
  );
}

/**
 * Copiar peso y reps (o tiempo) de una serie a las que vienen después y siguen pendientes. Las hechas no se
 * tocan: son lo que de verdad se levantó. La unidad no se copia: ya es la misma en todas las pendientes.
 */
export function copyToFollowing(
  sets: readonly SessionSet[],
  setId: string | null,
): SetCopy[] {
  const index = sets.findIndex((set) => set.id === setId);
  const source = sets[index];
  if (!source) return [];
  const { weight, reps, seconds } = source;
  return sets
    .slice(index + 1)
    .filter((set) => !set.completed && differs(set, source))
    .map((set) => ({ id: set.id, patch: { weight, reps, seconds } }));
}
