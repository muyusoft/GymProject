import { describe, expect, it } from "vitest";
import type { CatalogExercise, GeneratedPlan, PlanAnswers } from "../types/plan-generator.types";
import { alternativesFor, swapExercise } from "../utils/plan-generator/swap";

const muscles = [{ group: "chest", role: "primary" }] as const;
const exercise = (id: string, requires: CatalogExercise["requires"], pattern = "horizontal_push"): CatalogExercise => ({
  id,
  nameEs: id,
  nameEn: id,
  pattern,
  equipment: "barbell",
  loadType: "total",
  muscles,
  requires,
});
const CATALOG = [
  exercise("bench", [["barbell", "benchPress"]]),
  exercise("dumbbellPress", [["dumbbells", "adjustableBench"]]),
  exercise("machinePress", [["chestPress"]]),
  exercise("row", [["dumbbells"]], "horizontal_pull"),
];
const ANSWERS: PlanAnswers = {
  goal: "muscle",
  days: 4,
  experience: "intermediate",
  focus: "balanced",
  minutes: 45,
  equipment: ["barbell", "benchPress", "dumbbells", "adjustableBench"],
};
const PLAN: GeneratedPlan = {
  days: [
    {
      weekday: 0,
      template: "upperA",
      exercises: [
        { exerciseId: "bench", pattern: "horizontal_push", isCompound: true, sets: 4, reps: 12, repsMin: 8, seconds: null, restSec: 120, loadType: "total" },
      ],
    },
  ],
  isShortOfTime: false,
  missingPatterns: [],
};

describe("alternativesFor", () => {
  it("ofrece otros ejercicios del mismo patrón que se pueden hacer con el equipo", () => {
    const ids = alternativesFor(PLAN, { weekday: 0, index: 0 }, CATALOG, ANSWERS.equipment).map((item) => item.id);
    expect(ids).toEqual(["dumbbellPress"]);
  });

  it("sin ejercicio en esa posición no ofrece nada", () => {
    expect(alternativesFor(PLAN, { weekday: 3, index: 0 }, CATALOG, ANSWERS.equipment)).toEqual([]);
  });
});

describe("swapExercise", () => {
  it("cambia el ejercicio y conserva sus series", () => {
    const replacement = CATALOG[1];
    if (!replacement) throw new Error("sin ejercicio");
    const swapped = swapExercise(PLAN, { weekday: 0, index: 0 }, replacement, ANSWERS);
    expect(swapped.days[0]?.exercises[0]).toMatchObject({ exerciseId: "dumbbellPress", sets: 4 });
    expect(PLAN.days[0]?.exercises[0]?.exerciseId).toBe("bench");
  });
});
