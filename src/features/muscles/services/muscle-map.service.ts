import { and, eq, gte, isNotNull } from "drizzle-orm";
import { subWeeks } from "date-fns";
import { db } from "@/shared/db/client";
import { listAllExerciseMuscles } from "@/shared/db/queries/exercise.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { sessions, setLogs } from "@/shared/db/schema";
import { startOfWeekMonday, toIsoDate } from "@/shared/utils/week.utils";
import type { MuscleLink } from "../types/muscles.types";
import { CONSISTENCY_WEEKS } from "../utils/consistency.utils";
import { toMuscleLink } from "../utils/exercise-muscles.utils";

export interface MuscleMapData {
  /** Una entrada por serie completada esta semana. */
  weekSets: { exerciseId: string }[];
  links: MuscleLink[];
  /** Fechas yyyy-MM-dd de las sesiones terminadas de las últimas 12 semanas. */
  sessionDates: string[];
  plannedWeekdays: number[];
  today: Date;
}

export async function loadMuscleMap(today: Date): Promise<MuscleMapData> {
  const weekStart = toIsoDate(startOfWeekMonday(today));
  const historyStart = toIsoDate(subWeeks(startOfWeekMonday(today), CONSISTENCY_WEEKS - 1));
  const [weekSets, sessionRows, rows, plan] = await Promise.all([
    db
      .select({ exerciseId: setLogs.exerciseId })
      .from(setLogs)
      .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
      .where(and(eq(setLogs.completed, true), isNotNull(sessions.endedAt), gte(sessions.date, weekStart))),
    db
      .select({ date: sessions.date })
      .from(sessions)
      .where(and(isNotNull(sessions.endedAt), gte(sessions.date, historyStart))),
    listAllExerciseMuscles(),
    findActivePlan(),
  ]);
  const days = plan ? await listPlanDays(plan.id) : [];
  return {
    weekSets,
    links: rows.map(toMuscleLink),
    sessionDates: sessionRows.map((row) => row.date),
    plannedWeekdays: days.map((day) => day.weekday),
    today,
  };
}
