import {
  deletePlanDay,
  findActivePlan,
  findPlanDay,
  insertPlan,
  insertPlanDay,
  listPlanDays,
  updatePlan,
  updatePlanDay,
} from "@/shared/db/queries/plan.queries";
import {
  insertPlanExercise,
  listPlanExercisesByDay,
  listPlanExercisesByPlan,
} from "@/shared/db/queries/plan-exercise.queries";
import { listCompletedPlanDayIds } from "@/shared/db/queries/session.queries";
import type { PlanDayRow, PlanRow } from "@/shared/db/types";
import { syncReminders } from "@/shared/services/reminders.service";
import type { PlanSettingsPatch, WeeklyPlan } from "../types/plan.types";
import {
  buildDaySummaries,
  getFreeWeekdays,
  planDefaults,
} from "../utils/plan-summary.utils";
import {
  startOfWeekMonday,
  toIsoDate,
  weekDates,
  weekdayIndex,
} from "@/shared/utils/week.utils";

async function loadCompletedDayIds(weekStart: Date): Promise<Set<string>> {
  const dates = weekDates(weekStart);
  const ids = await listCompletedPlanDayIds({
    from: toIsoDate(weekStart),
    to: toIsoDate(dates.at(-1) ?? weekStart),
  });
  return new Set(ids);
}

async function summarizePlan(plan: PlanRow, today: Date): Promise<WeeklyPlan> {
  const weekStart = startOfWeekMonday(today);
  const [days, inWeek, completedDayIds] = await Promise.all([
    listPlanDays(plan.id),
    listPlanExercisesByPlan(plan.id),
    loadCompletedDayIds(weekStart),
  ]);
  const exercises = inWeek.map((entry) => entry.planExercise);

  return {
    id: plan.id,
    name: plan.name,
    repeatsWeekly: plan.repeatsWeekly,
    days: buildDaySummaries({
      days,
      exercises,
      completedDayIds,
      todayWeekday: weekdayIndex(today),
    }),
    restWeekdays: getFreeWeekdays(days),
    totalExercises: exercises.length,
    defaults: planDefaults(days),
    weekStart,
  };
}

/** Plan activo con el resumen de cada día y su estado esta semana; null si todavía no hay plan. */
export async function loadWeeklyPlan(today: Date): Promise<WeeklyPlan | null> {
  const plan = await findActivePlan();
  return plan ? summarizePlan(plan, today) : null;
}

export async function createPlan(name: string): Promise<void> {
  await insertPlan(name);
}

export function savePlanSettings(
  planId: string,
  patch: PlanSettingsPatch,
): Promise<void> {
  return updatePlan(planId, patch);
}

interface AddDayOptions {
  planId: string;
  weekday: number;
  name: string;
}

export async function addDay({
  planId,
  weekday,
  name,
}: AddDayOptions): Promise<PlanDayRow> {
  const defaults = planDefaults(await listPlanDays(planId));
  const created = await insertPlanDay({
    planId,
    weekday,
    name,
    order: weekday,
    defaultSets: defaults.sets,
    defaultReps: defaults.reps,
    defaultRestSec: defaults.restSec,
  });
  void syncReminders();
  return created;
}

export async function moveDay(dayId: string, weekday: number): Promise<void> {
  await updatePlanDay(dayId, { weekday, order: weekday });
  void syncReminders();
}

interface DuplicateDayOptions {
  dayId: string;
  weekday: number;
  name: string;
}

/** Copia el día y sus ejercicios al día libre elegido; el historial queda con el ejercicio, no con la copia. */
export async function duplicateDay({
  dayId,
  weekday,
  name,
}: DuplicateDayOptions): Promise<void> {
  const source = await findPlanDay(dayId);
  if (!source) throw new Error(`Plan day not found: ${dayId}`);
  const copy = await insertPlanDay({
    planId: source.planId,
    weekday,
    name,
    order: weekday,
    defaultSets: source.defaultSets,
    defaultReps: source.defaultReps,
    defaultRestSec: source.defaultRestSec,
  });
  const sourceExercises = await listPlanExercisesByDay(source.id);
  await Promise.all(
    sourceExercises.map(({ planExercise }) =>
      insertPlanExercise({
        planDayId: copy.id,
        exerciseId: planExercise.exerciseId,
        order: planExercise.order,
        sets: planExercise.sets,
        reps: planExercise.reps,
        seconds: planExercise.seconds,
        restSec: planExercise.restSec,
        targetWeight: planExercise.targetWeight,
        unit: planExercise.unit,
        loadType: planExercise.loadType,
        progressionRule: planExercise.progressionRule,
      }),
    ),
  );
  void syncReminders();
}

export async function removeDay(dayId: string): Promise<void> {
  await deletePlanDay(dayId);
  void syncReminders();
}
