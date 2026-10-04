import { and, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listAllExerciseMuscles } from "@/shared/db/queries/exercise.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { listPlanExercisesByDay } from "@/shared/db/queries/plan-exercise.queries";
import { exercises, sessions, setLogs } from "@/shared/db/schema";
import type { MuscleGroup } from "@/shared/types/training.types";
import { weekdayIndex } from "@/shared/utils/week.utils";
import type { GroupRecovery, MuscleLink, RecoverySet } from "../types/muscles.types";
import { toMuscleLink } from "../utils/exercise-muscles.utils";
import { computeRecovery, RECOVERY_HORIZON_HOURS } from "../utils/recovery.utils";

const MS_PER_HOUR = 3_600_000;

export interface RecoveryData {
  recoveries: GroupRecovery[];
  now: number;
  /** El día del plan de hoy y sus grupos principales; null si hoy es descanso o no hay plan. */
  today: { name: string; groups: MuscleGroup[] } | null;
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

async function loadTodayPlan(now: number, links: readonly MuscleLink[]): Promise<RecoveryData["today"]> {
  const plan = await findActivePlan();
  const days = plan ? await listPlanDays(plan.id) : [];
  const day = days.find((candidate) => candidate.weekday === weekdayIndex(new Date(now)));
  if (!day) return null;
  const planned = new Set((await listPlanExercisesByDay(day.id)).map((entry) => entry.exercise.id));
  const groups = links.filter((link) => planned.has(link.exerciseId) && link.role === "primary").map((link) => link.group);
  return { name: day.name, groups: [...new Set(groups)] };
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
