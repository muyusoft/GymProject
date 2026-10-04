import { and, between, isNotNull } from "drizzle-orm";
import { db } from "../client";
import { sessions } from "../schema";

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
