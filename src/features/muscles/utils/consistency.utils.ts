import { addWeeks, subDays, subWeeks } from "date-fns";
import { startOfWeekMonday, toIsoDate, weekDates, weekdayIndex } from "@/shared/utils/week.utils";
import type { WeekColumn } from "../types/muscles.types";

export const CONSISTENCY_WEEKS = 12;
const MAX_ROWS = 7;
const STREAK_LOOKBACK_DAYS = 365;

interface ConsistencyOptions {
  /** Fechas yyyy-MM-dd de las sesiones terminadas. */
  sessionDates: readonly string[];
  plannedWeekdays: readonly number[];
  today: Date;
}

/** Cuántas filas tiene el calendario: los entrenos por semana del plan (al menos 1). */
export function consistencyRows(plannedWeekdays: readonly number[]): number {
  return Math.min(MAX_ROWS, Math.max(1, plannedWeekdays.length));
}

/**
 * 12 semanas, de la más vieja a la actual. Cada celda es una sesión: hecha, pendiente (de la semana en curso,
 * según el plan) o vacía. Dos sesiones el mismo día cuentan una sola vez.
 */
export function buildConsistency({ sessionDates, plannedWeekdays, today }: ConsistencyOptions): WeekColumn[] {
  const rows = consistencyRows(plannedWeekdays);
  const currentStart = startOfWeekMonday(today);
  const days = new Set(sessionDates);

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
