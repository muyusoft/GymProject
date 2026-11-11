import { describe, expect, it } from "vitest";
import { parseProgressionRule } from "@/shared/utils/progression-rule.utils";
import {
  canOfferRepRange,
  proposedRepsMin,
  withProposedRange,
} from "../utils/rep-range-offer.utils";

const FIXED = { reps: 12, loadType: "total" as const, progressionRule: null };

describe("proposedRepsMin", () => {
  it("propone ⅔ del tope, igual que los rangos del asistente", () => {
    expect(proposedRepsMin(12)).toBe(8);
    expect(proposedRepsMin(15)).toBe(10);
    expect(proposedRepsMin(6)).toBe(4);
    expect(proposedRepsMin(8)).toBe(5);
  });

  it("no propone rango cuando no queda por debajo del tope", () => {
    expect(proposedRepsMin(1)).toBeNull();
    expect(proposedRepsMin(0)).toBeNull();
  });
});

describe("canOfferRepRange", () => {
  it("se ofrece a ejercicios con peso y reps fijas", () => {
    expect(canOfferRepRange(FIXED)).toBe(true);
  });

  it("no se ofrece si ya tiene rango", () => {
    const ranged = { ...FIXED, progressionRule: '{"enabled":true,"sessions":2,"repsMin":8}' };
    expect(canOfferRepRange(ranged)).toBe(false);
  });

  it("no se ofrece por tiempo, con peso corporal ni sin reps", () => {
    expect(canOfferRepRange({ ...FIXED, loadType: "time" })).toBe(false);
    expect(canOfferRepRange({ ...FIXED, loadType: "bodyweight" })).toBe(false);
    expect(canOfferRepRange({ ...FIXED, reps: null })).toBe(false);
    expect(canOfferRepRange({ ...FIXED, reps: 1 })).toBe(false);
  });
});

describe("withProposedRange", () => {
  it("agrega el mínimo y conserva el interruptor del ejercicio", () => {
    const rule = withProposedRange('{"enabled":false,"sessions":2}', 12);
    expect(parseProgressionRule(rule)).toEqual({ enabled: false, sessions: 2, repsMin: 8 });
  });

  it("sin regla guardada parte de la regla por defecto", () => {
    expect(parseProgressionRule(withProposedRange(null, 15))).toEqual({
      enabled: true,
      sessions: 2,
      repsMin: 10,
    });
  });
});
