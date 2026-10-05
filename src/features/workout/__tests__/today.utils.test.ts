import { describe, expect, it } from "vitest";
import type { ExerciseTemplate } from "../types/workout.types";
import {
  formatSetsAndWeight,
  formatTemplateSummary,
} from "../utils/template.utils";
import { buildWeekStrip } from "../utils/week-strip.utils";

describe("buildWeekStrip", () => {
  const weekStart = new Date(2026, 8, 28);
  const days = [
    { id: "mon", weekday: 0 },
    { id: "tue", weekday: 1 },
    { id: "fri", weekday: 4 },
  ];
  const strip = buildWeekStrip({
    weekStart,
    days,
    completedDayIds: new Set(["mon"]),
    today: new Date(2026, 9, 2, 18, 30),
  });

  it("devuelve siete días de lunes a domingo", () => {
    expect(strip).toHaveLength(7);
    expect(strip[0]?.date.getDate()).toBe(28);
    expect(strip[6]?.date.getDate()).toBe(4);
  });

  it("marca hecho, planificado y descanso", () => {
    expect(strip.map((day) => day.status)).toEqual([
      "done",
      "planned",
      "rest",
      "rest",
      "planned",
      "rest",
      "rest",
    ]);
  });

  it("marca solo el día de hoy aunque tenga hora", () => {
    expect(
      strip.filter((day) => day.isToday).map((day) => day.weekday),
    ).toEqual([4]);
  });
});

describe("template formatting", () => {
  const template: ExerciseTemplate = {
    sets: 4,
    reps: 12,
    seconds: null,
    restSec: 90,
    targetWeight: 88,
    unit: "lb",
    loadType: "total",
    weightStep: 5,
    repsMin: null,
    isProgressionEnabled: true,
  };

  it("resume peso, series y descanso", () => {
    expect(formatTemplateSummary(template, "es")).toBe("88 lb · 4 × 12 · 1:30");
  });

  it("muestra el rango de repeticiones cuando lo hay", () => {
    expect(formatTemplateSummary({ ...template, repsMin: 8 }, "es")).toBe(
      "88 lb · 4 × 8–12 · 1:30",
    );
  });

  it("resume series y peso para las listas", () => {
    expect(formatSetsAndWeight(template, "es")).toBe("4 × 12 · 88 lb");
    expect(formatSetsAndWeight({ ...template, targetWeight: 27.5 }, "es")).toBe(
      "4 × 12 · 27,5 lb",
    );
  });

  it("omite el peso y muestra el tiempo en ejercicios por tiempo", () => {
    const plank = {
      ...template,
      reps: null,
      seconds: 90,
      targetWeight: null,
      sets: 3,
      restSec: 120,
    };
    expect(formatTemplateSummary(plank, "es")).toBe("3 × 1:30 · 2:00");
    expect(formatSetsAndWeight(plank, "es")).toBe("3 × 1:30");
  });
});
