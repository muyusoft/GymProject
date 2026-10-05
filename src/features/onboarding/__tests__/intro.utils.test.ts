import { describe, expect, it } from "vitest";
import { clampStep, isLastStep, pageFromOffset } from "../utils/intro.utils";

describe("clampStep", () => {
  it("deja el paso como está cuando cabe", () => {
    expect(clampStep(2, 5)).toBe(2);
  });

  it("no baja de 0 ni pasa del último", () => {
    expect(clampStep(-1, 5)).toBe(0);
    expect(clampStep(9, 5)).toBe(4);
  });

  it("sin pasos devuelve 0", () => {
    expect(clampStep(3, 0)).toBe(0);
  });
});

describe("pageFromOffset", () => {
  it("convierte el desplazamiento en el paso visible", () => {
    expect(pageFromOffset(0, 390, 5)).toBe(0);
    expect(pageFromOffset(780, 390, 5)).toBe(2);
  });

  it("redondea al paso más cercano", () => {
    expect(pageFromOffset(400, 390, 5)).toBe(1);
    expect(pageFromOffset(190, 390, 5)).toBe(0);
  });

  it("antes de medir el ancho es el primer paso", () => {
    expect(pageFromOffset(500, 0, 5)).toBe(0);
  });

  it("no pasa del último aunque el desplazamiento rebote", () => {
    expect(pageFromOffset(5000, 390, 5)).toBe(4);
  });
});

describe("isLastStep", () => {
  it("solo el último paso lo es", () => {
    expect(isLastStep(3, 5)).toBe(false);
    expect(isLastStep(4, 5)).toBe(true);
  });
});
