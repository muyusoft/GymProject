import { describe, expect, it } from "vitest";
import type { SessionSet } from "../types/workout.types";
import { shouldAnnounceRecord } from "../utils/record-notice.utils";

function set(id: string, patch: Partial<SessionSet> = {}): SessionSet {
  return {
    id,
    index: 0,
    weight: 70,
    unit: "kg",
    reps: 8,
    seconds: null,
    loadType: "total",
    completed: true,
    isPR: false,
    rpe: null,
    ...patch,
  };
}

const candidate = (weight: number, reps = 8) => ({ weight, unit: "kg" as const, reps, loadType: "total" as const });

describe("shouldAnnounceRecord", () => {
  it("avisa el primer récord del ejercicio en la sesión", () => {
    expect(shouldAnnounceRecord(candidate(70), "a", [set("a")])).toBe(true);
  });

  it("no repite el aviso con el mismo peso nuevo", () => {
    const sets = [set("a", { isPR: true }), set("b")];
    expect(shouldAnnounceRecord(candidate(70), "b", sets)).toBe(false);
  });

  it("vuelve a avisar si supera el récord recién hecho", () => {
    const sets = [set("a", { isPR: true }), set("b", { weight: 75 })];
    expect(shouldAnnounceRecord(candidate(75), "b", sets)).toBe(true);
    expect(shouldAnnounceRecord(candidate(70, 10), "b", sets)).toBe(true);
  });

  it("las series que no son récord no cuentan", () => {
    const sets = [set("a", { weight: 90 }), set("b")];
    expect(shouldAnnounceRecord(candidate(70), "b", sets)).toBe(true);
  });
});
