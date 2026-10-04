import { describe, expect, it } from "vitest";
import { clampValue, isAtMax, isAtMin, stepValue } from "../stepper.utils";

const RANGE = { min: 0, max: 10 };

describe("stepValue", () => {
  it("suma y resta el salto", () => {
    expect(stepValue(5, 2.5, RANGE)).toBe(7.5);
    expect(stepValue(5, -2.5, RANGE)).toBe(2.5);
  });

  it("no pasa de los límites", () => {
    expect(stepValue(9, 5, RANGE)).toBe(10);
    expect(stepValue(1, -5, RANGE)).toBe(0);
  });

  it("evita error de coma flotante", () => {
    expect(stepValue(0.1, 0.2, RANGE)).toBe(0.3);
  });
});

describe("clampValue", () => {
  it("devuelve el valor si está dentro del rango", () => {
    expect(clampValue(4, RANGE)).toBe(4);
  });
});

describe("isAtMin / isAtMax", () => {
  it("detecta los límites", () => {
    expect(isAtMin(0, RANGE)).toBe(true);
    expect(isAtMin(1, RANGE)).toBe(false);
    expect(isAtMax(10, RANGE)).toBe(true);
    expect(isAtMax(9, RANGE)).toBe(false);
  });
});
