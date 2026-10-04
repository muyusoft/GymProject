import { describe, expect, it } from "vitest";
import type { LibraryExercise } from "../types/catalog.types";
import { buildLibraryRows, filterLibrary } from "../utils/library-filter.utils";
import { categoryOf } from "@/shared/utils/muscle-category.utils";
import { muscleLabelKey } from "@/shared/utils/muscle-label.utils";

function exercise(overrides: Partial<LibraryExercise>): LibraryExercise {
  return {
    id: "id",
    nameEs: "Ejercicio",
    nameEn: "Exercise",
    aliases: [],
    equipment: "dumbbell",
    defaultLoadType: "per_arm",
    primary: [],
    category: null,
    plan: null,
    ...overrides,
  };
}

const PRESS = exercise({ id: "1", nameEs: "Press de hombros", nameEn: "Shoulder Press", category: "shoulder" });
const CURL = exercise({ id: "2", nameEs: "Curl de bíceps", nameEn: "Biceps Curl", category: "arms", equipment: "cable" });
const ALL = [PRESS, CURL];
const NO_FILTERS = { query: "", category: null, equipment: null } as const;

describe("filterLibrary", () => {
  it("busca en español sin importar acentos ni mayúsculas", () => {
    expect(filterLibrary(ALL, { ...NO_FILTERS, query: "BICEPS" })).toEqual([CURL]);
  });

  it("busca también en inglés y en los alias", () => {
    expect(filterLibrary(ALL, { ...NO_FILTERS, query: "shoulder" })).toEqual([PRESS]);
    const aliased = exercise({ id: "3", aliases: ["jalón"] });
    expect(filterLibrary([aliased], { ...NO_FILTERS, query: "jalon" })).toEqual([aliased]);
  });

  it("combina músculo y equipo", () => {
    expect(filterLibrary(ALL, { ...NO_FILTERS, category: "arms", equipment: "cable" })).toEqual([CURL]);
    expect(filterLibrary(ALL, { ...NO_FILTERS, category: "arms", equipment: "dumbbell" })).toEqual([]);
  });

  it("deja fuera los ejercicios sin músculo mapeado al filtrar por músculo", () => {
    const unmapped = exercise({ id: "4", category: null });
    expect(filterLibrary([unmapped], { ...NO_FILTERS, category: "chest" })).toEqual([]);
  });

  it("devuelve todo sin filtros", () => {
    expect(filterLibrary(ALL, NO_FILTERS)).toHaveLength(2);
  });
});

describe("buildLibraryRows", () => {
  it("pone primero 'En tu plan' y ordena cada grupo por nombre", () => {
    const planned = { ...CURL, plan: { weekdays: [0], targetWeight: 30, unit: "kg" as const } };
    const rows = buildLibraryRows([PRESS, planned], "es");
    expect(rows.map((row) => (row.kind === "section" ? row.key : row.exercise.id))).toEqual([
      "inPlan",
      "2",
      "more",
      "1",
    ]);
  });

  it("omite una sección vacía", () => {
    expect(buildLibraryRows([PRESS], "es").map((row) => row.kind)).toEqual(["section", "exercise"]);
    expect(buildLibraryRows([], "es")).toEqual([]);
  });
});

describe("muscle helpers", () => {
  it("toma la categoría del primer músculo principal", () => {
    expect(categoryOf([{ group: "hamstring" }])).toBe("legs");
    expect(categoryOf([])).toBeNull();
  });

  it("nombra el deltoides por vista y el resto por grupo", () => {
    expect(muscleLabelKey({ group: "deltoids", view: "back" })).toBe("muscles.deltoids.back");
    expect(muscleLabelKey({ group: "chest", view: "both" })).toBe("muscles.group.chest");
  });
});
