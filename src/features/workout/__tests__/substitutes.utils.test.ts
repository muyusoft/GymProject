import { describe, expect, it } from "vitest";
import type { Equipment, LoadType, MuscleGroup } from "@/shared/types/training.types";
import {
  equipmentOptions,
  rankSubstitutes,
  searchSubstitutes,
  visibleSuggestions,
  type CatalogExercise,
  type SubstituteContext,
} from "../utils/substitutes.utils";

interface ExerciseOptions {
  pattern?: string | null;
  equipment?: Equipment;
  defaultLoadType?: LoadType;
}

const exercise = (id: string, options: ExerciseOptions = {}): CatalogExercise => ({
  id,
  nameEs: id,
  nameEn: `${id} en`,
  pattern: options.pattern ?? null,
  equipment: options.equipment ?? "barbell",
  defaultLoadType: options.defaultLoadType ?? "total",
});

const BENCH = exercise("Press banca", { pattern: "horizontal_push" });
const CATALOG = [
  BENCH,
  exercise("Press con mancuernas", { pattern: "horizontal_push", equipment: "dumbbell" }),
  exercise("Press en máquina", { pattern: "horizontal_push", equipment: "machine" }),
  exercise("Aperturas", { pattern: "fly", equipment: "dumbbell" }),
  exercise("Fondos", { pattern: "dip", equipment: "bodyweight" }),
  exercise("Sentadilla", { pattern: "squat" }),
  exercise("Plancha", { pattern: "horizontal_push", defaultLoadType: "time" }),
  exercise("Sin datos"),
];
const MUSCLES = new Map<string, MuscleGroup[]>([
  ["Press banca", ["chest", "triceps"]],
  ["Press con mancuernas", ["chest"]],
  ["Aperturas", ["chest"]],
  ["Fondos", ["chest", "triceps"]],
  ["Sentadilla", ["quadriceps"]],
]);

const context = (overrides: Partial<SubstituteContext> = {}): SubstituteContext => ({
  original: BENCH,
  catalog: CATALOG,
  primaryMuscles: MUSCLES,
  usedIds: new Set(),
  excludedIds: new Set(),
  ...overrides,
});

const ids = (list: readonly { exerciseId: string }[]) => list.map((item) => item.exerciseId);

describe("rankSubstitutes", () => {
  it("pone primero el mismo movimiento y luego los que comparten músculo principal, por cuántos comparten", () => {
    const ranked = rankSubstitutes(context());
    expect(ids(ranked)).toEqual(["Press con mancuernas", "Press en máquina", "Fondos", "Aperturas"]);
    expect(ranked.map((item) => item.reason)).toEqual(["pattern", "pattern", "muscle", "muscle"]);
  });

  it("no sugiere el original, otro músculo, ni ejercicios sin patrón ni músculos con fuente", () => {
    const ranked = ids(rankSubstitutes(context()));
    expect(ranked).not.toContain("Press banca");
    expect(ranked).not.toContain("Sentadilla");
    expect(ranked).not.toContain("Sin datos");
  });

  it("no cambia un ejercicio de repeticiones por uno por tiempo", () => {
    expect(ids(rankSubstitutes(context()))).not.toContain("Plancha");
  });

  it("dentro de cada grupo, antes los que ya se hicieron", () => {
    const ranked = rankSubstitutes(context({ usedIds: new Set(["Press en máquina", "Aperturas"]) }));
    expect(ids(ranked)).toEqual(["Press en máquina", "Press con mancuernas", "Aperturas", "Fondos"]);
    expect(ranked[0]?.hasHistory).toBe(true);
    expect(ranked[1]?.hasHistory).toBe(false);
  });

  it("deja fuera los ejercicios que ya están en el entreno de hoy", () => {
    expect(ids(rankSubstitutes(context({ excludedIds: new Set(["Press con mancuernas", "Fondos"]) })))).toEqual(["Press en máquina", "Aperturas"]);
  });

  it("sin patrón en el original solo sugiere por músculo", () => {
    const original = { ...BENCH, pattern: null };
    const ranked = rankSubstitutes(context({ original }));
    expect(ranked.every((item) => item.reason === "muscle")).toBe(true);
    expect(ids(ranked)).toEqual(["Fondos", "Aperturas", "Press con mancuernas"]);
  });

  it("sin patrón ni músculos con fuente no sugiere nada", () => {
    expect(rankSubstitutes(context({ original: exercise("Sin datos") }))).toEqual([]);
  });
});

describe("searchSubstitutes", () => {
  it("busca por nombre en los dos idiomas, sin acentos ni mayúsculas", () => {
    expect(ids(searchSubstitutes(context(), "MAQUINA"))).toEqual(["Press en máquina"]);
    expect(ids(searchSubstitutes(context(), "sentadilla en"))).toEqual(["Sentadilla"]);
  });

  it("encuentra ejercicios que no son sugerencia, pero no el original ni los de hoy", () => {
    expect(ids(searchSubstitutes(context(), "sin"))).toEqual(["Sin datos"]);
    expect(searchSubstitutes(context(), "press banca")).toEqual([]);
    expect(searchSubstitutes(context({ excludedIds: new Set(["Sentadilla"]) }), "sentadilla")).toEqual([]);
  });

  it("sin texto no devuelve nada", () => {
    expect(searchSubstitutes(context(), "   ")).toEqual([]);
  });
});

describe("filtros por equipo", () => {
  const ranked = rankSubstitutes(context());

  it("lista los equipos presentes, sin repetir", () => {
    expect(equipmentOptions(ranked)).toEqual(["dumbbell", "machine", "bodyweight"]);
  });

  it("filtra por equipo y limita a 8 sugerencias", () => {
    expect(ids(visibleSuggestions(ranked, "dumbbell"))).toEqual(["Press con mancuernas", "Aperturas"]);
    expect(visibleSuggestions(ranked, null)).toHaveLength(4);
    const many = Array.from({ length: 12 }, (_, index) => ({ ...ranked[0]!, exerciseId: `x-${index}` }));
    expect(visibleSuggestions(many, null)).toHaveLength(8);
  });
});
