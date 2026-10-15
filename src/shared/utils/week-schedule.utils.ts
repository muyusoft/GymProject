import { WEEKDAY_COUNT } from "./week.utils";

/** Qué se hizo con un día perdido de esta semana: se hizo otro día (`targetWeekday`) o se dejó pasar (null). */
export interface ScheduleShift {
  /** 0 = lunes … 6 = domingo. */
  missedWeekday: number;
  targetWeekday: number | null;
}

export interface WeekSlot {
  /** Día del plan que toca ese día esta semana; null = no hay entreno. */
  dayId: string | null;
  /** De qué día de la semana viene; igual a su posición si no se movió. */
  fromWeekday: number | null;
}

export interface WeekSchedule {
  /** Siete posiciones, de lunes a domingo. */
  slots: WeekSlot[];
  /** Días que no cupieron antes del domingo: esta semana se pierden. */
  lostDayIds: string[];
  /** Días perdidos que se dejaron pasar. */
  skippedWeekdays: number[];
}

interface PlannedDay {
  id: string;
  weekday: number;
}

const EMPTY_SLOT: WeekSlot = { dayId: null, fromWeekday: null };

function baseSlots(days: readonly PlannedDay[]): WeekSlot[] {
  return Array.from({ length: WEEKDAY_COUNT }, (_, weekday) => {
    const day = days.find((candidate) => candidate.weekday === weekday);
    return day ? { dayId: day.id, fromWeekday: weekday } : EMPTY_SLOT;
  });
}

/**
 * Pasa el día perdido a `target` y corre los siguientes un día cada uno. El primer descanso absorbe el
 * corrimiento; si no queda ninguno antes del domingo, devuelve el día que se quedó fuera.
 */
function moveDay(slots: WeekSlot[], missed: number, target: number): WeekSlot {
  let carried = slots[missed] ?? EMPTY_SLOT;
  slots[missed] = EMPTY_SLOT;
  for (let weekday = target; weekday < WEEKDAY_COUNT; weekday += 1) {
    const current = slots[weekday] ?? EMPTY_SLOT;
    slots[weekday] = carried;
    if (current.dayId === null) return EMPTY_SLOT;
    carried = current;
  }
  return carried;
}

function canMove(slots: readonly WeekSlot[], shift: ScheduleShift): boolean {
  const { missedWeekday, targetWeekday } = shift;
  if (targetWeekday === null || targetWeekday <= missedWeekday) return false;
  return (slots[missedWeekday]?.dayId ?? null) !== null;
}

/**
 * La semana tal como queda: la del plan, con los días perdidos aplicados en orden. El plan nunca cambia;
 * los corrimientos valen solo para la semana en que se decidieron.
 */
export function buildWeekSchedule(
  days: readonly PlannedDay[],
  shifts: readonly ScheduleShift[],
): WeekSchedule {
  const slots = baseSlots(days);
  const lostDayIds: string[] = [];
  const skippedWeekdays: number[] = [];
  const ordered = [...shifts].sort((a, b) => a.missedWeekday - b.missedWeekday);
  for (const shift of ordered) {
    if (shift.targetWeekday === null) skippedWeekdays.push(shift.missedWeekday);
    if (!canMove(slots, shift)) continue;
    const lost = moveDay(slots, shift.missedWeekday, shift.targetWeekday ?? 0);
    if (lost.dayId !== null) lostDayIds.push(lost.dayId);
  }
  return { slots, lostDayIds, skippedWeekdays };
}

/** Los días que tocan esta semana, en el formato del plan (id y día de la semana). */
export function scheduledDays(schedule: WeekSchedule): PlannedDay[] {
  return schedule.slots.flatMap((slot, weekday) =>
    slot.dayId === null ? [] : [{ id: slot.dayId, weekday }],
  );
}
