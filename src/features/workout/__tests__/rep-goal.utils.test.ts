import { describe, expect, it } from "vitest";
import type { SessionResult } from "@/shared/types/history.types";
import type { ExerciseTemplate } from "../types/workout.types";
import { goalReps } from "../utils/rep-goal.utils";

const TEMPLATE: ExerciseTemplate = {
  sets: 3,
  reps: 12,
  repsMin: 8,
  seconds: null,
  restSec: 90,
  targetWeight: 80,
  unit: "kg",
  loadType: "total",
  weightStep: 2.5,
  isProgressionEnabled: true,
};

function session(weight: number, reps: number[]): SessionResult {
  return {
    date: "2026-10-01",
    sets: reps.map((value) => ({
      weight,
      unit: "kg" as const,
      reps: value,
      rpe: null,
      completed: true,
    })),
  };
}

describe("goalReps", () => {
  it("sin rango usa el objetivo del plan", () => {
    const fixed = { ...TEMPLATE, repsMin: null };
    expect(
      goalReps({
        template: fixed,
        startWeight: 80,
        latest: session(80, [9, 9, 9]),
      }),
    ).toBe(12);
  });

  it("sin historial arranca en el objetivo", () => {
    expect(goalReps({ template: TEMPLATE, startWeight: 80 })).toBe(12);
  });

  it("al mismo peso pide una más que la peor serie de la última vez", () => {
    expect(
      goalReps({
        template: TEMPLATE,
        startWeight: 80,
        latest: session(80, [10, 9, 9]),
      }),
    ).toBe(10);
  });

  it("no pasa del objetivo ni baja del mínimo", () => {
    expect(
      goalReps({
        template: TEMPLATE,
        startWeight: 80,
        latest: session(80, [12, 12, 12]),
      }),
    ).toBe(12);
    expect(
      goalReps({
        template: TEMPLATE,
        startWeight: 80,
        latest: session(80, [5, 5, 4]),
      }),
    ).toBe(8);
  });

  it("al subir de peso vuelve al mínimo del rango", () => {
    expect(
      goalReps({
        template: TEMPLATE,
        startWeight: 82.5,
        latest: session(80, [12, 12, 12]),
      }),
    ).toBe(8);
  });

  it("con menos peso que la última vez usa el objetivo", () => {
    expect(
      goalReps({
        template: TEMPLATE,
        startWeight: 80,
        latest: session(82.5, [8, 8, 8]),
      }),
    ).toBe(12);
  });

  it("ignora series sin hacer o en otra unidad", () => {
    const other: SessionResult = {
      date: "2026-10-01",
      sets: [
        { weight: 176, unit: "lb", reps: 9, rpe: null, completed: true },
        { weight: 80, unit: "kg", reps: 9, rpe: null, completed: false },
      ],
    };
    expect(
      goalReps({ template: TEMPLATE, startWeight: 80, latest: other }),
    ).toBe(12);
  });

  it("los ejercicios por tiempo no tienen repeticiones", () => {
    const timed = { ...TEMPLATE, reps: null, repsMin: null, seconds: 60 };
    expect(goalReps({ template: timed, startWeight: null })).toBeNull();
  });
});
