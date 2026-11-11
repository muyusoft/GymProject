import { and, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listAllExerciseMuscles } from "@/shared/db/queries/exercise.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { listPlanExercisesByDay } from "@/shared/db/queries/plan-exercise.queries";
import { listWeekShifts } from "@/shared/db/queries/schedule-shift.queries";
import { exerciseSwaps, exercises, sessions, setLogs } from "@/shared/db/schema";
import type { PlanDayRow } from "@/shared/db/types";
import type { MuscleGroup } from "@/shared/types/training.types";
import { buildWeekSchedule } from "@/shared/utils/week-schedule.utils";
import { startOfWeekMonday, toIsoDate, weekdayIndex } from "@/shared/utils/week.utils";
import type { GroupRecovery, MuscleLink, RecoverySet } from "../types/muscles.types";
import { toMuscleLink } from "../utils/exercise-muscles.utils";
import { computeRecovery, RECOVERY_HORIZON_HOURS } from "../utils/recovery.utils";
import { todayExerciseIds } from "../utils/today-exercises.utils";

const MS_PER_HOUR = 3_600_000;

export interface RecoveryData {
  recoveries: GroupRecovery[];
  now: number;
  /** El día del plan de hoy, sus grupos principales y si ya se entrenó; null si hoy es descanso o no hay plan. */
  today: { name: string; groups: MuscleGroup[]; isDone: boolean } | null;
}

async function loadRecentSets(now: number): Promise<RecoverySet[]> {
  const rows = await db
    .select({
      sessionId: setLogs.sessionId,
      exerciseId: setLogs.exerciseId,
      nameEs: exercises.nameEs,
      nameEn: exercises.nameEn,
      endedAt: sessions.endedAt,
      rpe: setLogs.rpe,
    })
    .from(setLogs)
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .innerJoin(exercises, eq(setLogs.exerciseId, exercises.id))
    .where(
      and(
        eq(setLogs.completed, true),
        isNotNull(sessions.endedAt),
        gte(sessions.endedAt, now - RECOVERY_HORIZON_HOURS * MS_PER_HOUR),
      ),
    );
  return rows.flatMap((row) => (row.endedAt === null ? [] : [{ ...row, endedAt: row.endedAt }]));
}

/** Si hoy ya se terminó un entreno, sea del día que sea del plan. */
async function hasFinishedToday(now: number): Promise<boolean> {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.date, toIsoDate(new Date(now))), isNotNull(sessions.endedAt)))
    .limit(1);
  return rows.length > 0;
}

/** El día del plan que toca hoy, con los días movidos de esta semana aplicados: el mismo que muestra Hoy. */
async function findTodayDay(today: Date): Promise<PlanDayRow | null> {
  const plan = await findActivePlan();
  if (!plan) return null;
  const [days, shifts] = await Promise.all([listPlanDays(plan.id), listWeekShifts(startOfWeekMonday(today))]);
  const slot = buildWeekSchedule(days, shifts).slots[weekdayIndex(today)];
  return days.find((candidate) => candidate.id === slot?.dayId) ?? null;
}

/** Los ejercicios de ese día tal como se entrenan hoy, con los cambios de "solo hoy". */
async function loadTodayExerciseIds(dayId: string, today: Date): Promise<Set<string>> {
  const [details, swaps] = await Promise.all([
    listPlanExercisesByDay(dayId),
    db.select().from(exerciseSwaps).where(eq(exerciseSwaps.date, toIsoDate(today))),
  ]);
  const planned = details.map((entry) => ({ planExerciseId: entry.planExercise.id, exerciseId: entry.exercise.id }));
  return todayExerciseIds(planned, swaps);
}

async function loadTodayPlan(now: number, links: readonly MuscleLink[]): Promise<RecoveryData["today"]> {
  const today = new Date(now);
  const day = await findTodayDay(today);
  if (!day) return null;
  const planned = await loadTodayExerciseIds(day.id, today);
  const groups = links.filter((link) => planned.has(link.exerciseId) && link.role === "primary").map((link) => link.group);
  return { name: day.name, groups: [...new Set(groups)], isDone: await hasFinishedToday(now) };
}

/** Recuperación de cada grupo muscular a partir de las sesiones de las últimas 72 h. */
export async function loadRecovery(now: number): Promise<RecoveryData> {
  const [sets, rows] = await Promise.all([loadRecentSets(now), listAllExerciseMuscles()]);
  const links = rows.map(toMuscleLink);
  return {
    recoveries: computeRecovery({ sets, links, now }),
    now,
    today: await loadTodayPlan(now, links),
  };
}
