import { and, eq, gte, isNotNull } from "drizzle-orm";
import { startOfMonth, subMonths } from "date-fns";
import { db } from "@/shared/db/client";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { exercises, sessions, setLogs } from "@/shared/db/schema";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { ProgressData } from "../types/progress.types";

const MONTHS_LOADED = 12;

export const loggedSetColumns = {
  sessionId: setLogs.sessionId,
  date: sessions.date,
  exerciseId: setLogs.exerciseId,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  weight: setLogs.weight,
  unit: setLogs.unit,
  reps: setLogs.reps,
  rpe: setLogs.rpe,
  loadType: setLogs.loadType,
  isPR: setLogs.isPR,
};

/** Los últimos 12 meses de series y sesiones, y los días del plan; los rangos se calculan en memoria. */
export async function loadProgress(now: Date): Promise<ProgressData> {
  const from = toIsoDate(startOfMonth(subMonths(now, MONTHS_LOADED - 1)));
  const [sets, sessionRows, plan] = await Promise.all([
    db
      .select(loggedSetColumns)
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .innerJoin(exercises, eq(setLogs.exerciseId, exercises.id))
      .where(and(eq(setLogs.completed, true), isNotNull(sessions.endedAt), gte(sessions.date, from))),
    db
      .select({ id: sessions.id, date: sessions.date })
      .from(sessions)
      .where(and(isNotNull(sessions.endedAt), gte(sessions.date, from))),
    findActivePlan(),
  ]);
  const days = plan ? await listPlanDays(plan.id) : [];
  return {
    sets,
    sessions: sessionRows,
    plannedWeekdays: days.map((day) => day.weekday),
    generatedAt: now.getTime(),
  };
}
