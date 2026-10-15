import { describe, expect, it } from "vitest";
import { canPerform, parseRequirements } from "../equipment-requirements.utils";

describe("parseRequirements", () => {
  it("lee las combinaciones de equipo", () => {
    expect(parseRequirements('[["barbell","benchPress"],["smith"]]')).toEqual([["barbell", "benchPress"], ["smith"]]);
    expect(parseRequirements("[[]]")).toEqual([[]]);
  });

  it("JSON ausente, dañado o con equipo desconocido es sin dato", () => {
    expect(parseRequirements(null)).toBeNull();
    expect(parseRequirements("{")).toBeNull();
    expect(parseRequirements('[["jacuzzi"]]')).toBeNull();
    expect(parseRequirements('["barbell"]')).toBeNull();
  });
});

describe("canPerform", () => {
  const home = new Set(["dumbbells", "adjustableBench"] as const);

  it("basta con una de las combinaciones completa", () => {
    expect(canPerform([["barbell", "benchPress"], ["dumbbells", "adjustableBench"]], home)).toBe(true);
    expect(canPerform([["barbell", "adjustableBench"]], home)).toBe(false);
  });

  it("un ejercicio con peso corporal se puede hacer sin nada", () => {
    expect(canPerform([[]], new Set())).toBe(true);
  });

  it("sin dato no se propone", () => {
    expect(canPerform(null, home)).toBe(false);
  });
});
