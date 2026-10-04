import { describe, expect, it } from "vitest";
import type { ExerciseCandidate, LineMatch, ParsedDay, ParsedLine } from "../types/notes-import.types";
import { formatDetectedMeta } from "../utils/detected-meta.utils";
import {
  buildImportDays,
  countImportLines,
  countPending,
  decisionKey,
  type DayReview,
} from "../utils/import-plan.utils";
import {
  buildCustomExerciseRow,
  buildPlanExerciseRow,
  buildSessionTimes,
  buildSetLogRows,
  FALLBACK_REST_SEC,
} from "../utils/import-rows.utils";

function line(lineNumber: number, overrides: Partial<ParsedLine> = {}): ParsedLine {
  return {
    lineNumber,
    raw: `línea ${lineNumber}`,
    name: `Ejercicio ${lineNumber}`,
    note: null,
    weight: 30,
    unit: "lb",
    loadType: "per_arm",
    sets: 4,
    reps: 12,
    seconds: null,
    restSec: 90,
    ...overrides,
  };
}

const CANDIDATE: ExerciseCandidate = { id: "ex-1", nameEs: "Prensa de piernas", nameEn: "Leg Press", aliases: [], category: "legs" };
const matched: LineMatch = { status: "matched", candidate: CANDIDATE };
const confirm: LineMatch = { status: "confirm", candidate: CANDIDATE };
const unknown: LineMatch = { status: "unknown", candidate: null };

function day(lines: ParsedLine[], withHeader = true): ParsedDay {
  return {
    header: withHeader ? { weekday: 4, day: 2, month: 9 } : null,
    headerText: "Viernes 02 octubre",
    date: withHeader ? new Date(2026, 9, 2) : null,
    lines,
  };
}

const review = (lines: ParsedLine[], matches: LineMatch[], withHeader = true): DayReview => ({
  day: day(lines, withHeader),
  matches,
});

describe("countPending", () => {
  const reviews = [review([line(1), line(2), line(3)], [matched, confirm, unknown])];

  it("cuenta las líneas dudosas sin decidir", () => {
    expect(countPending(reviews, {})).toBe(1);
  });

  it("deja de contarlas cuando el usuario decide, vincule o no", () => {
    expect(countPending(reviews, { [decisionKey(0, 2)]: "link" })).toBe(0);
    expect(countPending(reviews, { [decisionKey(0, 2)]: "keep" })).toBe(0);
  });
});

describe("buildImportDays", () => {
  it("vincula lo reconocido y lo confirmado; lo demás crea un ejercicio nuevo", () => {
    const reviews = [review([line(1), line(2), line(3), line(4)], [matched, confirm, confirm, unknown])];
    const days = buildImportDays(reviews, { [decisionKey(0, 2)]: "link", [decisionKey(0, 3)]: "keep" });
    expect(days[0]?.lines.map((item) => item.exerciseId)).toEqual(["ex-1", "ex-1", null, null]);
    expect(days[0]?.weekday).toBe(4);
  });

  it("omite los días sin encabezado válido", () => {
    const reviews = [review([line(1)], [matched], false), review([line(1)], [matched])];
    expect(buildImportDays(reviews, {})).toHaveLength(1);
  });

  it("cuenta las líneas de todos los días", () => {
    const reviews = [review([line(1), line(2)], [matched, matched]), review([line(1)], [matched])];
    expect(countImportLines(buildImportDays(reviews, {}))).toBe(3);
  });
});

describe("filas de importación", () => {
  it("la plantilla del ejercicio toma peso, carga, series y descanso de las notas", () => {
    const row = buildPlanExerciseRow({ line: line(1), planDayId: "d", exerciseId: "e", order: 2, unit: "kg" });
    expect(row).toMatchObject({ targetWeight: 30, unit: "lb", loadType: "per_arm", sets: 4, reps: 12, restSec: 90, order: 2 });
  });

  it("usa la unidad por defecto y el descanso de siempre si la línea no los trae", () => {
    const bare = line(1, { weight: null, unit: null, restSec: null, loadType: "bodyweight" });
    expect(buildPlanExerciseRow({ line: bare, planDayId: "d", exerciseId: "e", order: 0, unit: "kg" })).toMatchObject({
      unit: "kg",
      restSec: FALLBACK_REST_SEC,
      targetWeight: null,
    });
  });

  it("registra todas las series como completadas", () => {
    let counter = 0;
    const rows = buildSetLogRows({ line: line(1), sessionId: "s", exerciseId: "e", unit: "kg", createId: () => `id-${++counter}` });
    expect(rows).toHaveLength(4);
    expect(rows.every((row) => row.completed === true && row.weight === 30 && row.unit === "lb")).toBe(true);
    expect(rows.map((row) => row.setIndex)).toEqual([0, 1, 2, 3]);
  });

  it("crea el ejercicio nuevo con el nombre escrito y sin patrón", () => {
    const row = buildCustomExerciseRow(line(1, { name: "Mi ejercicio", loadType: "time" }), "new-1");
    expect(row).toMatchObject({ id: "new-1", nameEs: "Mi ejercicio", nameEn: "Mi ejercicio", defaultLoadType: "time" });
    expect(row.pattern).toBeUndefined();
  });

  it("fecha la sesión ese día al mediodía y la hace durar lo estimado", () => {
    const { startedAt, endedAt } = buildSessionTimes(new Date(2026, 9, 2, 22, 15), 70);
    expect(new Date(startedAt).getHours()).toBe(12);
    expect(new Date(startedAt).getDate()).toBe(2);
    expect(endedAt - startedAt).toBe(70 * 60_000);
  });
});

describe("formatDetectedMeta", () => {
  const t = (key: string) => ({ "plan.loadType.per_arm": "Por brazo", "plan.loadType.time": "Tiempo" })[key] ?? key;

  it("resume peso, carga, series y descanso", () => {
    expect(formatDetectedMeta({ line: line(1), locale: "es", t })).toBe("30 lb · por brazo · 4 × 12 · 1:30");
  });

  it("muestra el tiempo en vez de las reps y omite el peso si no hay", () => {
    const plank = line(1, { loadType: "time", weight: null, unit: null, reps: null, seconds: 90, sets: 3, restSec: 120 });
    expect(formatDetectedMeta({ line: plank, locale: "es", t })).toBe("tiempo · 3 × 1:30 · 2:00");
  });
});
