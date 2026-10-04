import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import commonExercises from "@/features/catalog/data/common-exercises.json";
import muscleMap from "@/features/catalog/data/muscle-map.json";
import { MUSCLE_GROUPS } from "@/shared/types/training.types";
import { isOneOf } from "@/shared/utils/guard.utils";
import { categoryOf } from "@/shared/utils/muscle-category.utils";
import { EXERCISE_ALIASES } from "../data/exercise-aliases";
import type { ExerciseCandidate, ParsedLine } from "../types/notes-import.types";
import { buildCandidateIndex, matchDay, similarity } from "../utils/match.utils";
import { parseNotes } from "../utils/parse-notes.utils";

/** El catálogo real: los 94 ejercicios comunes con la categoría de su primer músculo principal. */
const CANDIDATES: ExerciseCandidate[] = commonExercises.exercises.map((exercise, index) => {
  const pattern = (muscleMap.patterns as Record<string, { muscles: { group: string; role: string }[] }>)[exercise.pattern];
  const primary = pattern?.muscles.find((muscle) => muscle.role === "primary");
  const group = primary && isOneOf(MUSCLE_GROUPS, primary.group) ? primary.group : null;
  return {
    id: `ex-${index}`,
    nameEs: exercise.nameEs,
    nameEn: exercise.freeExerciseDbName ?? exercise.nameEs,
    aliases: [],
    category: group ? categoryOf([{ group }]) : null,
  };
});

const INDEX = buildCandidateIndex(CANDIDATES);
const FIXTURE = readFileSync(join(__dirname, "fixtures", "notes-week-2026-09-28.txt"), "utf8");
const notes = parseNotes(FIXTURE, new Date(2026, 9, 2));

const matchesByDay = notes.days.map((day) => matchDay({ lines: day.lines, index: INDEX, aliases: EXERCISE_ALIASES }));
const flat = notes.days.flatMap((day, dayIndex) =>
  day.lines.map((line, lineIndex) => ({ line, match: matchesByDay[dayIndex]?.[lineIndex] })),
);
const find = (needle: string) => flat.find(({ line }) => line.name.toLowerCase().includes(needle));
const findExact = (name: string) => flat.find(({ line }) => line.name === name);

describe("matchDay sobre las notas de la semana", () => {
  it("reconoce los 39 ejercicios, ninguno queda sin identificar", () => {
    expect(flat).toHaveLength(39);
    expect(flat.filter(({ match }) => match?.status === "unknown")).toEqual([]);
  });

  it("solo pide confirmar los 4 nombres realmente ambiguos", () => {
    const confirm = flat.filter(({ match }) => match?.status === "confirm");
    expect(confirm.map(({ line }) => line.name)).toEqual([
      "Extensión de tríceps sobre la cabeza",
      "Press inclinado",
      "Pantorrillas en máquina",
      "Pantorrillas en máquina",
    ]);
  });

  it("corrige erratas y plurales al buscar en el catálogo", () => {
    expect(find("hombros con mancuernas")?.match?.candidate?.nameEs).toBe("Press de hombros con mancuernas");
    expect(find("elevaciones lateral en polea")?.match?.candidate?.nameEs).toBe("Elevación lateral en polea");
    expect(find("reverse")?.match?.candidate?.nameEs).toBe("Reverse pec deck");
  });

  it("reconoce las variantes 'A / B' del catálogo", () => {
    expect(findExact("Pec deck")?.match?.candidate?.nameEs).toBe("Pec deck / mariposa");
  });

  it("vincula con alias los nombres propios del usuario", () => {
    expect(find("plancha abdominal")?.match).toMatchObject({ status: "matched", candidate: { nameEs: "Plancha" } });
    expect(find("jalón al pecho")?.match?.candidate?.nameEs).toBe("Jalón al pecho agarre abierto");
    expect(find("prensa inclinado")?.match?.candidate?.nameEs).toBe("Prensa de piernas");
  });

  it("en día de pierna 'Press inclinado' se sugiere como prensa", () => {
    expect(findExact("Press inclinado")?.match).toMatchObject({
      status: "confirm",
      candidate: { nameEs: "Prensa de piernas" },
    });
  });

  it("reconoce 'Copa con mancuerna' porque está en el catálogo", () => {
    expect(find("copa con mancuerna")?.match).toMatchObject({ status: "matched", candidate: { nameEs: "Copa con mancuerna" } });
  });
});

function line(name: string): ParsedLine {
  return { lineNumber: 1, raw: name, name, note: null, weight: null, unit: null, loadType: "bodyweight", sets: 3, reps: 10, seconds: null, restSec: null };
}

describe("matchDay en otros casos", () => {
  const run = (...names: string[]) => matchDay({ lines: names.map(line), index: INDEX, aliases: EXERCISE_ALIASES });

  it("'Press inclinado' en día de pecho sugiere un press inclinado, no la prensa", () => {
    const [result] = run("Press inclinado", "Press banca", "Pec deck");
    expect(result?.status).toBe("confirm");
    expect(result?.candidate?.nameEs.startsWith("Press inclinado")).toBe(true);
  });

  it("deja como desconocido lo que no se parece a nada", () => {
    expect(run("Zzz inventado")[0]).toEqual({ status: "unknown", candidate: null });
  });
});

describe("similarity", () => {
  it("vale 1 con las mismas palabras y 0 sin nada en común", () => {
    expect(similarity(["a", "b"], ["b", "a"])).toBe(1);
    expect(similarity(["a"], ["b"])).toBe(0);
    expect(similarity([], ["b"])).toBe(0);
  });

  it("vale 0.8 con 2 palabras iguales de 2 y 3", () => {
    expect(similarity(["a", "b"], ["a", "b", "c"])).toBeCloseTo(0.8);
  });
});
