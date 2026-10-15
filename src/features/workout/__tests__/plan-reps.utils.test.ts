import { describe, expect, it } from "vitest";
import type { SessionExercise, SessionSet } from "../types/workout.types";
import { planRepsOffer } from "../utils/plan-reps.utils";

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

function exercise(
  sets: SessionSet[],
  patch: { reps?: number | null; repsMin?: number | null; isSubstituted?: boolean } = {},
): SessionExercise {
  return {
    slot: { planExerciseId: "pe1", originalExerciseId: "hack", isSubstituted: patch.isSubstituted ?? false },
    exerciseId: "hack",
    nameEs: "Hack squat",
    nameEn: "Hack squat",
    template: {
      sets: sets.length,
      reps: patch.reps === undefined ? 10 : patch.reps,
      repsMin: patch.repsMin ?? null,
      seconds: null,
      restSec: 120,
      targetWeight: 70,
      unit: "kg",
      loadType: "total",
      weightStep: 2.5,
      weightSteps: { lb: 5, kg: 2.5 },
      isProgressionEnabled: true,
    },
    sets,
    insight: { increase: null, preview: null, deload: null },
    last: null,
  };
}

describe("planRepsOffer", () => {
  it("propone las reps si todas las series se hicieron con otras reps que las del plan", () => {
    expect(planRepsOffer(exercise([set("a"), set("b"), set("c")]))).toBe(8);
  });

  it("no propone nada si coinciden con el plan", () => {
    expect(planRepsOffer(exercise([set("a", { reps: 10 }), set("b", { reps: 10 })]))).toBeNull();
  });

  it("series dispares son cansancio, no un objetivo nuevo", () => {
    expect(planRepsOffer(exercise([set("a"), set("b", { reps: 7 })]))).toBeNull();
  });

  it("espera a que el ejercicio esté terminado", () => {
    expect(planRepsOffer(exercise([set("a"), set("b", { completed: false })]))).toBeNull();
  });

  it("no aplica con rango, con sustituto ni por tiempo", () => {
    const sets = [set("a"), set("b")];
    expect(planRepsOffer(exercise(sets, { repsMin: 6 }))).toBeNull();
    expect(planRepsOffer(exercise(sets, { isSubstituted: true }))).toBeNull();
    expect(planRepsOffer(exercise(sets, { reps: null }))).toBeNull();
  });
});
