import type { WeightUnit } from "@/shared/types/training.types";
import type { SessionResult } from "@/shared/types/history.types";

export const MAX_SESSIONS_PER_EXERCISE = 12;

export interface HistoryRow {
  exerciseId: string;
  sessionId: string;
  date: string;
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
}

/** Agrupa las series por ejercicio y sesión; `rows` debe venir de la sesión más nueva a la más vieja. */
export function groupHistory(rows: readonly HistoryRow[]): Map<string, SessionResult[]> {
  const byExercise = new Map<string, SessionResult[]>();
  const seen = new Map<string, SessionResult>();

  for (const row of rows) {
    const key = `${row.exerciseId}:${row.sessionId}`;
    let result = seen.get(key);
    if (!result) {
      result = { date: row.date, sets: [] };
      seen.set(key, result);
      byExercise.set(row.exerciseId, [...(byExercise.get(row.exerciseId) ?? []), result]);
    }
    result.sets.push({
      weight: row.weight,
      unit: row.unit,
      reps: row.reps,
      rpe: row.rpe,
      completed: row.completed,
    });
  }

  for (const [exerciseId, sessions] of byExercise) {
    byExercise.set(exerciseId, sessions.slice(0, MAX_SESSIONS_PER_EXERCISE));
  }
  return byExercise;
}
