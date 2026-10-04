import { isSameDay } from "date-fns";
import { weekDates } from "@/shared/utils/week.utils";
import type { WeekStripDay } from "../types/workout.types";

interface WeekStripOptions {
  weekStart: Date;
  days: readonly { id: string; weekday: number }[];
  completedDayIds: ReadonlySet<string>;
  today: Date;
}

/** Los 7 días de la semana con su estado: hecho, planificado o descanso. */
export function buildWeekStrip({
  weekStart,
  days,
  completedDayIds,
  today,
}: WeekStripOptions): WeekStripDay[] {
  return weekDates(weekStart).map((date, weekday) => {
    const planned = days.find((day) => day.weekday === weekday);
    const status = !planned ? "rest" : completedDayIds.has(planned.id) ? "done" : "planned";
    return { date, weekday, status, isToday: isSameDay(date, today) };
  });
}
