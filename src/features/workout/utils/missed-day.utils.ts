import { addDays } from "date-fns";
import {
  buildWeekSchedule,
  type ScheduleShift,
  type WeekSchedule,
} from "@/shared/utils/week-schedule.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { MissedDayOffer } from "../types/workout.types";

export interface WeekState {
  days: readonly { id: string; weekday: number; name: string }[];
  shifts: readonly ScheduleShift[];
  schedule: WeekSchedule;
  completedDayIds: ReadonlySet<string>;
}

interface MissedDay {
  weekday: number;
  dayId: string;
}

/**
 * El último día de entreno antes de hoy, dentro de esta semana, si quedó sin hacer y sin decisión.
 * Solo ese: los anteriores ya pasaron y no se vuelven a ofrecer.
 */
export function findMissedDay(week: WeekState, todayWeekday: number): MissedDay | null {
  const handled = new Set(week.shifts.map((shift) => shift.missedWeekday));
  for (let weekday = todayWeekday - 1; weekday >= 0; weekday -= 1) {
    const dayId = week.schedule.slots[weekday]?.dayId ?? null;
    if (dayId === null) continue;
    if (handled.has(weekday) || week.completedDayIds.has(dayId)) return null;
    return { weekday, dayId };
  }
  return null;
}

/** Los días que dejarían de caber esta semana si el perdido se hace hoy (los que ya no cabían no cuentan). */
export function lostByMoving(
  week: WeekState,
  missed: MissedDay,
  todayWeekday: number,
): string[] {
  const moved = buildWeekSchedule(week.days, [
    ...week.shifts,
    { missedWeekday: missed.weekday, targetWeekday: todayWeekday },
  ]);
  return moved.lostDayIds.filter((id) => !week.schedule.lostDayIds.includes(id));
}

interface OfferOptions {
  week: WeekState;
  weekStart: Date;
  todayWeekday: number;
}

/** Lo que Hoy ofrece sobre el día perdido: cuál fue y qué día se perdería si se hace hoy. */
export function buildMissedOffer({
  week,
  weekStart,
  todayWeekday,
}: OfferOptions): MissedDayOffer | null {
  const missed = findMissedDay(week, todayWeekday);
  if (!missed) return null;
  const nameOf = (id: string) => week.days.find((day) => day.id === id)?.name ?? "";
  const [lostId] = lostByMoving(week, missed, todayWeekday);
  return {
    date: toIsoDate(addDays(weekStart, missed.weekday)),
    weekday: missed.weekday,
    dayName: nameOf(missed.dayId),
    lostDayName: lostId === undefined ? null : nameOf(lostId),
  };
}
