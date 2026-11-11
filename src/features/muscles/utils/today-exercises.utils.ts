interface PlannedExercise {
  /** El lugar en el plan. */
  planExerciseId: string;
  exerciseId: string;
}

interface DaySwap {
  planExerciseId: string;
  exerciseId: string;
}

/** Los ejercicios que se entrenan hoy: los del día del plan con los cambios de "solo hoy" aplicados, como en Hoy. */
export function todayExerciseIds(
  planned: readonly PlannedExercise[],
  swaps: readonly DaySwap[],
): Set<string> {
  const swapped = new Map(swaps.map((swap) => [swap.planExerciseId, swap.exerciseId]));
  return new Set(planned.map((entry) => swapped.get(entry.planExerciseId) ?? entry.exerciseId));
}
