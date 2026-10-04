import { and, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { sessions, setLogs } from "@/shared/db/schema";
import { toValidSet, type ValidSet } from "@/shared/utils/one-rep-max.utils";
import { isRecord } from "@/shared/utils/records.utils";

interface RecordCheck {
  exerciseId: string;
  /** La sesión en curso queda fuera: un récord se compara con lo hecho antes. */
  sessionId: string;
  candidate: ValidSet;
}

/** ¿Esta serie supera todo lo registrado antes de este ejercicio (sesiones terminadas, incluidas las importadas)? */
export async function isNewRecord({ exerciseId, sessionId, candidate }: RecordCheck): Promise<boolean> {
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
  return isRecord(candidate, history);
}
