import { describe, expect, it } from "vitest";
import {
  buildWeekSchedule,
  scheduledDays,
  type WeekSchedule,
} from "../week-schedule.utils";

/** Lunes A, martes B, miércoles descanso, jueves C, y el resto descanso. */
const PLAN = [
  { id: "A", weekday: 0 },
  { id: "B", weekday: 1 },
  { id: "C", weekday: 3 },
];

const ids = (schedule: WeekSchedule) => schedule.slots.map((slot) => slot.dayId);

describe("buildWeekSchedule", () => {
  it("sin días perdidos la semana es la del plan", () => {
    const schedule = buildWeekSchedule(PLAN, []);
    expect(ids(schedule)).toEqual(["A", "B", null, "C", null, null, null]);
    expect(schedule.slots[3]?.fromWeekday).toBe(3);
  });

  it("hacer el día perdido hoy corre los siguientes hasta el primer descanso", () => {
    const schedule = buildWeekSchedule(PLAN, [{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(ids(schedule)).toEqual([null, "A", "B", "C", null, null, null]);
    expect(schedule.slots[1]?.fromWeekday).toBe(0);
    expect(schedule.slots[2]?.fromWeekday).toBe(1);
    expect(schedule.lostDayIds).toEqual([]);
  });

  it("si no queda descanso antes del domingo, el último día se pierde", () => {
    const everyDay = ["A", "B", "C", "D", "E", "F", "G"].map((id, weekday) => ({ id, weekday }));
    const schedule = buildWeekSchedule(everyDay, [{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(ids(schedule)).toEqual([null, "A", "B", "C", "D", "E", "F"]);
    expect(schedule.lostDayIds).toEqual(["G"]);
  });

  it("dejarlo pasar no mueve nada y queda anotado", () => {
    const schedule = buildWeekSchedule(PLAN, [{ missedWeekday: 0, targetWeekday: null }]);
    expect(ids(schedule)).toEqual(["A", "B", null, "C", null, null, null]);
    expect(schedule.skippedWeekdays).toEqual([0]);
  });

  it("dos días perdidos seguidos se aplican en orden", () => {
    const schedule = buildWeekSchedule(PLAN, [
      { missedWeekday: 1, targetWeekday: 2 },
      { missedWeekday: 0, targetWeekday: 1 },
    ]);
    expect(ids(schedule)).toEqual([null, null, "A", "B", "C", null, null]);
    expect(schedule.slots[2]?.fromWeekday).toBe(0);
  });

  it("ignora un corrimiento hacia atrás o desde un día sin entreno", () => {
    const schedule = buildWeekSchedule(PLAN, [
      { missedWeekday: 3, targetWeekday: 1 },
      { missedWeekday: 2, targetWeekday: 4 },
    ]);
    expect(ids(schedule)).toEqual(["A", "B", null, "C", null, null, null]);
  });
});

describe("scheduledDays", () => {
  it("devuelve los días con entreno en su nueva posición", () => {
    const schedule = buildWeekSchedule(PLAN, [{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(scheduledDays(schedule)).toEqual([
      { id: "A", weekday: 1 },
      { id: "B", weekday: 2 },
      { id: "C", weekday: 3 },
    ]);
  });
});
