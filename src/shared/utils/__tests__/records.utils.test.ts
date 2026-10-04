import { describe, expect, it } from "vitest";
import {
  bestSetOfSession,
  epley,
  oneRepMaxKg,
  toValidSet,
  type ValidSet,
} from "../one-rep-max.utils";
import { isRecord } from "../records.utils";

const set = (weight: number, reps: number, unit: "kg" | "lb" = "kg"): ValidSet => ({
  weight,
  unit,
  reps,
  loadType: "total",
});

describe("epley", () => {
  it("coincide con peso × (1 + reps / 30) hecho a mano", () => {
    expect(epley(60, 8)).toBeCloseTo(76);
    expect(epley(100, 10)).toBeCloseTo(133.333, 3);
    expect(epley(80, 1)).toBeCloseTo(82.667, 3);
  });
});

describe("oneRepMaxKg", () => {
  it("convierte a kg antes de estimar", () => {
    expect(oneRepMaxKg(set(100, 5, "lb"))).toBeCloseTo(epley(45.359237, 5), 5);
  });
});

describe("toValidSet", () => {
  it("descarta las series no completadas, sin peso o sin reps", () => {
    const base = { weight: 50, unit: "kg" as const, reps: 8, completed: true };
    expect(toValidSet(base)).not.toBeNull();
    expect(toValidSet({ ...base, completed: false })).toBeNull();
    expect(toValidSet({ ...base, weight: null })).toBeNull();
    expect(toValidSet({ ...base, weight: 0 })).toBeNull();
    expect(toValidSet({ ...base, reps: null })).toBeNull();
    expect(toValidSet({ ...base, reps: 0 })).toBeNull();
  });
});

describe("bestSetOfSession", () => {
  it("elige la serie con mayor 1RM estimado, no la de más peso", () => {
    const best = bestSetOfSession([
      { weight: 100, unit: "kg", reps: 3, completed: true },
      { weight: 90, unit: "kg", reps: 8, completed: true },
      { weight: 120, unit: "kg", reps: 5, completed: false },
    ]);
    expect(best).toMatchObject({ weight: 90, reps: 8 });
    expect(best?.oneRepMaxKg).toBeCloseTo(114);
  });

  it("devuelve null sin series válidas", () => {
    expect(bestSetOfSession([])).toBeNull();
    expect(bestSetOfSession([{ weight: 50, unit: "kg", reps: 5, completed: false }])).toBeNull();
  });
});

describe("isRecord", () => {
  const history = [set(80, 8), set(80, 6), set(70, 10)];

  it("no hay récord sin historial: la primera marca es la base", () => {
    expect(isRecord(set(100, 5), [])).toBe(false);
  });

  it("es récord si sube el 1RM estimado", () => {
    expect(isRecord(set(85, 8), history)).toBe(true);
    expect(isRecord(set(80, 10), history)).toBe(true);
  });

  it("es récord con más peso y las mismas reps", () => {
    expect(isRecord(set(82.5, 8), history)).toBe(true);
  });

  it("es récord con más peso y las mismas reps aunque el 1RM estimado no suba", () => {
    expect(isRecord(set(81, 6), history)).toBe(true);
  });

  it("no es récord con igual o menor marca", () => {
    expect(isRecord(set(80, 8), history)).toBe(false);
    expect(isRecord(set(75, 8), history)).toBe(false);
    expect(isRecord(set(60, 5), history)).toBe(false);
  });

  it("compara en kg aunque se registre en lb", () => {
    expect(isRecord(set(190, 8, "lb"), history)).toBe(true);
    expect(isRecord(set(170, 8, "lb"), history)).toBe(false);
  });

  it("solo compara con el mismo tipo de carga", () => {
    const perArm = { ...set(40, 8), loadType: "per_arm" as const };
    expect(isRecord(perArm, history)).toBe(false);
  });
});
