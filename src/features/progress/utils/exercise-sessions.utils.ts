import { bestSetOfSession } from "@/shared/utils/one-rep-max.utils";
import type { ExerciseSession, LoggedSetRow } from "../types/progress.types";
import { setVolumeKg } from "./volume.utils";

export interface ExerciseProgress {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  /** De la sesión más nueva a la más vieja. */
  sessions: ExerciseSession[];
}

/** Agrupa las series por ejercicio y sesión; los ejercicios sin peso y reps (tiempo, peso corporal) no entran. */
export function buildExerciseProgress(
  rows: readonly LoggedSetRow[],
  dayNames: ReadonlyMap<string, string> = new Map(),
): ExerciseProgress[] {
  const byExercise = new Map<string, { head: LoggedSetRow; bySession: Map<string, LoggedSetRow[]> }>();
  for (const row of rows) {
    const entry = byExercise.get(row.exerciseId) ?? { head: row, bySession: new Map() };
    entry.bySession.set(row.sessionId, [...(entry.bySession.get(row.sessionId) ?? []), row]);
    byExercise.set(row.exerciseId, entry);
  }

  return [...byExercise.values()].flatMap(({ head, bySession }): ExerciseProgress[] => {
    const sessions = [...bySession.entries()].flatMap(([sessionId, sets]): ExerciseSession[] => {
      const best = bestSetOfSession(sets.map((set) => ({ ...set, completed: true })));
      const first = sets[0];
      if (!best || !first) return [];
      return [
        {
          sessionId,
          date: first.date,
          dayName: dayNames.get(sessionId) ?? null,
          best,
          completedSets: sets.length,
          volumeKg: sets.reduce((sum, set) => sum + setVolumeKg(set), 0),
        },
      ];
    });
    if (sessions.length === 0) return [];
    sessions.sort((a, b) => b.date.localeCompare(a.date));
    return [{ exerciseId: head.exerciseId, nameEs: head.nameEs, nameEn: head.nameEn, sessions }];
  });
}

interface TopOptions {
  progress: readonly ExerciseProgress[];
  /** Fecha yyyy-MM-dd desde la que se cuentan las sesiones. */
  from: string;
  limit: number;
}

/** Los ejercicios con más sesiones en el periodo; a igualdad, el entrenado más reciente. */
export function topExercises({ progress, from, limit }: TopOptions): (ExerciseProgress & { count: number })[] {
  return progress
    .map((item) => ({ ...item, count: item.sessions.filter((session) => session.date >= from).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || (b.sessions[0]?.date ?? "").localeCompare(a.sessions[0]?.date ?? ""))
    .slice(0, limit);
}
