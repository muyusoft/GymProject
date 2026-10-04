import { and, asc, desc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { sessions, setLogs } from "@/shared/db/schema";
import type { SessionResult } from "@/shared/types/history.types";
import { groupHistory } from "../utils/history.utils";

const HISTORY_DAYS = 60;
const MS_PER_DAY = 86_400_000;

/**
 * Sesiones terminadas de los últimos 60 días por ejercicio (de la más nueva a la más vieja).
 * Cubre las 2 sesiones de "subir peso" y las 3 semanas más una anterior de "deload".
 */
export async function loadHistory(
  exerciseIds: readonly string[],
  now: number,
): Promise<Map<string, SessionResult[]>> {
  if (exerciseIds.length === 0) return new Map();
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
    .where(
      and(
        inArray(setLogs.exerciseId, [...exerciseIds]),
        isNotNull(sessions.endedAt),
        gte(sessions.startedAt, now - HISTORY_DAYS * MS_PER_DAY),
      ),
    )
    .orderBy(desc(sessions.startedAt), asc(setLogs.setIndex));
  return groupHistory(rows);
}
