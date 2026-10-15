import { describe, expect, it } from "vitest";
import type { PlanExerciseRow } from "@/shared/db/types";
import { withLastWeightRow } from "../utils/last-weight.utils";

const ROW: PlanExerciseRow = {
  id: "pe1",
  planDayId: "d1",
  exerciseId: "hack-squat",
  order: 0,
  sets: 3,
  reps: 10,
  seconds: null,
  restSec: 120,
  targetWeight: 60,
  unit: "kg",
  loadType: "total",
  progressionRule: null,
  updatedAt: 0,
};
const LAST = { weight: 155, unit: "lb" as const, reps: 8 };

describe("withLastWeightRow", () => {
  it("muestra el último peso y su unidad en lugar del del plan", () => {
    expect(withLastWeightRow(ROW, LAST)).toMatchObject({ targetWeight: 155, unit: "lb", reps: 10 });
  });

  it("sin historial queda el peso del plan", () => {
    expect(withLastWeightRow(ROW, null)).toBe(ROW);
  });

  it("no aplica a ejercicios sin peso", () => {
    const plank = { ...ROW, loadType: "time" as const, targetWeight: null };
    expect(withLastWeightRow(plank, LAST)).toBe(plank);
  });
});
