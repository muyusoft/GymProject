import { describe, expect, it } from "vitest";
import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import type { Movement } from "../types/warmup.types";
import { doseKey, movementSeconds, totalMinutes } from "../utils/movement-dose.utils";

const byId = (id: string): Movement => {
  const movement = [...WARMUP_MOVEMENTS, ...STRETCH_MOVEMENTS].find((item) => item.id === id);
  if (!movement) throw new Error(id);
  return movement;
};

describe("doseKey", () => {
  it("elige la clave según la unidad y si es por lado", () => {
    expect(doseKey({ amount: 10, unit: "reps", isPerSide: false })).toEqual({ key: "reps", count: 10 });
    expect(doseKey({ amount: 6, unit: "reps", isPerSide: true })).toEqual({ key: "repsPerSide", count: 6 });
    expect(doseKey({ amount: 12, unit: "steps", isPerSide: true })).toEqual({ key: "steps", count: 12 });
    expect(doseKey({ amount: 30, unit: "seconds", isPerSide: true })).toEqual({ key: "secondsPerSide", count: 30 });
    expect(doseKey({ amount: 30, unit: "seconds", isPerSide: false })).toEqual({ key: "seconds", count: 30 });
  });
});

describe("tiempo de los movimientos", () => {
  it("cuenta los dos lados", () => {
    expect(movementSeconds(byId("standingQuad"))).toBe(60);
    expect(movementSeconds(byId("jumpingJacks"))).toBe(30);
  });

  it("redondea los minutos hacia arriba y nunca da cero", () => {
    expect(totalMinutes([byId("standingQuad"), byId("seatedHamstring"), byId("figureFour")])).toBe(3);
    expect(totalMinutes([])).toBe(1);
  });
});
