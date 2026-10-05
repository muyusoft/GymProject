import { describe, expect, it } from "vitest";
import type { MuscleGroup } from "@/shared/types/training.types";
import { suggestDayName } from "../utils/day-name.utils";

const exercise = (sets: number, ...primary: MuscleGroup[]) => ({ sets, primary });

describe("suggestDayName", () => {
  it("nombra el día por sus focos, del que tiene más series al que tiene menos", () => {
    const day = [exercise(4, "chest"), exercise(4, "chest"), exercise(3, "triceps")];
    expect(suggestDayName(day)).toEqual({ kind: "focus", parts: ["chest", "triceps"] });
  });

  it("un solo foco da un nombre de una palabra", () => {
    expect(suggestDayName([exercise(4, "quadriceps"), exercise(4, "hamstring"), exercise(3, "calves")])).toEqual({
      kind: "focus",
      parts: ["legs"],
    });
  });

  it("deja fuera los focos con menos del 20% de las series", () => {
    const day = [exercise(4, "upper-back"), exercise(4, "upper-back"), exercise(4, "biceps"), exercise(2, "abs")];
    expect(suggestDayName(day)).toEqual({ kind: "focus", parts: ["back", "biceps"] });
  });

  it("bíceps y tríceps juntos son brazos, en el lugar del primero", () => {
    const day = [exercise(4, "biceps"), exercise(3, "triceps"), exercise(3, "deltoids")];
    expect(suggestDayName(day)).toEqual({ kind: "focus", parts: ["arms", "shoulder"] });
    expect(suggestDayName([exercise(4, "forearm")])).toEqual({ kind: "focus", parts: ["arms"] });
  });

  it("un ejercicio con varios músculos principales suma sus series a cada foco, una sola vez por foco", () => {
    const day = [exercise(4, "quadriceps", "gluteal"), exercise(4, "chest", "triceps")];
    expect(suggestDayName(day)).toEqual({ kind: "focus", parts: ["chest", "legs", "triceps"] });
  });

  it("con más de tres focos es cuerpo completo", () => {
    const day = [exercise(3, "chest"), exercise(3, "upper-back"), exercise(3, "quadriceps"), exercise(3, "deltoids")];
    expect(suggestDayName(day)).toEqual({ kind: "fullBody" });
  });

  it("si está tan repartido que ningún foco destaca, también es cuerpo completo", () => {
    const groups: MuscleGroup[] = ["chest", "upper-back", "quadriceps", "deltoids", "biceps", "abs"];
    expect(suggestDayName(groups.map((group) => exercise(3, group)))).toEqual({ kind: "fullBody" });
  });

  it("sin ejercicios, o sin músculos con fuente, no sugiere nada", () => {
    expect(suggestDayName([])).toBeNull();
    expect(suggestDayName([exercise(4), exercise(3)])).toBeNull();
    expect(suggestDayName([exercise(0, "chest")])).toBeNull();
  });
});
