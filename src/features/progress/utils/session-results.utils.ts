import type { ProgressionTarget, SessionResult } from "@/shared/types/history.types";
import type { LoggedSetRow } from "../types/progress.types";

/** Series completadas → una `SessionResult` por sesión; `rows` debe venir de la sesión más nueva a la más vieja. */
export function buildSessionResults(rows: readonly LoggedSetRow[]): SessionResult[] {
  const bySession = new Map<string, SessionResult>();
  for (const row of rows) {
    const result = bySession.get(row.sessionId) ?? { date: row.date, sets: [] };
    result.sets.push({ weight: row.weight, unit: row.unit, reps: row.reps, rpe: row.rpe, completed: true });
    bySession.set(row.sessionId, result);
  }
  return [...bySession.values()];
}

/** Lo que se esperaba hacer: el plan si el ejercicio está en él; si no, lo que se hizo la última vez. */
export function deriveTarget(
  planned: { sets: number; reps: number | null } | null,
  latest: SessionResult | undefined,
): ProgressionTarget | null {
  if (planned?.reps != null) return { sets: planned.sets, reps: planned.reps };
  if (!latest) return null;
  const reps = latest.sets.flatMap((set) => (set.reps === null ? [] : [set.reps]));
  return reps.length > 0 ? { sets: latest.sets.length, reps: Math.min(...reps) } : null;
}
