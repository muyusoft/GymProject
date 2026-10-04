import { describe, expect, it } from "vitest";
import {
  convertWeight,
  formatNumber,
  formatWeight,
  roundToIncrement,
} from "../weight.utils";

describe("convertWeight", () => {
  it("convierte lb a kg con 0.45359237", () => {
    expect(convertWeight(30, "lb", "kg")).toBeCloseTo(13.6078, 4);
  });

  it("convierte kg a lb y vuelve al mismo valor", () => {
    expect(convertWeight(convertWeight(80, "kg", "lb"), "lb", "kg")).toBeCloseTo(80);
  });

  it("devuelve el mismo valor si la unidad no cambia", () => {
    expect(convertWeight(42.5, "kg", "kg")).toBe(42.5);
  });

  it("maneja cero", () => {
    expect(convertWeight(0, "lb", "kg")).toBe(0);
  });
});

describe("roundToIncrement", () => {
  it("redondea al salto más cercano", () => {
    expect(roundToIncrement(81, 2.5)).toBe(80);
    expect(roundToIncrement(81.5, 2.5)).toBe(82.5);
  });

  it("ignora un salto inválido", () => {
    expect(roundToIncrement(81, 0)).toBe(81);
    expect(roundToIncrement(81, -5)).toBe(81);
  });
});

describe("formatNumber / formatWeight", () => {
  it("usa el separador del idioma con un decimal como máximo", () => {
    expect(formatNumber(82.5, "es")).toBe("82,5");
    expect(formatNumber(82.5, "en")).toBe("82.5");
    expect(formatNumber(13.6078, "en")).toBe("13.6");
  });

  it("no agrega decimales a un entero", () => {
    expect(formatWeight({ value: 30, unit: "lb", locale: "en" })).toBe("30 lb");
  });
});
