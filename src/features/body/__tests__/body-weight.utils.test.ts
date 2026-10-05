import { describe, expect, it } from "vitest";
import type { BodyWeightEntry } from "../types/body.types";
import { daysAgo, latestBucket, loggingState, weeklyBuckets, weeklyRateKg } from "../utils/body-weight.utils";

/** Domingo 4 de octubre de 2026, a mediodía. */
const TODAY = new Date(2026, 9, 4, 12);

const entry = (date: string, weight: number, unit: "kg" | "lb" = "kg"): BodyWeightEntry => ({ id: date, date, weight, unit });

describe("daysAgo", () => {
  it("cuenta días de calendario, sin importar la hora", () => {
    expect(daysAgo("2026-10-04", TODAY)).toBe(0);
    expect(daysAgo("2026-10-03", TODAY)).toBe(1);
    expect(daysAgo("2026-09-27", TODAY)).toBe(7);
    expect(daysAgo("2026-10-05", TODAY)).toBe(-1);
  });
});

describe("weeklyBuckets", () => {
  it("promedia los registros de cada tramo de 7 días, del más viejo al actual", () => {
    const entries = [entry("2026-09-22", 73), entry("2026-09-27", 72), entry("2026-09-28", 71), entry("2026-10-04", 70)];
    const buckets = weeklyBuckets({ entries, today: TODAY, weeks: 3 });
    expect(buckets.map((bucket) => bucket.end)).toEqual(["2026-09-20", "2026-09-27", "2026-10-04"]);
    expect(buckets.map((bucket) => bucket.averageKg)).toEqual([null, 72.5, 70.5]);
    expect(buckets.map((bucket) => bucket.count)).toEqual([0, 2, 2]);
  });

  it("convierte las libras a kg antes de promediar", () => {
    const [bucket] = weeklyBuckets({ entries: [entry("2026-10-04", 100, "lb"), entry("2026-10-03", 45.359237)], today: TODAY, weeks: 1 });
    expect(bucket?.averageKg).toBeCloseTo(45.359237, 6);
  });

  it("ignora fechas futuras y deja vacías las semanas sin registros", () => {
    const buckets = weeklyBuckets({ entries: [entry("2026-10-05", 80)], today: TODAY, weeks: 2 });
    expect(buckets.every((bucket) => bucket.averageKg === null && bucket.count === 0)).toBe(true);
  });
});

describe("latestBucket y weeklyRateKg", () => {
  const bucket = (averageKg: number | null) => ({ end: "x", averageKg, count: averageKg === null ? 0 : 1 });

  it("toma la semana más reciente con datos", () => {
    expect(latestBucket([bucket(72), bucket(71), bucket(null)])?.averageKg).toBe(71);
    expect(latestBucket([bucket(null)])).toBeNull();
    expect(latestBucket([])).toBeNull();
  });

  it("reparte el cambio entre las semanas que separan los extremos", () => {
    expect(weeklyRateKg([bucket(72), bucket(71.5), bucket(71)])).toBeCloseTo(-0.5, 6);
    expect(weeklyRateKg([bucket(70), bucket(null), bucket(null), bucket(71.5)])).toBeCloseTo(0.5, 6);
  });

  it("solo mira las últimas 4 semanas de cambio", () => {
    expect(weeklyRateKg([bucket(90), bucket(74), bucket(73), bucket(72), bucket(71), bucket(70)])).toBeCloseTo(-1, 6);
  });

  it("no da cambio con menos de dos semanas con datos", () => {
    expect(weeklyRateKg([bucket(null), bucket(70)])).toBeNull();
    expect(weeklyRateKg([])).toBeNull();
  });
});

describe("loggingState", () => {
  const state = (dates: string[], frequency: "daily" | "weekly") =>
    loggingState({ entries: dates.map((date) => entry(date, 70)), today: TODAY, frequency });

  it("sin registros (o solo futuros) está vacío", () => {
    expect(state([], "daily")).toEqual({ status: "empty", daysSinceLast: null });
    expect(state(["2026-10-09"], "weekly").status).toBe("empty");
  });

  it("a diario: pocos datos con menos de 3 registros en 7 días", () => {
    expect(state(["2026-10-04"], "daily")).toEqual({ status: "sparse", daysSinceLast: 0 });
    expect(state(["2026-09-27", "2026-10-03", "2026-10-04"], "daily").status).toBe("sparse");
  });

  it("a diario: al día si ya se pesó hoy, pendiente si no", () => {
    expect(state(["2026-10-02", "2026-10-03", "2026-10-04"], "daily").status).toBe("ok");
    expect(state(["2026-10-01", "2026-10-02", "2026-10-03"], "daily")).toEqual({ status: "due", daysSinceLast: 1 });
  });

  it("a diario: abandonado tras más de 7 días sin registrar", () => {
    expect(state(["2026-09-27"], "daily").status).toBe("sparse");
    expect(state(["2026-09-26"], "daily")).toEqual({ status: "stale", daysSinceLast: 8 });
  });

  it("cada semana: al día hasta el día 6, toca pesarse desde el 7 y abandonado tras el 14", () => {
    expect(state(["2026-09-28"], "weekly").status).toBe("ok");
    expect(state(["2026-09-27"], "weekly").status).toBe("due");
    expect(state(["2026-09-20"], "weekly").status).toBe("due");
    expect(state(["2026-09-19"], "weekly")).toEqual({ status: "stale", daysSinceLast: 15 });
  });
});
