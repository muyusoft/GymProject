import { eachDayOfInterval, startOfMonth } from "date-fns";
import { toIsoDate, weekdayIndex } from "@/shared/utils/week.utils";

const PERCENT = 100;

interface PlannedOptions {
  weekdays: readonly number[];
  from: Date;
  to: Date;
}

/** Cuántos entrenos del plan caían entre las dos fechas (inclusive). */
export function countPlannedSessions({ weekdays, from, to }: PlannedOptions): number {
  if (from > to) return 0;
  return eachDayOfInterval({ start: from, end: to }).filter((day) => weekdays.includes(weekdayIndex(day))).length;
}

export interface MonthSessionStats {
  done: number;
  planned: number;
  /** Entero, o null si el plan no preveía ningún entreno. */
  percent: number | null;
}

interface MonthOptions {
  sessions: readonly { id: string; date: string }[];
  plannedWeekdays: readonly number[];
  today: Date;
}

/** Sesiones hechas este mes contra las que el plan preveía hasta hoy. */
export function monthSessionStats({ sessions, plannedWeekdays, today }: MonthOptions): MonthSessionStats {
  const monthStart = startOfMonth(today);
  const done = new Set(
    sessions.filter((session) => session.date >= toIsoDate(monthStart) && session.date <= toIsoDate(today)).map((session) => session.id),
  ).size;
  const planned = countPlannedSessions({ weekdays: plannedWeekdays, from: monthStart, to: today });
  return { done, planned, percent: planned > 0 ? Math.round((done / planned) * PERCENT) : null };
}
