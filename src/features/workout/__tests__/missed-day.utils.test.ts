import { describe, expect, it } from "vitest";
import {
  buildWeekSchedule,
  type ScheduleShift,
} from "@/shared/utils/week-schedule.utils";
import {
  buildMissedOffer,
  findMissedDay,
  type WeekState,
} from "../utils/missed-day.utils";

/** Lunes Piernas, martes Pecho, miércoles descanso, jueves Espalda. */
const DAYS = [
  { id: "legs", weekday: 0, name: "Piernas" },
  { id: "chest", weekday: 1, name: "Pecho" },
  { id: "back", weekday: 3, name: "Espalda" },
];
const MONDAY = new Date(2026, 9, 12);

function week(
  shifts: ScheduleShift[] = [],
  completed: string[] = [],
  days = DAYS,
): WeekState {
  return {
    days,
    shifts,
    schedule: buildWeekSchedule(days, shifts),
    completedDayIds: new Set(completed),
  };
}

describe("findMissedDay", () => {
  it("encuentra el día de ayer si no se hizo", () => {
    expect(findMissedDay(week(), 1)).toEqual({ weekday: 0, dayId: "legs" });
  });

  it("solo mira el último día de entreno, aunque antes haya otro sin hacer", () => {
    expect(findMissedDay(week([], ["chest"]), 3)).toBeNull();
  });

  it("salta los descansos hasta el último día de entreno", () => {
    expect(findMissedDay(week(), 3)).toEqual({ weekday: 1, dayId: "chest" });
  });

  it("no lo ofrece si ya se hizo o si ya se decidió", () => {
    expect(findMissedDay(week([], ["legs"]), 1)).toBeNull();
    expect(findMissedDay(week([{ missedWeekday: 0, targetWeekday: null }]), 1)).toBeNull();
  });

  it("el lunes no mira la semana anterior", () => {
    expect(findMissedDay(week(), 0)).toBeNull();
  });

  it("si lo movido tampoco se hizo, se ofrece de nuevo", () => {
    const moved = week([{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(findMissedDay(moved, 2)).toEqual({ weekday: 1, dayId: "legs" });
  });
});

describe("buildMissedOffer", () => {
  it("cuenta qué día fue y que todo cabe si queda un descanso", () => {
    expect(buildMissedOffer({ week: week(), weekStart: MONDAY, todayWeekday: 1 })).toEqual({
      date: "2026-10-12",
      weekday: 0,
      dayName: "Piernas",
      lostDayName: null,
    });
  });

  it("avisa qué día se pierde si la semana no tiene descanso después", () => {
    const everyDay = ["A", "B", "C", "D", "E", "F", "G"].map((id, weekday) => ({
      id,
      weekday,
      name: `Día ${id}`,
    }));
    const offer = buildMissedOffer({
      week: week([], [], everyDay),
      weekStart: MONDAY,
      todayWeekday: 1,
    });
    expect(offer?.lostDayName).toBe("Día G");
  });

  it("sin día perdido no ofrece nada", () => {
    expect(
      buildMissedOffer({ week: week([], ["legs"]), weekStart: MONDAY, todayWeekday: 1 }),
    ).toBeNull();
  });
});
