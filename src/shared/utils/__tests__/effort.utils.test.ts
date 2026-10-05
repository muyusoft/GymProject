import { describe, expect, it } from "vitest";
import {
  EFFORT_LEVELS,
  effortOfSets,
  effortToRpe,
  rpeToEffort,
} from "../effort.utils";

describe("effortToRpe / rpeToEffort", () => {
  it("cada respuesta vuelve a ser la misma al leerla", () => {
    for (const level of EFFORT_LEVELS)
      expect(rpeToEffort(effortToRpe(level))).toBe(level);
  });

  it("clasifica un RPE cualquiera por sus límites", () => {
    expect(rpeToEffort(6)).toBe("easy");
    expect(rpeToEffort(7.9)).toBe("easy");
    expect(rpeToEffort(8)).toBe("solid");
    expect(rpeToEffort(8.9)).toBe("solid");
    expect(rpeToEffort(9)).toBe("limit");
    expect(rpeToEffort(10)).toBe("limit");
  });

  it("sin dato no hay esfuerzo", () => {
    expect(rpeToEffort(null)).toBeNull();
  });
});

describe("effortOfSets", () => {
  it("usa la media de las series con dato", () => {
    expect(effortOfSets([{ rpe: 10 }, { rpe: 10 }, { rpe: 10 }])).toBe("limit");
    expect(effortOfSets([{ rpe: 7 }, { rpe: null }])).toBe("easy");
  });

  it("sin series o sin datos devuelve null", () => {
    expect(effortOfSets([])).toBeNull();
    expect(effortOfSets([{ rpe: null }, { rpe: null }])).toBeNull();
  });
});
