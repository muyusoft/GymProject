import { describe, expect, it } from "vitest";
import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import { dayRegion, pickStretches, pickWarmup, STRETCH_COUNT, WARMUP_COUNT } from "../utils/warmup-selection.utils";

const LEG_DAY = { quadriceps: 9, hamstring: 6, gluteal: 6, calves: 3, abs: 6 };
const PUSH_DAY = { chest: 9, deltoids: 6, triceps: 6 };
const FULL_DAY = { quadriceps: 9, chest: 6, "upper-back": 6 };

describe("dayRegion", () => {
  it("clasifica por el lado que lleva al menos dos tercios de las series", () => {
    expect(dayRegion(LEG_DAY)).toBe("lower");
    expect(dayRegion(PUSH_DAY)).toBe("upper");
    expect(dayRegion(FULL_DAY)).toBe("full");
  });

  it("no deja que el core incline la balanza y sin músculos es cuerpo completo", () => {
    expect(dayRegion({ abs: 20, chest: 3 })).toBe("upper");
    expect(dayRegion({})).toBe("full");
  });
});

describe("pickWarmup", () => {
  it("elige tantos movimientos como permite el tiempo, sin repetir", () => {
    for (const minutes of [30, 45, 60, 75] as const) {
      const picked = pickWarmup({ load: LEG_DAY, minutes, hasBand: false });
      expect(picked).toHaveLength(WARMUP_COUNT[minutes]);
      expect(new Set(picked).size).toBe(picked.length);
    }
  });

  it("empieza con uno general y en un día de pierna llena casi todo con tren inferior", () => {
    const picked = pickWarmup({ load: LEG_DAY, minutes: 60, hasBand: false });
    expect(picked[0]?.region).toBe("general");
    expect(picked.slice(1).map((movement) => movement.region)).toEqual(["lower", "lower", "lower", "upper"]);
  });

  it("sin banda nunca propone movimientos con banda", () => {
    const picked = pickWarmup({ load: PUSH_DAY, minutes: 75, hasBand: false });
    expect(picked.some((movement) => movement.needsBand)).toBe(false);
  });

  it("con banda prefiere la versión con banda pero como mucho dos", () => {
    const picked = pickWarmup({ load: LEG_DAY, minutes: 75, hasBand: true });
    expect(picked.filter((movement) => movement.needsBand)).toHaveLength(2);
  });

  it("da el mismo resultado cada vez para el mismo día", () => {
    const request = { load: FULL_DAY, minutes: 45, hasBand: true } as const;
    expect(pickWarmup(request)).toEqual(pickWarmup(request));
  });
});

describe("pickStretches", () => {
  it("estira lo trabajado y cierra con uno general", () => {
    const picked = pickStretches(PUSH_DAY, 60);
    expect(picked).toHaveLength(STRETCH_COUNT[60]);
    expect(picked[0]?.id).toBe("doorwayChest");
    expect(picked.at(-1)?.region).toBe("general");
  });

  it("sin músculos del día igual devuelve la cantidad pedida, sin repetir", () => {
    const picked = pickStretches({}, 75);
    expect(picked).toHaveLength(STRETCH_COUNT[75]);
    expect(new Set(picked).size).toBe(picked.length);
  });
});

describe("catálogo de movimientos", () => {
  it("no repite ids y cada uno tiene pasos y fuentes", () => {
    const all = [...WARMUP_MOVEMENTS, ...STRETCH_MOVEMENTS];
    expect(new Set(all.map((movement) => movement.id)).size).toBe(all.length);
    expect(all.every((movement) => movement.stepCount > 0 && movement.sources.length > 0)).toBe(true);
  });
});
