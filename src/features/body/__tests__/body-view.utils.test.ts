import { describe, expect, it } from "vitest";
import type { BodyWeightEntry } from "../types/body.types";
import { bmiCategory, bmiResult, bodyMassIndex } from "../utils/bmi.utils";
import { buildBodyView, initialDraft, rateDirection, resolveBodyUnit } from "../utils/body-view.utils";

const TODAY = new Date(2026, 9, 4, 12);

const entry = (date: string, weight: number, unit: "kg" | "lb" = "kg"): BodyWeightEntry => ({ id: date, date, weight, unit });

describe("IMC", () => {
  it("es el peso entre la estatura al cuadrado", () => {
    expect(bodyMassIndex(70, 175)).toBeCloseTo(22.857, 3);
  });

  it("no se calcula sin estatura o sin peso", () => {
    expect(bodyMassIndex(70, 0)).toBeNull();
    expect(bodyMassIndex(0, 175)).toBeNull();
    expect(bodyMassIndex(70, -10)).toBeNull();
    expect(bmiResult(null, 175)).toBeNull();
  });

  it("clasifica con los rangos de la OMS, incluyendo los bordes", () => {
    expect(bmiCategory(18.4)).toBe("underweight");
    expect(bmiCategory(18.5)).toBe("normal");
    expect(bmiCategory(24.9)).toBe("normal");
    expect(bmiCategory(25)).toBe("overweight");
    expect(bmiCategory(29.9)).toBe("overweight");
    expect(bmiCategory(30)).toBe("obesity");
  });
});

describe("unidad y valor inicial", () => {
  it("usa la unidad de Ajustes; con según ejercicio, la del último registro o kg", () => {
    expect(resolveBodyUnit("lb", entry("2026-10-04", 70))).toBe("lb");
    expect(resolveBodyUnit("per_exercise", entry("2026-10-04", 155, "lb"))).toBe("lb");
    expect(resolveBodyUnit("per_exercise", null)).toBe("kg");
  });

  it("arranca en el último peso, convertido y a una décima", () => {
    expect(initialDraft(entry("2026-10-04", 72.4), "kg")).toBe(72.4);
    expect(initialDraft(entry("2026-10-04", 70), "lb")).toBe(154.3);
    expect(initialDraft(null, "kg")).toBe(70);
    expect(initialDraft(null, "lb")).toBe(155);
  });

  it("trata como estable un cambio menor a 0.05 por semana", () => {
    expect(rateDirection(0.04)).toBe("same");
    expect(rateDirection(-0.04)).toBe("same");
    expect(rateDirection(0.3)).toBe("up");
    expect(rateDirection(-0.3)).toBe("down");
  });
});

describe("buildBodyView", () => {
  const options = { today: TODAY, preference: "kg", frequency: "daily", heightCm: 175 } as const;

  it("sin registros no inventa media, cambio ni IMC", () => {
    const view = buildBodyView({ ...options, entries: [] });
    expect(view).toMatchObject({ unit: "kg", latest: null, todayEntry: null, average: null, ratePerWeek: null, bmi: null, recent: [] });
    expect(view.logging.status).toBe("empty");
    expect(view.weeks).toHaveLength(6);
  });

  it("resume la media de la semana, el cambio semanal y el IMC", () => {
    const entries = [entry("2026-09-25", 72), entry("2026-10-02", 71), entry("2026-10-03", 70), entry("2026-10-04", 69)];
    const view = buildBodyView({ ...options, entries });
    expect(view.average).toBeCloseTo(70, 6);
    expect(view.averageCount).toBe(3);
    expect(view.ratePerWeek).toBeCloseTo(-2, 6);
    expect(view.bmi?.category).toBe("normal");
    expect(view.todayEntry?.weight).toBe(69);
    expect(view.recent.map((item) => item.date)).toEqual(["2026-10-04", "2026-10-03", "2026-10-02", "2026-09-25"]);
    expect(view.logging.status).toBe("ok");
  });

  it("muestra en libras lo que se guardó en kilos", () => {
    const view = buildBodyView({ ...options, preference: "lb", entries: [entry("2026-10-04", 45.359237)] });
    expect(view.unit).toBe("lb");
    expect(view.average).toBeCloseTo(100, 6);
    expect(view.weeks[5]?.value).toBeCloseTo(100, 6);
  });

  it("sin estatura no hay IMC", () => {
    expect(buildBodyView({ ...options, heightCm: 0, entries: [entry("2026-10-04", 70)] }).bmi).toBeNull();
  });

  it("limita la lista a los 10 registros más recientes", () => {
    const entries = Array.from({ length: 12 }, (_, index) => entry(`2026-09-${String(index + 10).padStart(2, "0")}`, 70));
    expect(buildBodyView({ ...options, entries }).recent).toHaveLength(10);
  });
});
