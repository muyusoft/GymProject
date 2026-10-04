import { describe, expect, it } from "vitest";
import { estimateDurationMinutes, formatClock } from "../duration.utils";

describe("estimateDurationMinutes", () => {
  it("suma series × (40 s + descanso) y redondea a 5 minutos", () => {
    const eight = Array.from({ length: 8 }, () => ({ sets: 4, restSec: 90 }));
    expect(estimateDurationMinutes(eight)).toBe(70);
  });

  it("usa los segundos del ejercicio por tiempo en vez de 40", () => {
    const plank = [{ sets: 3, restSec: 120, seconds: 90 }];
    expect(estimateDurationMinutes(plank)).toBe(10);
  });

  it("devuelve 0 sin ejercicios", () => {
    expect(estimateDurationMinutes([])).toBe(0);
  });
});

describe("formatClock", () => {
  it("formatea minutos y segundos con cero a la izquierda", () => {
    expect(formatClock(90)).toBe("1:30");
    expect(formatClock(125)).toBe("2:05");
    expect(formatClock(0)).toBe("0:00");
  });
});
