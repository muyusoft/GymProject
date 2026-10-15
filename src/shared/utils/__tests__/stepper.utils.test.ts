import { describe, expect, it } from "vitest";
import {
  clampValue,
  isAtMax,
  isAtMin,
  parseTypedValue,
  stepValue,
} from "../stepper.utils";

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

describe("parseTypedValue", () => {
  const range = { min: 0, max: 500 };

  it("acepta coma o punto decimal", () => {
    expect(parseTypedValue("42,5", range)).toBe(42.5);
    expect(parseTypedValue(" 42.5 ", range)).toBe(42.5);
  });

  it("lo deja dentro del rango", () => {
    expect(parseTypedValue("900", range)).toBe(500);
    expect(parseTypedValue("-3", range)).toBe(0);
  });

  it("devuelve null si no es un número", () => {
    expect(parseTypedValue("", range)).toBeNull();
    expect(parseTypedValue("abc", range)).toBeNull();
    expect(parseTypedValue("4,5,6", range)).toBeNull();
  });
});
