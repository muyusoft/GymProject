import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { listPlanExercisesByDay } from "@/shared/db/queries/plan-exercise.queries";
import { listCompletedPlanDayIds } from "@/shared/db/queries/session.queries";
import type { PlanDayRow } from "@/shared/db/types";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import { startOfWeekMonday, toIsoDate, weekDates, weekdayIndex } from "@/shared/utils/week.utils";
import type { TodayExercise, TodayView } from "../types/workout.types";
import { buildHints } from "../utils/hints.utils";
import { buildInsight, type InsightSettings } from "../utils/insight.utils";
import { buildTemplate } from "../utils/template.utils";
import { buildWeekStrip } from "../utils/week-strip.utils";
import { loadHistory } from "./history.service";
import { countCompletedExercises, findActiveSession } from "./session-read.service";

interface DayDetails {
  exercises: TodayExercise[];
  hints: TodayView["hints"];
}

async function loadDayDetails(day: PlanDayRow, now: Date, settings: InsightSettings): Promise<DayDetails> {
  const [details, increments] = await Promise.all([listPlanExercisesByDay(day.id), listIncrements()]);
  const exercises = details.map((detail) => ({
    exerciseId: detail.exercise.id,
    nameEs: detail.exercise.nameEs,
    nameEn: detail.exercise.nameEn,
    template: buildTemplate({
      planExercise: detail.planExercise,
      equipment: detail.exercise.equipment,
      increments,
    }),
  }));
  const history = await loadHistory(exercises.map((exercise) => exercise.exerciseId), now.getTime());
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

function emptyToday(now: Date, base: Pick<TodayView, "hasPlan" | "weekStrip">): TodayView {
  return {
    ...base,
    today: now,
    day: null,
    exercises: [],
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

export async function loadToday({ now, settings }: LoadTodayOptions): Promise<TodayView> {
  const plan = await findActivePlan();
  const weekStart = startOfWeekMonday(now);
  if (!plan) {
    const weekStrip = buildWeekStrip({ weekStart, days: [], completedDayIds: new Set(), today: now });
    return emptyToday(now, { hasPlan: false, weekStrip });
  }

  const dates = weekDates(weekStart);
  const [days, completed] = await Promise.all([
    listPlanDays(plan.id),
    listCompletedPlanDayIds({
      from: toIsoDate(weekStart),
      to: toIsoDate(dates[dates.length - 1] ?? weekStart),
    }),
  ]);
  const completedDayIds = new Set(completed);
  const weekStrip = buildWeekStrip({ weekStart, days, completedDayIds, today: now });
  const day = days.find((candidate) => candidate.weekday === weekdayIndex(now));
  if (!day) return emptyToday(now, { hasPlan: true, weekStrip });

  const { exercises, hints } = await loadDayDetails(day, now, settings);
  const activeSessionId = await findActiveSession(day.id, toIsoDate(now));
  return {
    hasPlan: true,
    today: now,
    weekStrip,
    day: { id: day.id, name: day.name },
    exercises,
    durationMinutes: estimateDurationMinutes(exercises.map((exercise) => exercise.template)),
    totalSets: exercises.reduce((sum, exercise) => sum + exercise.template.sets, 0),
    completedExercises: activeSessionId ? await countCompletedExercises(activeSessionId) : 0,
    activeSessionId,
    isDoneToday: completedDayIds.has(day.id),
    hints,
  };
}
