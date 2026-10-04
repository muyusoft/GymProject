import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import type { PlanDayRow, PlanExerciseRow } from "@/shared/db/types";
import type { DayDefaults, DaySummary } from "../types/plan.types";
import { WEEKDAY_COUNT } from "@/shared/utils/week.utils";

export const FALLBACK_DEFAULTS: DayDefaults = { sets: 4, reps: 12, restSec: 90 };

interface SummaryOptions {
  days: readonly PlanDayRow[];
  exercises: readonly PlanExerciseRow[];
  completedDayIds: ReadonlySet<string>;
  todayWeekday: number;
}

export function buildDaySummaries({
  days,
  exercises,
  completedDayIds,
  todayWeekday,
}: SummaryOptions): DaySummary[] {
  return days.map((day) => {
    const ofDay = exercises.filter((exercise) => exercise.planDayId === day.id);
    return {
      id: day.id,
      weekday: day.weekday,
      name: day.name,
      exerciseCount: ofDay.length,
      durationMinutes: estimateDurationMinutes(ofDay),
      isDone: completedDayIds.has(day.id),
      isToday: day.weekday === todayWeekday,
    };
  });
}

/** Días de la semana sin día de entreno: son los descansos y los destinos libres al mover o duplicar. */
export function getFreeWeekdays(days: readonly { weekday: number }[]): number[] {
  const used = new Set(days.map((day) => day.weekday));
  return Array.from({ length: WEEKDAY_COUNT }, (_, weekday) => weekday).filter(
    (weekday) => !used.has(weekday),
  );
}

/** Los valores base del plan son los del primer día; sin días, los de siempre. */
export function planDefaults(days: readonly PlanDayRow[]): DayDefaults {
  const first = days[0];
  if (!first) return FALLBACK_DEFAULTS;
  return { sets: first.defaultSets, reps: first.defaultReps, restSec: first.defaultRestSec };
}
