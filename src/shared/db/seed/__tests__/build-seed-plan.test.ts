import { describe, expect, it } from "vitest";
import { buildSeedPlan } from "../build-seed-plan";
import { resolveMuscles } from "../muscle-rows";
import type { PatternRecord, SeedInput } from "../seed.types";

const PUSH: PatternRecord = {
  sources: ["a2017"],
  muscles: [
    { group: "chest", role: "primary", basis: "measured", view: "both" },
    { group: "triceps", role: "secondary", basis: "measured", view: "both" },
  ],
};

const INPUT: SeedInput = {
  sources: {
    a2017: { citation: "A 2017", url: "https://a", strength: "strong" },
    b2020: { citation: "B 2020", url: "https://b", strength: "weak" },
  },
  patterns: { horizontal_push: PUSH },
  freeExercises: [
    { id: "Bench", name: "Bench Press", equipment: "barbell", instructions: ["Lie down.", "Press."] },
    { id: "Crunch", name: "Crunch", equipment: "body only", instructions: [] },
  ],
  commonExercises: [
    { nameEs: "Press banca", freeExerciseDbName: "Bench Press", pattern: "horizontal_push" },
    { nameEs: "Dead bug", freeExerciseDbName: null, pattern: "horizontal_push" },
  ],
};

let counter = 0;
const createId = () => `id-${++counter}`;

describe("buildSeedPlan", () => {
  it("une el catálogo con los ejercicios comunes y crea los que no están", () => {
    const plan = buildSeedPlan(INPUT, createId);
    expect(plan.exercises.map((e) => e.nameEn)).toEqual(["Bench Press", "Crunch", "Dead bug"]);
    expect(plan.exercises[0]?.nameEs).toBe("Press banca");
    expect(plan.exercises[1]?.nameEs).toBe("Crunch");
  });

  it("genera músculos solo para ejercicios con patrón", () => {
    const plan = buildSeedPlan(INPUT, createId);
    const crunch = plan.exercises[1];
    expect(plan.muscles.filter((m) => m.exerciseId === crunch?.id)).toHaveLength(0);
    expect(plan.muscles).toHaveLength(4);
    expect(crunch?.status).toBe("claude_draft");
  });

  it("marca la evidencia con la mejor fuente del patrón", () => {
    const plan = buildSeedPlan(INPUT, createId);
    expect(plan.exercises[0]?.evidenceLevel).toBe("strong");
    expect(plan.exercises[1]?.evidenceLevel).toBeNull();
  });

  it("carga las fuentes con su año y los saltos por defecto", () => {
    const plan = buildSeedPlan(INPUT, createId);
    expect(plan.sources.find((s) => s.id === "b2020")?.year).toBe(2020);
    expect(plan.increments).toHaveLength(4);
  });

  it("falla si un ejercicio usa un patrón desconocido", () => {
    const bad = { ...INPUT, commonExercises: [{ nameEs: "X", freeExerciseDbName: null, pattern: "nope" }] };
    expect(() => buildSeedPlan(bad, createId)).toThrow("Unknown pattern");
  });
});

describe("resolveMuscles", () => {
  it("reemplaza los músculos del patrón con replace", () => {
    const muscles = resolveMuscles(PUSH, {
      replace: [{ group: "abs", role: "primary", basis: "measured", view: "front" }],
    });
    expect(muscles.map((m) => m.group)).toEqual(["abs"]);
  });

  it("agrega con add y sustituye el grupo repetido", () => {
    const muscles = resolveMuscles(PUSH, {
      add: [{ group: "triceps", role: "primary", basis: "measured", view: "both" }],
    });
    expect(muscles.find((m) => m.group === "triceps")?.role).toBe("primary");
    expect(muscles).toHaveLength(2);
  });

  it("rechaza un grupo muscular que no existe", () => {
    const bad = { ...PUSH, muscles: [{ group: "wings", role: "primary", basis: "measured", view: "both" }] };
    expect(() => resolveMuscles(bad)).toThrow("Invalid muscle group");
  });
});
