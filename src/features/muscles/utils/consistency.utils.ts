import { isSameDay, isSameMonth, parseISO, startOfMonth, subDays } from "date-fns";
import { buildMonthGrid, startOfWeekMonday, toIsoDate, weekDates, weekdayIndex } from "@/shared/utils/week.utils";
import type { CalendarDay, ConsistencyMonth, DayState } from "../types/muscles.types";

const STREAK_LOOKBACK_DAYS = 365;

interface ConsistencyOptions {
  /** Fechas yyyy-MM-dd de las sesiones terminadas. */
  sessionDates: readonly string[];
  plannedWeekdays: readonly number[];
  today: Date;
}

/** Los entrenos planeados de esta semana que aún se pueden hacer (de hoy en adelante). */
function pendingDates({ sessionDates, plannedWeekdays, today }: ConsistencyOptions): Set<string> {
  const done = new Set(sessionDates);
  const todayIso = toIsoDate(today);
  const pending = weekDates(startOfWeekMonday(today))
    .filter((date, weekday) => plannedWeekdays.includes(weekday) && toIsoDate(date) >= todayIso)
    .map(toIsoDate)
    .filter((date) => !done.has(date));
  return new Set(pending);
}

interface MonthOptions extends ConsistencyOptions {
  /** Cualquier día del mes que se quiere ver. */
  month: Date;
}

/**
 * Un mes de constancia, día por día: hecho (hay una sesión terminada), pendiente (planeado esta semana y aún
 * sin hacer) o sin entreno. Dos sesiones el mismo día cuentan una sola vez.
 */
export function buildConsistencyMonth({ month, ...options }: MonthOptions): ConsistencyMonth {
  const done = new Set(options.sessionDates);
  const pending = pendingDates(options);
  const stateOf = (date: string): DayState => {
    if (done.has(date)) return "done";
    return pending.has(date) ? "pending" : "none";
  };
  const toDay = (date: Date): CalendarDay => {
    const iso = toIsoDate(date);
    return { date: iso, dayOfMonth: date.getDate(), state: stateOf(iso), isToday: isSameDay(date, options.today) };
  };
  const rows = buildMonthGrid(month).map((week) => week.map((date) => (date ? toDay(date) : null)));
  const doneCount = rows.flat().filter((day) => day?.state === "done").length;
  return { rows, doneCount };
}

<<<<<<< Updated upstream
  return Array.from({ length: CONSISTENCY_WEEKS }, (_, index) => {
    const weekStart = subWeeks(currentStart, CONSISTENCY_WEEKS - 1 - index);
    const nextStart = toIsoDate(addWeeks(weekStart, 1));
    const dates = [...days]
      .filter((date) => date >= toIsoDate(weekStart) && date < nextStart)
      .sort((a, b) => a.localeCompare(b));
    const done = Math.min(rows, dates.length);
    const isCurrent = index === CONSISTENCY_WEEKS - 1;
    const planned = isCurrent ? Math.min(rows, plannedWeekdays.length) : 0;
    const cells = Array.from({ length: rows }, (_, row) => {
      if (row < done) return "done" as const;
      if (isCurrent && row < planned) return "pending" as const;
      return "empty" as const;
    });
    return { weekStart, cells, dates };
  });
=======
/** El primer mes al que se puede retroceder: el de la primera sesión, o el actual si no hay ninguna. */
export function firstConsistencyMonth(sessionDates: readonly string[], today: Date): Date {
  const first = [...sessionDates].sort((a, b) => a.localeCompare(b))[0];
  const firstMonth = first ? startOfMonth(parseISO(first)) : startOfMonth(today);
  return firstMonth > today ? startOfMonth(today) : firstMonth;
}

export function isCurrentMonth(month: Date, today: Date): boolean {
  return isSameMonth(month, today);
>>>>>>> Stashed changes
}

/**
 * Racha: entrenos planeados seguidos sin saltarse ninguno, contando hacia atrás desde hoy.
 * Los descansos no la cortan; un entreno de hoy aún sin hacer tampoco (todavía hay tiempo).
 */
export function computeStreak({ sessionDates, plannedWeekdays, today }: ConsistencyOptions): number {
  const done = new Set(sessionDates);
  let streak = 0;
  for (let offset = 0; offset <= STREAK_LOOKBACK_DAYS; offset += 1) {
    const day = subDays(today, offset);
    if (!plannedWeekdays.includes(weekdayIndex(day))) continue;
    if (done.has(toIsoDate(day))) streak += 1;
    else if (offset > 0) break;
  }
  return streak;
}

export interface PendingDay {
  weekday: number;
  isToday: boolean;
}

/** El próximo entreno de la semana sin hacer (hoy incluido), o null si la semana está completa. */
export function nextPendingDay({ sessionDates, plannedWeekdays, today }: ConsistencyOptions): PendingDay | null {
  const done = new Set(sessionDates);
  const todayIso = toIsoDate(today);
  const pending = weekDates(startOfWeekMonday(today))
    .map((date, weekday) => ({ date: toIsoDate(date), weekday }))
    .find(({ date, weekday }) => plannedWeekdays.includes(weekday) && date >= todayIso && !done.has(date));
  return pending ? { weekday: pending.weekday, isToday: pending.date === todayIso } : null;
}
