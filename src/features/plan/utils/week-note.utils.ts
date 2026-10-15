import type { WeekSchedule } from "@/shared/utils/week-schedule.utils";

/** Cómo cambia un día de la semana respecto del plan, por un día perdido. */
export type WeekNote =
  | {
      kind: "holds";
      dayId: string;
      fromWeekday: number;
      /** El día propio de esta posición no cupo antes del domingo: esta semana se pierde. */
      isOwnDayLost: boolean;
    }
  | { kind: "movedTo"; weekday: number }
  | { kind: "skipped" };

/**
 * La nota de un día de la semana: qué día del plan hay ahí esta semana si no es el suyo (y si el suyo no
 * cupo), a dónde se fue el suyo, o si se dejó pasar. null si esta semana ese día es el del plan.
 */
export function weekNote(
  schedule: WeekSchedule,
  planDayId: string | null,
  weekday: number,
): WeekNote | null {
  const slot = schedule.slots[weekday];
  if (slot?.dayId && slot.dayId !== planDayId && slot.fromWeekday !== null) {
    const isOwnDayLost =
      planDayId !== null && schedule.lostDayIds.includes(planDayId);
    return { kind: "holds", dayId: slot.dayId, fromWeekday: slot.fromWeekday, isOwnDayLost };
  }
  if (planDayId !== null && slot?.dayId !== planDayId) {
    const target = schedule.slots.findIndex((other) => other.dayId === planDayId);
    if (target >= 0) return { kind: "movedTo", weekday: target };
  }
  return schedule.skippedWeekdays.includes(weekday) ? { kind: "skipped" } : null;
}
