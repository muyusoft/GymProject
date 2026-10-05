import { asc, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { sessions } from "@/shared/db/schema";

/** Fechas (yyyy-MM-dd) con al menos una sesión terminada, de la más vieja a la más nueva. */
export async function listTrainedDates(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date: sessions.date })
    .from(sessions)
    .where(isNotNull(sessions.endedAt))
    .orderBy(asc(sessions.date));
  return rows.map((row) => row.date);
}
