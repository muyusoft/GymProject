import { listPlanDays } from "@/shared/db/queries/plan.queries";
import {
  listWeekShifts,
  saveShift,
} from "@/shared/db/queries/schedule-shift.queries";
import { listCompletedPlanDayIds } from "@/shared/db/queries/session.queries";
import type { PlanDayRow } from "@/shared/db/types";
import { buildWeekSchedule } from "@/shared/utils/week-schedule.utils";
import { toIsoDate, weekDates } from "@/shared/utils/week.utils";
import type { WeekState } from "../utils/missed-day.utils";

/** Los días completos del plan: Hoy necesita más que el nombre. */
export type LoadedWeek = Omit<WeekState, "days"> & { days: PlanDayRow[] };

/** La semana del plan con sus días perdidos aplicados y lo que ya se hizo. */
export async function loadWeekState(
  planId: string,
  weekStart: Date,
): Promise<LoadedWeek> {
  const [days, completed, shifts] = await Promise.all([
    listPlanDays(planId),
    listCompletedPlanDayIds({
      from: toIsoDate(weekStart),
      to: toIsoDate(weekDates(weekStart).at(-1) ?? weekStart),
    }),
    listWeekShifts(weekStart),
  ]);
  return {
    days,
    shifts,
    schedule: buildWeekSchedule(days, shifts),
    completedDayIds: new Set(completed),
  };
}

interface MissedDayDecision {
  /** Fecha del día perdido, yyyy-MM-dd. */
  missedDate: string;
  /** Fecha de hoy si se hace hoy; null para seguir con el plan y no volver a preguntar. */
  targetDate: string | null;
}

export function resolveMissedDay({ missedDate, targetDate }: MissedDayDecision): Promise<void> {
  return saveShift({ date: missedDate, targetDate });
}
