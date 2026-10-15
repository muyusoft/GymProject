import { describe, expect, it } from "vitest";
import { buildWeekSchedule } from "@/shared/utils/week-schedule.utils";
import { weekNote } from "../utils/week-note.utils";

/** Lunes A, martes B, miércoles descanso. */
const PLAN = [
  { id: "A", weekday: 0 },
  { id: "B", weekday: 1 },
];

describe("weekNote", () => {
  it("sin cambios esta semana no hay nota", () => {
    expect(weekNote(buildWeekSchedule(PLAN, []), "A", 0)).toBeNull();
  });

  it("cuenta a dónde se fue el día y qué día llegó a cada posición", () => {
    const schedule = buildWeekSchedule(PLAN, [{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(weekNote(schedule, "A", 0)).toEqual({ kind: "movedTo", weekday: 1 });
    expect(weekNote(schedule, "B", 1)).toEqual({
      kind: "holds",
      dayId: "A",
      fromWeekday: 0,
      isOwnDayLost: false,
    });
    expect(weekNote(schedule, null, 2)).toEqual({
      kind: "holds",
      dayId: "B",
      fromWeekday: 1,
      isOwnDayLost: false,
    });
  });

  it("avisa del día que no cupo", () => {
    const everyDay = ["A", "B", "C", "D", "E", "F", "G"].map((id, weekday) => ({ id, weekday }));
    const schedule = buildWeekSchedule(everyDay, [{ missedWeekday: 0, targetWeekday: 1 }]);
    expect(weekNote(schedule, "G", 6)).toEqual({
      kind: "holds",
      dayId: "F",
      fromWeekday: 5,
      isOwnDayLost: true,
    });
    expect(weekNote(schedule, "B", 1)).toMatchObject({ isOwnDayLost: false });
  });

  it("marca el día que se dejó pasar", () => {
    const schedule = buildWeekSchedule(PLAN, [{ missedWeekday: 0, targetWeekday: null }]);
    expect(weekNote(schedule, "A", 0)).toEqual({ kind: "skipped" });
  });
});
