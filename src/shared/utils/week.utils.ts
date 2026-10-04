import { addDays, format, startOfWeek } from "date-fns";

export const WEEKDAY_COUNT = 7;
const SUNDAY_INDEX = 0;
const WEEK_STARTS_ON_MONDAY = 1;
const ISO_DATE_FORMAT = "yyyy-MM-dd";

/** 0 = lunes … 6 = domingo (la convención del plan, no la de Date). */
export function weekdayIndex(date: Date): number {
  const day = date.getDay();
  return day === SUNDAY_INDEX ? WEEKDAY_COUNT - 1 : day - 1;
}

export function startOfWeekMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON_MONDAY });
}

export function weekDates(weekStart: Date): Date[] {
  return Array.from({ length: WEEKDAY_COUNT }, (_, offset) => addDays(weekStart, offset));
}

export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}
