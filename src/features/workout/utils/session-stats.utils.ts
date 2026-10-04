interface WithCompletion {
  completed: boolean;
}

interface WithSets {
  sets: readonly WithCompletion[];
}

export function countTotalSets(exercises: readonly WithSets[]): number {
  return exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
}

export function countDoneSets(exercises: readonly WithSets[]): number {
  return exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length,
    0,
  );
}

/** 0 a 1; una sesión sin series cuenta como 0 para no dividir entre cero. */
export function sessionProgress(exercises: readonly WithSets[]): number {
  const total = countTotalSets(exercises);
  return total === 0 ? 0 : countDoneSets(exercises) / total;
}

export function isExerciseDone(exercise: WithSets): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
}

export type SetStatus = "pending" | "active" | "done";

interface IdentifiedSet extends WithCompletion {
  id: string;
}

/** La serie activa es la primera pendiente; las demás pendientes esperan su turno. */
export function getSetStatuses(sets: readonly IdentifiedSet[]): Map<string, SetStatus> {
  const activeId = sets.find((set) => !set.completed)?.id;
  return new Map(
    sets.map((set): [string, SetStatus] => [
      set.id,
      set.completed ? "done" : set.id === activeId ? "active" : "pending",
    ]),
  );
}
