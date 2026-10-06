import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { findPlanDay } from "@/shared/db/queries/plan.queries";
import { sessions, setLogs } from "@/shared/db/schema";
import type { EquipmentIncrementRow } from "@/shared/db/types";
import type {
  SessionExercise,
  SessionSet,
  SessionView,
} from "../types/workout.types";
import { buildInsight, type InsightSettings } from "../utils/insight.utils";
import {
  lastPerformance,
  withLastWeight,
} from "../utils/last-performance.utils";
import { isExerciseDone } from "../utils/session-stats.utils";
import type { DayExercise } from "../utils/swap.utils";
import { buildTemplate } from "../utils/template.utils";
import { listDayExercises } from "./day-exercises.service";
import { loadHistory } from "./history.service";

export async function findActiveSession(
  dayId: string,
  date: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.planDayId, dayId),
        eq(sessions.date, date),
        isNull(sessions.endedAt),
      ),
    )
    .limit(1);
  return rows[0]?.id ?? null;
}

/** La sesión más reciente de ese día del plan en esa fecha, abierta o terminada. */
export async function findSessionOfDay(
  dayId: string,
  date: string,
): Promise<{ id: string; endedAt: number | null } | null> {
  const rows = await db
    .select({ id: sessions.id, endedAt: sessions.endedAt })
    .from(sessions)
    .where(and(eq(sessions.planDayId, dayId), eq(sessions.date, date)))
    .orderBy(desc(sessions.startedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function listSessionLogs(sessionId: string) {
  return db.select().from(setLogs).where(eq(setLogs.sessionId, sessionId));
}

/** Cuántos ejercicios de la sesión tienen todas sus series hechas. */
export async function countCompletedExercises(
  sessionId: string,
): Promise<number> {
  const rows = await db
    .select()
    .from(setLogs)
    .where(eq(setLogs.sessionId, sessionId));
  const byExercise = new Map<string, { completed: boolean }[]>();
  for (const row of rows) {
    byExercise.set(row.exerciseId, [
      ...(byExercise.get(row.exerciseId) ?? []),
      row,
    ]);
  }
  return [...byExercise.values()].filter((sets) => isExerciseDone({ sets }))
    .length;
}

interface SessionContext {
  settings: InsightSettings;
  now: Date;
  increments: readonly EquipmentIncrementRow[];
  history: Awaited<ReturnType<typeof loadHistory>>;
}

function toSessionExercise(
  detail: DayExercise,
  sets: SessionSet[],
  { settings, now, increments, history }: SessionContext,
): SessionExercise {
  const exerciseHistory = history.get(detail.exercise.id) ?? [];
  const last = lastPerformance(exerciseHistory[0]);
  const template = withLastWeight(
    buildTemplate({
      planExercise: detail.planExercise,
      equipment: detail.exercise.equipment,
      increments,
    }),
    last,
  );
  return {
    slot: detail.slot,
    exerciseId: detail.exercise.id,
    nameEs: detail.exercise.nameEs,
    nameEn: detail.exercise.nameEn,
    template,
    sets,
    insight: buildInsight({
      history: exerciseHistory,
      template,
      settings,
      today: now,
    }),
    last,
  };
}

interface LoadSessionOptions {
  sessionId: string;
  settings: InsightSettings;
  now: Date;
}

export async function loadSession({
  sessionId,
  settings,
  now,
}: LoadSessionOptions): Promise<SessionView | null> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  const day = session?.planDayId ? await findPlanDay(session.planDayId) : null;
  if (!session || !day) return null;

  const [details, logs, increments] = await Promise.all([
    listDayExercises(day.id, session.date),
    db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionId, sessionId))
      .orderBy(asc(setLogs.setIndex)),
    listIncrements(),
  ]);
  const history = await loadHistory(
    details.map((detail) => detail.exercise.id),
    now.getTime(),
  );
  const context = { settings, now, increments, history };

  return {
    id: session.id,
    dayName: day.name,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    exercises: details.map((detail) =>
      toSessionExercise(
        detail,
        logs
          .filter((log) => log.exerciseId === detail.exercise.id)
          .map((log) => ({
            id: log.id,
            index: log.setIndex,
            weight: log.weight,
            unit: log.unit,
            reps: log.reps,
            seconds: log.seconds,
            loadType: log.loadType,
            completed: log.completed,
            isPR: log.isPR,
            rpe: log.rpe,
          })),
        context,
      ),
    ),
  };
}
