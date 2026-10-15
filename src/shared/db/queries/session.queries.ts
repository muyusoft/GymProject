import { and, asc, between, count, desc, eq, inArray, isNotNull } from "drizzle-orm";
import type { SessionResult } from "@/shared/types/history.types";
import { db } from "../client";
import { sessions, setLogs } from "../schema";

interface DateRange {
  from: string;
  to: string;
}

/** Ids de los días del plan con una sesión terminada en el rango (fechas yyyy-MM-dd). */
export async function listCompletedPlanDayIds({
  from,
  to,
}: DateRange): Promise<string[]> {
  const rows = await db
    .select({ planDayId: sessions.planDayId })
    .from(sessions)
    .where(
      and(between(sessions.date, from, to), isNotNull(sessions.endedAt), isNotNull(sessions.planDayId)),
    );
  return rows.flatMap((row) => (row.planDayId ? [row.planDayId] : []));
}

/**
 * La última sesión terminada de cada ejercicio, sin límite de fecha: de ahí sale el último peso real.
 * Ejercicios sin historial no aparecen en el mapa.
 */
export async function listLastResults(
  exerciseIds: readonly string[],
): Promise<Map<string, SessionResult>> {
  const latest = new Map<string, SessionResult & { sessionId: string }>();
  if (exerciseIds.length === 0) return latest;
  const rows = await db
    .select({
      exerciseId: setLogs.exerciseId,
      sessionId: setLogs.sessionId,
      date: sessions.date,
      weight: setLogs.weight,
      unit: setLogs.unit,
      reps: setLogs.reps,
      rpe: setLogs.rpe,
      completed: setLogs.completed,
    })
    .from(setLogs)
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .where(and(inArray(setLogs.exerciseId, [...exerciseIds]), isNotNull(sessions.endedAt)))
    .orderBy(desc(sessions.startedAt), asc(setLogs.setIndex));
  for (const { exerciseId, sessionId, date, ...set } of rows) {
    const found = latest.get(exerciseId);
    if (!found) latest.set(exerciseId, { sessionId, date, sets: [set] });
    else if (found.sessionId === sessionId) found.sets.push(set);
  }
  return latest;
}

export interface ExerciseSetCount {
  exerciseId: string;
  sets: number;
}

/** Series hechas por ejercicio en una sesión: deciden qué estirar al terminar. */
export async function listDoneSetCounts(sessionId: string): Promise<ExerciseSetCount[]> {
  return db
    .select({ exerciseId: setLogs.exerciseId, sets: count() })
    .from(setLogs)
    .where(and(eq(setLogs.sessionId, sessionId), eq(setLogs.completed, true)))
    .groupBy(setLogs.exerciseId);
}
