import { describe, expect, it } from "vitest";
import type { PlanDayRow, PlanExerciseRow } from "@/shared/db/types";
import {
  buildDaySummaries,
  FALLBACK_DEFAULTS,
  getFreeWeekdays,
  planDefaults,
} from "../utils/plan-summary.utils";
import { startOfWeekMonday, toIsoDate, weekdayIndex, weekDates } from "@/shared/utils/week.utils";

function day(id: string, weekday: number, sets = 4): PlanDayRow {
  return {
    id,
    planId: "p",
    weekday,
    name: `Día ${id}`,
    order: weekday,
    defaultSets: sets,
    defaultReps: 12,
    defaultRestSec: 90,
    updatedAt: 0,
  };
}

function exercise(planDayId: string): PlanExerciseRow {
  return {
    id: `${planDayId}-${Math.random()}`,
    planDayId,
    exerciseId: "e",
    order: 0,
    sets: 4,
    reps: 12,
    seconds: null,
    restSec: 90,
    targetWeight: 30,
    unit: "lb",
    loadType: "per_arm",
    progressionRule: null,
    updatedAt: 0,
  };
}

describe("buildDaySummaries", () => {
  const days = [day("a", 0), day("b", 4)];
  const exercises = [...Array.from({ length: 8 }, () => exercise("a")), exercise("b")];

  it("cuenta los ejercicios y estima la duración por día", () => {
    const [monday] = buildDaySummaries({
      days,
      exercises,
      completedDayIds: new Set(),
      todayWeekday: 4,
    });
    expect(monday).toMatchObject({ exerciseCount: 8, durationMinutes: 70 });
  });

  it("marca el día hecho y el día de hoy", () => {
    const [monday, friday] = buildDaySummaries({
      days,
      exercises,
      completedDayIds: new Set(["a"]),
      todayWeekday: 4,
    });
    expect(monday).toMatchObject({ isDone: true, isToday: false });
    expect(friday).toMatchObject({ isDone: false, isToday: true });
  });

  it("deja un día sin ejercicios en 0", () => {
    const [summary] = buildDaySummaries({
      days: [day("empty", 2)],
      exercises: [],
      completedDayIds: new Set(),
      todayWeekday: 0,
    });
    expect(summary).toMatchObject({ exerciseCount: 0, durationMinutes: 0 });
  });
});

describe("getFreeWeekdays", () => {
  it("devuelve los días sin entreno", () => {
    expect(getFreeWeekdays([day("a", 0), day("b", 1), day("c", 2), day("d", 3), day("e", 4)])).toEqual([5, 6]);
  });

  it("devuelve toda la semana sin días", () => {
    expect(getFreeWeekdays([])).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("planDefaults", () => {
  it("usa los valores del primer día", () => {
    expect(planDefaults([day("a", 0, 5)])).toEqual({ sets: 5, reps: 12, restSec: 90 });
  });

  it("cae a 4 × 12 con 1:30 sin días", () => {
    expect(planDefaults([])).toEqual(FALLBACK_DEFAULTS);
  });
});

describe("week utils", () => {
  it("numera lunes como 0 y domingo como 6", () => {
    expect(weekdayIndex(new Date(2026, 8, 28))).toBe(0);
    expect(weekdayIndex(new Date(2026, 9, 3))).toBe(5);
    expect(weekdayIndex(new Date(2026, 9, 4))).toBe(6);
  });

  it("calcula el lunes de la semana y sus siete fechas", () => {
    const monday = startOfWeekMonday(new Date(2026, 9, 2));
    expect(toIsoDate(monday)).toBe("2026-09-28");
    expect(weekDates(monday).map(toIsoDate)).toHaveLength(7);
    expect(toIsoDate(weekDates(monday)[6] ?? monday)).toBe("2026-10-04");
  });
});
