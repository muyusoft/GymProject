import { describe, expect, it } from "vitest";
import type { LoggedSet, SessionResult } from "@/shared/types/history.types";
import type { ExerciseTemplate } from "../types/workout.types";
import {
  lastPerformance,
  withLastWeight,
} from "../utils/last-performance.utils";

const TEMPLATE: ExerciseTemplate = {
  sets: 3,
  reps: 12,
  repsMin: null,
  seconds: null,
  restSec: 90,
  targetWeight: 80,
  unit: "kg",
  loadType: "total",
  weightStep: 2.5,
  isProgressionEnabled: true,
};

function set(
  weight: number | null,
  reps: number | null,
  patch: Partial<LoggedSet> = {},
): LoggedSet {
  return { weight, unit: "kg", reps, rpe: null, completed: true, ...patch };
}

const session = (...sets: LoggedSet[]): SessionResult => ({
  date: "2026-10-01",
  sets,
});

describe("lastPerformance", () => {
  it("toma el peso más alto y la peor serie hecha con ese peso", () => {
    expect(
      lastPerformance(session(set(80, 12), set(85, 10), set(85, 9))),
    ).toEqual({ weight: 85, unit: "kg", reps: 9 });
  });

  it("ignora series sin hacer, sin peso o sin repeticiones", () => {
    const latest = session(
      set(90, 8, { completed: false }),
      set(null, 12),
      set(80, null),
      set(75, 11),
    );
    expect(lastPerformance(latest)).toEqual({
      weight: 75,
      unit: "kg",
      reps: 11,
    });
  });

  it("sin historial o sin series válidas no hay dato", () => {
    expect(lastPerformance(undefined)).toBeNull();
    expect(
      lastPerformance(session(set(80, 12, { completed: false }))),
    ).toBeNull();
  });
});

describe("withLastWeight", () => {
  it("usa el último peso en lugar del peso del plan", () => {
    expect(
      withLastWeight(TEMPLATE, { weight: 85, unit: "kg", reps: 9 })
        .targetWeight,
    ).toBe(85);
  });

  it("sin historial conserva el peso del plan", () => {
    expect(withLastWeight(TEMPLATE, null)).toBe(TEMPLATE);
  });

  it("no aplica si la unidad cambió o el ejercicio no lleva peso", () => {
    expect(
      withLastWeight(TEMPLATE, { weight: 185, unit: "lb", reps: 9 })
        .targetWeight,
    ).toBe(80);
    const bodyweight = { ...TEMPLATE, targetWeight: null };
    expect(
      withLastWeight(bodyweight, { weight: 85, unit: "kg", reps: 9 })
        .targetWeight,
    ).toBeNull();
  });
});
