import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { listCompletedPlanDayIds } from "@/shared/db/queries/session.queries";
import type { PlanDayRow } from "@/shared/db/types";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import {
  startOfWeekMonday,
  toIsoDate,
  weekDates,
  weekdayIndex,
} from "@/shared/utils/week.utils";
import type { TodayExercise, TodayView } from "../types/workout.types";
import { buildDoneExercises } from "../utils/done-exercises.utils";
import { buildHints } from "../utils/hints.utils";
import { buildInsight, type InsightSettings } from "../utils/insight.utils";
import {
  lastPerformance,
  withLastWeight,
} from "../utils/last-performance.utils";
import { buildTemplate } from "../utils/template.utils";
import { buildWeekStrip } from "../utils/week-strip.utils";
import { listDayExercises } from "./day-exercises.service";
import { loadHistory } from "./history.service";
import {
  countCompletedExercises,
  findSessionOfDay,
  listSessionLogs,
} from "./session-read.service";

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
  base: Pick<TodayView, "hasPlan" | "weekStrip">,
): TodayView {
  return {
    ...base,
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
    return emptyToday(now, { hasPlan: false, weekStrip });
  }

  const dates = weekDates(weekStart);
  const [days, completed] = await Promise.all([
    listPlanDays(plan.id),
    listCompletedPlanDayIds({
      from: toIsoDate(weekStart),
      to: toIsoDate(dates.at(-1) ?? weekStart),
    }),
  ]);
  const completedDayIds = new Set(completed);
  const weekStrip = buildWeekStrip({
    weekStart,
    days,
    completedDayIds,
    today: now,
  });
  const day = days.find((candidate) => candidate.weekday === weekdayIndex(now));
  if (!day) return emptyToday(now, { hasPlan: true, weekStrip });

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
  };
}
