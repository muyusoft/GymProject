import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseNotes } from "../utils/parse-notes.utils";

const FIXTURE = readFileSync(join(__dirname, "fixtures", "notes-week-2026-09-28.txt"), "utf8");
const TODAY = new Date(2026, 9, 2);
const notes = parseNotes(FIXTURE, TODAY);
const lines = notes.days.flatMap((day) => day.lines);
const byName = (needle: string) => lines.find((line) => line.name.toLowerCase().includes(needle));

describe("parseNotes sobre las notas de la semana del 28 de septiembre", () => {
  it("detecta los 39 ejercicios en 5 días sin perder ninguna línea", () => {
    expect(notes.issues).toEqual([]);
    expect(notes.days.map((day) => day.lines.length)).toEqual([8, 8, 8, 7, 8]);
    expect(lines).toHaveLength(39);
  });

  it("resuelve las fechas y los días de la semana de cada encabezado", () => {
    expect(notes.days.map((day) => day.header?.weekday)).toEqual([0, 1, 2, 3, 4]);
    expect(notes.days.map((day) => day.date?.getDate())).toEqual([28, 29, 30, 1, 2]);
    expect(notes.days.map((day) => day.date?.getMonth())).toEqual([8, 8, 8, 9, 9]);
    expect(notes.days[0]?.date?.getFullYear()).toBe(2026);
  });

  it("todas las líneas traen series y descanso", () => {
    expect(lines.every((line) => line.sets >= 3)).toBe(true);
    expect(lines.every((line) => line.restSec === 90 || line.restSec === 120)).toBe(true);
  });

  it("lee peso, unidad y carga por brazo", () => {
    expect(byName("hombros con mancuernas")).toMatchObject({
      name: "Press de hombros con mancuernas",
      weight: 30,
      unit: "lb",
      loadType: "per_arm",
      sets: 4,
      reps: 12,
      restSec: 90,
    });
    expect(byName("elevaciones lateral en polea")).toMatchObject({ weight: 5.5, unit: "lb", loadType: "per_arm" });
    expect(lines.filter((line) => line.loadType === "per_arm")).toHaveLength(8);
  });

  it("distingue carga total, en discos y barra", () => {
    expect(byName("reverse pec deck")).toMatchObject({ weight: 30, unit: "kg", loadType: "total" });
    expect(byName("hack squat")).toMatchObject({ weight: 60, unit: "kg", loadType: "total" });
    expect(byName("peso muerto rumano")).toMatchObject({ weight: 25, unit: "kg", loadType: "total" });
    expect(byName("press banca")).toMatchObject({ weight: 30, unit: "kg", loadType: "plates" });
    expect(byName("hip thrust")).toMatchObject({ weight: 60, unit: "kg", loadType: "plates" });
    expect(byName("prensa inclinado")).toMatchObject({ weight: 100, unit: "kg", loadType: "plates" });
    expect(lines.filter((line) => line.loadType === "plates")).toHaveLength(6);
  });

  it("acepta coma suelta tras el peso o tras 'cada brazo'", () => {
    expect(byName("curl de biceps en máquina")).toMatchObject({ weight: 17.5, unit: "kg", loadType: "total" });
    const wednesday = notes.days[2]?.lines.find((line) => line.name.startsWith("Press inclinado"));
    expect(wednesday).toMatchObject({ weight: 35, loadType: "per_arm", sets: 4, reps: 12 });
  });

  it("lee el ejercicio por tiempo con sus segundos y su descanso", () => {
    expect(byName("plancha")).toMatchObject({
      loadType: "time",
      sets: 3,
      seconds: 90,
      reps: null,
      weight: null,
      restSec: 120,
    });
  });

  it("trata las líneas sin peso como peso corporal con sus reps", () => {
    expect(byName("crunch")).toMatchObject({ loadType: "bodyweight", weight: null, sets: 4, reps: 20 });
    expect(byName("russian twist")).toMatchObject({ loadType: "bodyweight", reps: 30 });
    expect(lines.filter((line) => line.loadType === "bodyweight")).toHaveLength(3);
  });

  it("guarda el texto entre paréntesis como nota y lo quita del nombre", () => {
    expect(byName("aductores")).toMatchObject({ name: "Aductores en máquina", note: "hacia adentro" });
    expect(byName("jalón unilateral")).toMatchObject({ name: "Jalón unilateral en polea", note: "agarre central" });
  });

  it("corrige las erratas conocidas del nombre", () => {
    expect(byName("hombros con mancuernas")?.name.startsWith("Press")).toBe(true);
    expect(lines.some((line) => /peck|presa/i.test(line.name))).toBe(false);
  });
});

describe("parseNotes con líneas que no se entienden", () => {
  it("reporta cada línea no reconocida en vez de descartarla", () => {
    const result = parseNotes("Viernes 02 octubre\n- Remo: 25kg 4 series de 10\n- esto no es un ejercicio\nnota suelta", TODAY);
    expect(result.days[0]?.lines).toHaveLength(1);
    expect(result.issues.map((issue) => [issue.lineNumber, issue.reason])).toEqual([
      [3, "unrecognized_line"],
      [4, "unrecognized_line"],
    ]);
  });

  it("reporta los ejercicios que llegan antes de cualquier encabezado", () => {
    const result = parseNotes("- Remo: 25kg 4 series de 10", TODAY);
    expect(result.days).toEqual([]);
    expect(result.issues).toEqual([{ lineNumber: 1, raw: "- Remo: 25kg 4 series de 10", reason: "line_without_day" }]);
  });

  it("devuelve vacío con un texto vacío", () => {
    expect(parseNotes("  \n\n", TODAY)).toEqual({ days: [], issues: [] });
  });
});
