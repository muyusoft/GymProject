import { and, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { sessions, setLogs } from "@/shared/db/schema";
import { toValidSet, type ValidSet } from "@/shared/utils/one-rep-max.utils";
import { recordKind, type RecordKind } from "@/shared/utils/records.utils";

interface RecordCheck {
  exerciseId: string;
  /** La sesión en curso queda fuera: un récord se compara con lo hecho antes. */
  sessionId: string;
  candidate: ValidSet;
}

/** Qué récord es esta serie frente a todo lo registrado antes (sesiones terminadas, incluidas las importadas); null si ninguno. */
export async function findNewRecord({ exerciseId, sessionId, candidate }: RecordCheck): Promise<RecordKind | null> {
  const rows = await db
    .select({
      weight: setLogs.weight,
      unit: setLogs.unit,
      reps: setLogs.reps,
      loadType: setLogs.loadType,
      completed: setLogs.completed,
    })
    .from(setLogs)
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .where(
      and(
        eq(setLogs.exerciseId, exerciseId),
        eq(setLogs.completed, true),
        ne(sessions.id, sessionId),
        isNotNull(sessions.endedAt),
      ),
    );
  const history = rows.flatMap((row) => {
    const valid = toValidSet(row);
    return valid ? [valid] : [];
  });
  return recordKind(candidate, history);
}
