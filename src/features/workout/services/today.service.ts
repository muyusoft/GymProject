import { findActivePlan } from "@/shared/db/queries/plan.queries";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import type { PlanDayRow } from "@/shared/db/types";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import { scheduledDays } from "@/shared/utils/week-schedule.utils";
import {
  startOfWeekMonday,
  toIsoDate,
  weekdayIndex,
} from "@/shared/utils/week.utils";
import type { TodayExercise, TodayView } from "../types/workout.types";
import { buildDoneExercises } from "../utils/done-exercises.utils";
import { buildHints } from "../utils/hints.utils";
import { buildInsight, type InsightSettings } from "../utils/insight.utils";
import { buildMissedOffer } from "../utils/missed-day.utils";
import { lastPerformance } from "@/shared/utils/last-performance.utils";
import { withLastWeight } from "../utils/last-performance.utils";
import { buildTemplate } from "../utils/template.utils";
import { buildWeekStrip } from "../utils/week-strip.utils";
import { listDayExercises } from "./day-exercises.service";
import { loadHistory } from "./history.service";
import {
  countCompletedExercises,
  findSessionOfDay,
  listSessionLogs,
} from "./session-read.service";
import { loadWeekState } from "./week-state.service";

interface DayDetails {
  exercises: TodayExercise[];
  hints: TodayView["hints"];
}

async function loadDayDetails(
  day: PlanDayRow,
  now: Date,
  settings: InsightSettings,
): Promise<DayDetails> {
  const [details, increments] = await Promise.all([
    listDayExercises(day.id, toIsoDate(now)),
    listIncrements(),
  ]);
  const history = await loadHistory(
    details.map((detail) => detail.exercise.id),
    now.getTime(),
  );
  const exercises = details.map((detail) => ({
    slot: detail.slot,
    exerciseId: detail.exercise.id,
    nameEs: detail.exercise.nameEs,
    nameEn: detail.exercise.nameEn,
    template: withLastWeight(
      buildTemplate({
        planExercise: detail.planExercise,
        equipment: detail.exercise.equipment,
        increments,
      }),
      lastPerformance(history.get(detail.exercise.id)?.[0]),
    ),
  }));
  const candidates = exercises.map((exercise) => ({
    exercise,
    insight: buildInsight({
      history: history.get(exercise.exerciseId) ?? [],
      template: exercise.template,
      settings,
      today: now,
    }),
  }));
  return { exercises, hints: buildHints(candidates) };
}

type SessionState = Pick<
  TodayView,
  "activeSessionId" | "completedExercises" | "doneExercises"
>;

/** La sesión de hoy, abierta o ya terminada: cuántos ejercicios se completaron y, si terminó, cuáles se hicieron. */
async function loadSessionState(
  dayId: string,
  date: string,
  planned: readonly TodayExercise[],
): Promise<SessionState> {
  const session = await findSessionOfDay(dayId, date);
  if (!session)
    return {
      activeSessionId: null,
      completedExercises: 0,
      doneExercises: null,
    };
  const isFinished = session.endedAt !== null;
  return {
    activeSessionId: isFinished ? null : session.id,
    completedExercises: await countCompletedExercises(session.id),
    doneExercises: isFinished
      ? buildDoneExercises(planned, await listSessionLogs(session.id))
      : null,
  };
}

function emptyToday(
  now: Date,
  base: Pick<TodayView, "hasPlan" | "weekStrip" | "missedDay">,
): TodayView {
  return {
    ...base,
    movedFromWeekday: null,
    today: now,
    day: null,
    exercises: [],
    doneExercises: null,
    durationMinutes: 0,
    totalSets: 0,
    completedExercises: 0,
    activeSessionId: null,
    isDoneToday: false,
    hints: [],
  };
}

interface LoadTodayOptions {
  now: Date;
  settings: InsightSettings;
}

export async function loadToday({
  now,
  settings,
}: LoadTodayOptions): Promise<TodayView> {
  const plan = await findActivePlan();
  const weekStart = startOfWeekMonday(now);
  if (!plan) {
    const weekStrip = buildWeekStrip({
      weekStart,
      days: [],
      completedDayIds: new Set(),
      today: now,
    });
    return emptyToday(now, { hasPlan: false, weekStrip, missedDay: null });
  }

  const week = await loadWeekState(plan.id, weekStart);
  const { completedDayIds } = week;
  const weekStrip = buildWeekStrip({
    weekStart,
    days: scheduledDays(week.schedule),
    completedDayIds,
    today: now,
  });
  const todayWeekday = weekdayIndex(now);
  const slot = week.schedule.slots[todayWeekday];
  const missedDay = buildMissedOffer({ week, weekStart, todayWeekday });
  const day = week.days.find((candidate) => candidate.id === slot?.dayId);
  if (!day) return emptyToday(now, { hasPlan: true, weekStrip, missedDay });

  const { exercises, hints } = await loadDayDetails(day, now, settings);
  const sessionState = await loadSessionState(
    day.id,
    toIsoDate(now),
    exercises,
  );
  return {
    hasPlan: true,
    today: now,
    weekStrip,
    day: { id: day.id, name: day.name },
    exercises,
    durationMinutes: estimateDurationMinutes(
      exercises.map((exercise) => exercise.template),
    ),
    totalSets: exercises.reduce(
      (sum, exercise) => sum + exercise.template.sets,
      0,
    ),
    ...sessionState,
    isDoneToday: completedDayIds.has(day.id),
    hints,
    movedFromWeekday:
      slot?.fromWeekday === todayWeekday ? null : (slot?.fromWeekday ?? null),
    // Con el entreno de hoy ya empezado, mover otro día a hoy ya no tiene sentido.
    missedDay: sessionState.activeSessionId || sessionState.doneExercises ? null : missedDay,
  };
}
