import { describe, expect, it } from "vitest";
import { rampSets } from "../utils/ramp-sets.utils";

describe("rampSets", () => {
  it("con carga normal: barra sola, 50 % y 75 %, redondeado al salto", () => {
    expect(rampSets({ weight: 100, unit: "kg", step: 2.5 })).toEqual([
      { reps: 10, weight: null },
      { reps: 5, weight: 50 },
      { reps: 3, weight: 75 },
    ]);
    expect(rampSets({ weight: 135, unit: "lb", step: 5 })).toEqual([
      { reps: 10, weight: null },
      { reps: 5, weight: 70 },
      { reps: 3, weight: 100 },
    ]);
  });

  it("con carga liviana basta una serie de 8 al 50 %", () => {
    expect(rampSets({ weight: 16, unit: "kg", step: 2 })).toEqual([{ reps: 8, weight: 8 }]);
    expect(rampSets({ weight: 40, unit: "lb", step: 5 })).toEqual([{ reps: 8, weight: 20 }]);
  });

  it("si el redondeo deja cero, es la carga mínima", () => {
    expect(rampSets({ weight: 4, unit: "kg", step: 5 })).toEqual([{ reps: 8, weight: null }]);
  });

  it("sin peso de trabajo no propone aproximación", () => {
    expect(rampSets({ weight: 0, unit: "kg", step: 2.5 })).toEqual([]);
    expect(rampSets({ weight: -5, unit: "kg", step: 2.5 })).toEqual([]);
  });
});
