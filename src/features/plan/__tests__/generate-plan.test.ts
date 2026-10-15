import { describe, expect, it } from "vitest";
import commonExercises from "@/features/catalog/data/common-exercises.json";
import muscleMap from "@/features/catalog/data/muscle-map.json";
import { GYM_EQUIPMENT } from "@/shared/types/equipment.types";
import type { MuscleGroup, MuscleRole } from "@/shared/types/training.types";
import { parseRequirements } from "@/shared/utils/equipment-requirements.utils";
import type { CatalogExercise, PlanAnswers } from "../types/plan-generator.types";
import { createExercisePicker } from "../utils/plan-generator/exercise-picker";
import { generatePlan } from "../utils/plan-generator/generate-plan";
import { prescribe } from "../utils/plan-generator/prescription";
import { dayPatterns } from "../utils/plan-generator/templates";
import { weeklySets } from "../utils/plan-generator/volume";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";

type PatternMuscles = { group: string; role: string }[];
const patterns = muscleMap.patterns as Record<string, { muscles: PatternMuscles }>;

/** El catálogo real de ejercicios comunes, con los músculos de su patrón (como lo deja el seed). */
const CATALOG: CatalogExercise[] = commonExercises.exercises.map((exercise, index) => ({
  id: `common-${index}`,
  nameEs: exercise.nameEs,
  nameEn: exercise.nameEs,
  pattern: exercise.pattern,
  equipment: "machine",
  loadType: exercise.nameEs.startsWith("Plancha")
    ? "time"
    : JSON.stringify(exercise.requires) === "[[]]"
      ? "bodyweight"
      : "total",
  requires: parseRequirements(JSON.stringify(exercise.requires ?? null)),
  muscles: (patterns[exercise.pattern]?.muscles ?? []).map((muscle) => ({
    group: muscle.group as MuscleGroup,
    role: muscle.role as MuscleRole,
  })),
}));
const LOOKUP = new Map(CATALOG.map((exercise) => [exercise.id, exercise.muscles]));
const nameOf = (id: string) => CATALOG.find((exercise) => exercise.id === id)?.nameEs;

const ANSWERS: PlanAnswers = { goal: "muscle", days: 4, experience: "intermediate", focus: "balanced", minutes: 45, equipment: GYM_EQUIPMENT };

describe("generatePlan", () => {
  it("cuatro días son torso y pierna, dos veces, de lunes a viernes con miércoles libre", () => {
    const plan = generatePlan(ANSWERS, CATALOG);
    expect(plan.days.map((day) => [day.weekday, day.template])).toEqual([
      [0, "upperA"],
      [1, "lowerA"],
      [3, "upperB"],
      [4, "lowerB"],
    ]);
  });

  it("usa los ejercicios preferidos del catálogo y varía los patrones que se repiten", () => {
    const [upperA, , upperB] = generatePlan(ANSWERS, CATALOG).days;
    expect(nameOf(upperA?.exercises[0]?.exerciseId ?? "")).toBe("Press banca con barra");
    expect(nameOf(upperB?.exercises[1]?.exerciseId ?? "")).toBe("Press inclinado con mancuernas");
  });

  it("quien empieza recibe variantes guiadas", () => {
    const plan = generatePlan({ ...ANSWERS, experience: "beginner" }, CATALOG);
    expect(nameOf(plan.days[1]?.exercises[0]?.exerciseId ?? "")).toBe("Prensa de piernas");
  });

  it("los rangos de reps salen del objetivo", () => {
    const strength = generatePlan({ ...ANSWERS, goal: "strength" }, CATALOG);
    const bench = strength.days[0]?.exercises[0];
    expect([bench?.repsMin, bench?.reps, bench?.restSec]).toEqual([4, 6, 180]);
  });

  it("omite un patrón sin ejercicios con músculos en el catálogo", () => {
    const withoutCalves = CATALOG.filter((exercise) => !exercise.pattern.startsWith("calf"));
    const lowerA = generatePlan(ANSWERS, withoutCalves).days[1];
    expect(lowerA?.exercises.map((exercise) => exercise.pattern)).not.toContain("calf_standing");
  });

  it("ningún músculo pasa su tope semanal", () => {
    const plan = generatePlan({ ...ANSWERS, days: 6, experience: "beginner" }, CATALOG);
    for (const sets of weeklySets(plan.days, LOOKUP).values()) expect(sets).toBeLessThanOrEqual(12);
  });

  it("la prioridad suma volumen a su zona sin quitar el resto", () => {
    const balanced = weeklySets(generatePlan(ANSWERS, CATALOG).days, LOOKUP);
    const lower = weeklySets(generatePlan({ ...ANSWERS, focus: "lower" }, CATALOG).days, LOOKUP);
    expect(lower.get("gluteal") ?? 0).toBeGreaterThan(balanced.get("gluteal") ?? 0);
    expect(lower.get("chest")).toBe(balanced.get("chest"));
  });

  it("es determinista", () => {
    expect(generatePlan(ANSWERS, CATALOG)).toEqual(generatePlan(ANSWERS, CATALOG));
  });
});

describe("dayPatterns", () => {
  it("un día de la zona priorizada gana un ejercicio extra que aún no tiene", () => {
    expect(dayPatterns("lowerA", "lower").at(-1)).toBe("hip_abduction");
    expect(dayPatterns("upperB", "upper").at(-1)).toBe("fly");
    expect(dayPatterns("upperA", "lower")).toHaveLength(6);
  });
});

describe("prescribe", () => {
  it("un ejercicio por tiempo lleva segundos y no reps", () => {
    const plank = CATALOG.find((exercise) => exercise.nameEs === "Plancha");
    if (!plank) throw new Error("Plancha no está en el catálogo");
    expect(prescribe(plank, ANSWERS)).toMatchObject({ reps: null, repsMin: null, seconds: 45 });
  });

  it("ponerse en forma usa una serie menos, nunca menos de dos", () => {
    const curl = CATALOG.find((exercise) => exercise.pattern === "elbow_flexion");
    if (!curl) throw new Error("sin curl");
    expect(prescribe(curl, { ...ANSWERS, goal: "fitness", experience: "beginner" }).sets).toBe(2);
  });
});

describe("createExercisePicker", () => {
  it("sin ejercicios con músculos no elige nada", () => {
    const picker = createExercisePicker([{ ...CATALOG[0]!, muscles: [] }], { experience: "intermediate", equipment: GYM_EQUIPMENT });
    expect(picker.pick(CATALOG[0]!.pattern)).toBeNull();
  });
});

describe("tiempo por sesión", () => {
  const minutesOf = (answers: PlanAnswers) =>
    generatePlan(answers, CATALOG).days.map((day) => estimateDurationMinutes(day.exercises));

  it("con 60 minutos y experiencia, cada día se acerca a la hora", () => {
    for (const minutes of minutesOf({ ...ANSWERS, experience: "advanced", minutes: 60 })) {
      expect(minutes).toBeGreaterThanOrEqual(55);
    }
  });

  it("si el tope semanal no deja llenar el tiempo, el plan lo avisa", () => {
    const plan = generatePlan({ ...ANSWERS, minutes: 60 }, CATALOG);
    const isShort = plan.days.some((day) => estimateDurationMinutes(day.exercises) < 55);
    expect(plan.isShortOfTime).toBe(isShort);
  });

  it("con 30 minutos ningún día se pasa", () => {
    for (const minutes of minutesOf({ ...ANSWERS, minutes: 30 })) expect(minutes).toBeLessThanOrEqual(35);
  });

  it("quien empieza y pide 75 minutos se queda en su volumen, y el plan lo avisa", () => {
    const plan = generatePlan({ ...ANSWERS, experience: "beginner", minutes: 75 }, CATALOG);
    expect(plan.isShortOfTime).toBe(true);
    for (const sets of weeklySets(plan.days, LOOKUP).values()) expect(sets).toBeLessThanOrEqual(12);
  });
});

describe("equipo disponible", () => {
  const requiresOf = (id: string) => CATALOG.find((exercise) => exercise.id === id)?.requires ?? null;
  const exercisesOf = (answers: PlanAnswers) => generatePlan(answers, CATALOG).days.flatMap((day) => day.exercises);

  it("solo usa ejercicios que se pueden hacer con lo que hay", () => {
    const dumbbells = { ...ANSWERS, equipment: ["dumbbells", "adjustableBench"] as const };
    for (const exercise of exercisesOf(dumbbells)) {
      const requires = requiresOf(exercise.exerciseId);
      expect(requires?.some((option) => option.every((item) => item === "dumbbells" || item === "adjustableBench"))).toBe(true);
    }
  });

  it("sin jalón ni barra, el tirón vertical se cubre con un remo y se avisa", () => {
    const plan = generatePlan({ ...ANSWERS, equipment: ["dumbbells"] }, CATALOG);
    expect(plan.missingPatterns).toContain("vertical_pull");
    const upperA = plan.days[0]?.exercises.map((exercise) => exercise.pattern) ?? [];
    expect(upperA.filter((pattern) => pattern === "horizontal_pull").length).toBeGreaterThanOrEqual(2);
  });

  it("con el gimnasio completo no falta ningún patrón", () => {
    expect(generatePlan(ANSWERS, CATALOG).missingPatterns).toEqual([]);
  });

  it("sin equipo arma un plan de peso corporal", () => {
    const plan = generatePlan({ ...ANSWERS, equipment: [] }, CATALOG);
    const exercises = plan.days.flatMap((day) => day.exercises);
    expect(exercises.length).toBeGreaterThan(0);
    expect(exercises.every((exercise) => exercise.loadType === "bodyweight" || exercise.loadType === "time")).toBe(true);
  });
});
