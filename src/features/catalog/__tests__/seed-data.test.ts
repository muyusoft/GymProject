import { describe, expect, it } from "vitest";
import { buildSeedPlan } from "@/shared/db/seed/build-seed-plan";
import { MUSCLE_GROUPS } from "@/shared/types/training.types";
import { catalogSeedData } from "../data/seed-data";

const plan = buildSeedPlan(catalogSeedData);

describe("catalogSeedData", () => {
  it("construye el plan del seed con los datos reales sin errores", () => {
    expect(plan.exercises.length).toBeGreaterThan(800);
    expect(plan.sources.length).toBe(Object.keys(catalogSeedData.sources).length);
  });

  it("incluye los 94 ejercicios comunes con su nombre en español", () => {
    const spanish = new Set(plan.exercises.map((e) => e.nameEs));
    for (const common of catalogSeedData.commonExercises) {
      expect(spanish.has(common.nameEs)).toBe(true);
    }
  });

  it("solo pinta grupos de la figura y cada fila cita al menos una fuente", () => {
    for (const muscle of plan.muscles) {
      expect(MUSCLE_GROUPS).toContain(muscle.muscleGroup);
      expect(JSON.parse(muscle.sourceIds ?? "[]").length).toBeGreaterThan(0);
    }
  });

  it("no genera músculos para ejercicios sin patrón", () => {
    const withoutPattern = new Set(
      plan.exercises.filter((e) => e.pattern === null).map((e) => e.id),
    );
    expect(plan.muscles.some((m) => withoutPattern.has(m.exerciseId))).toBe(false);
  });
});
