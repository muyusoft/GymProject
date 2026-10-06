import { describe, expect, it } from "vitest";
import type { ExerciseTemplate, TodayExercise } from "../types/workout.types";
import {
  buildDoneExercises,
  type DoneLog,
} from "../utils/done-exercises.utils";
import { firstPendingIndex } from "../utils/session-stats.utils";

const TEMPLATE: ExerciseTemplate = {
  sets: 4,
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

function exercise(id: string): TodayExercise {
  return {
    slot: {
      planExerciseId: `plan-${id}`,
      originalExerciseId: id,
      isSubstituted: false,
    },
    exerciseId: id,
    nameEs: id,
    nameEn: id,
    template: TEMPLATE,
  };
}

function log(
  exerciseId: string,
  updatedAt: number,
  patch: Partial<DoneLog> = {},
): DoneLog {
  return {
    exerciseId,
    weight: 80,
    unit: "kg",
    reps: 12,
    seconds: null,
    completed: true,
    updatedAt,
    ...patch,
  };
}

describe("buildDoneExercises", () => {
  const planned = [exercise("press"), exercise("row"), exercise("curl")];

  it("ordena por cuándo se hizo cada ejercicio, no por el plan", () => {
    const logs = [
      log("press", 300),
      log("row", 100),
      log("row", 150),
      log("curl", 200),
    ];
    expect(
      buildDoneExercises(planned, logs).map((item) => item.exerciseId),
    ).toEqual(["row", "curl", "press"]);
  });

  it("deja fuera los ejercicios sin ninguna serie hecha", () => {
    const logs = [log("press", 100), log("row", 200, { completed: false })];
    expect(
      buildDoneExercises(planned, logs).map((item) => item.exerciseId),
    ).toEqual(["press"]);
  });

  it("resume lo que se hizo: series hechas, peor serie y peso más alto", () => {
    const logs = [
      log("press", 100, { weight: 80, reps: 10 }),
      log("press", 110, { weight: 82.5, reps: 9 }),
      log("press", 120, { completed: false }),
    ];
    const [done] = buildDoneExercises(planned, logs);
    expect(done?.template).toMatchObject({
      sets: 2,
      reps: 9,
      repsMin: null,
      targetWeight: 82.5,
      unit: "kg",
    });
  });

  it("sin series hechas no hay lista", () => {
    expect(buildDoneExercises(planned, [])).toEqual([]);
  });
});

describe("firstPendingIndex", () => {
  const sets = (...done: boolean[]) => ({
    sets: done.map((completed) => ({ completed })),
  });

  it("es el primer ejercicio con series por hacer", () => {
    expect(
      firstPendingIndex([sets(true, true), sets(true, false), sets(false)]),
    ).toBe(1);
    expect(firstPendingIndex([sets(false), sets(false)])).toBe(0);
  });

  it("con todo hecho se queda en el último, y sin ejercicios en 0", () => {
    expect(firstPendingIndex([sets(true), sets(true)])).toBe(1);
    expect(firstPendingIndex([])).toBe(0);
  });
});
