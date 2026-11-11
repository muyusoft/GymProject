import { describe, expect, it } from "vitest";
import { todayExerciseIds } from "../utils/today-exercises.utils";

const PLANNED = [
  { planExerciseId: "pe-1", exerciseId: "squat" },
  { planExerciseId: "pe-2", exerciseId: "leg-curl" },
];

describe("todayExerciseIds", () => {
  it("sin cambios de hoy usa los ejercicios del plan", () => {
    expect([...todayExerciseIds(PLANNED, [])]).toEqual(["squat", "leg-curl"]);
  });

  it("un cambio de solo hoy reemplaza al ejercicio de ese lugar", () => {
    const swaps = [{ planExerciseId: "pe-2", exerciseId: "rdl" }];
    expect([...todayExerciseIds(PLANNED, swaps)]).toEqual(["squat", "rdl"]);
  });
});
