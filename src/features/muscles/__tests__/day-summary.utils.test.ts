import { describe, expect, it } from "vitest";
import type { DayExercise, DaySet, MuscleLink } from "../types/muscles.types";
import { hasRecord, mergeDayLinks, sessionMinutes, summarizeDayExercise } from "../utils/day-summary.utils";
import { weeklySetsByGroup } from "../utils/muscle-volume.utils";

function link(overrides: Partial<MuscleLink>): MuscleLink {
  return { exerciseId: "bench", group: "chest", view: "both", role: "primary", basis: "measured", sourceIds: ["a"], ...overrides };
}

function set(overrides: Partial<DaySet> = {}): DaySet {
  return { weight: 30, unit: "lb", reps: 12, seconds: null, loadType: "total", isPR: false, ...overrides };
}

describe("mergeDayLinks", () => {
  const links = [
    link({ exerciseId: "bench", group: "triceps", role: "secondary" }),
    link({ exerciseId: "pushdown", group: "triceps", role: "primary" }),
    link({ exerciseId: "press", group: "deltoids", role: "primary", view: "front" }),
    link({ exerciseId: "face-pull", group: "deltoids", role: "secondary", view: "back" }),
    link({ exerciseId: "squat", group: "quadriceps" }),
  ];

  it("cuenta como principal un grupo que algún ejercicio trabajó como principal", () => {
    const merged = mergeDayLinks(links, new Set(["bench", "pushdown"]));
    expect(merged).toEqual([expect.objectContaining({ group: "triceps", role: "primary" })]);
  });

  it("pinta el deltoides en las dos vistas solo si se trabajó de frente y de espalda", () => {
    expect(mergeDayLinks(links, new Set(["press"]))[0]?.view).toBe("front");
    expect(mergeDayLinks(links, new Set(["press", "face-pull"]))[0]).toMatchObject({ view: "both", role: "primary" });
  });

  it("ignora los ejercicios que no se hicieron ese día", () => {
    expect(mergeDayLinks(links, new Set(["bench"])).map((item) => item.group)).toEqual(["triceps"]);
    expect(mergeDayLinks(links, new Set())).toEqual([]);
  });

  it("junta las fuentes sin repetir", () => {
    const merged = mergeDayLinks(
      [link({ sourceIds: ["a", "b"] }), link({ exerciseId: "fly", sourceIds: ["b", "c"] })],
      new Set(["bench", "fly"]),
    );
    expect(merged[0]?.sourceIds).toEqual(["a", "b", "c"]);
  });

  it("las series del día por grupo usan el mismo método fraccional que la semana", () => {
    const totals = weeklySetsByGroup(
      [{ exerciseId: "bench" }, { exerciseId: "bench" }, { exerciseId: "pushdown" }],
      links,
    );
    expect(totals.triceps).toBe(2);
  });
});

describe("resumen de ejercicios y sesiones", () => {
  const exercise = (sets: DaySet[]): DayExercise => ({ exerciseId: "e", nameEs: "Remo", nameEn: "Row", sets });

  it("resume series × reps de la serie más pesada y su peso", () => {
    expect(summarizeDayExercise(exercise([set({ weight: 25 }), set({ weight: 30, reps: 10 }), set(), set()]), "es")).toBe("4 × 10 · 30 lb");
  });

  it("muestra la duración en ejercicios por tiempo y omite el peso si no hay", () => {
    expect(summarizeDayExercise(exercise([set({ loadType: "time", seconds: 90, weight: null, reps: null })]), "es")).toBe("1 × 1:30");
    expect(summarizeDayExercise(exercise([set({ loadType: "bodyweight", weight: null, reps: 20 })]), "es")).toBe("1 × 20");
    expect(summarizeDayExercise(exercise([]), "es")).toBe("");
  });

  it("detecta si hubo récord", () => {
    expect(hasRecord(exercise([set(), set({ isPR: true })]))).toBe(true);
    expect(hasRecord(exercise([set()]))).toBe(false);
  });

  it("suma los minutos de todas las sesiones del día", () => {
    const minute = 60_000;
    expect(sessionMinutes([
      { id: "a", dayName: null, startedAt: 0, endedAt: 45 * minute },
      { id: "b", dayName: null, startedAt: 0, endedAt: 20 * minute },
    ])).toBe(65);
    expect(sessionMinutes([])).toBe(0);
  });
});
