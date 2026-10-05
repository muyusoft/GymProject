import { describe, expect, it } from "vitest";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import { applySwaps, buildSwapSeed, planSubstituteSets, type Swap } from "../utils/swap.utils";

const detail = (id: string, exerciseId: string): PlanExerciseDetail => ({
  planExercise: {
    id,
    planDayId: "day-1",
    exerciseId,
    order: 0,
    sets: 4,
    reps: 12,
    seconds: null,
    restSec: 90,
    targetWeight: 80,
    unit: "kg",
    loadType: "total",
    progressionRule: null,
    updatedAt: 1,
  },
  exercise: { id: exerciseId, nameEs: exerciseId, nameEn: exerciseId, equipment: "barbell" },
});

const DETAILS = [detail("pe-1", "bench"), detail("pe-2", "row")];
const SWAP: Swap = { planExerciseId: "pe-1", exerciseId: "db-press", targetWeight: 30, unit: "lb", loadType: "per_arm" };
const SUBSTITUTES = new Map([["db-press", { id: "db-press", nameEs: "Press mancuernas", nameEn: "DB press", equipment: "dumbbell" as const }]]);

describe("applySwaps", () => {
  it("sin sustituciones deja el plan igual y marca cada lugar como original", () => {
    const result = applySwaps(DETAILS, [], new Map());
    expect(result.map((item) => item.exercise.id)).toEqual(["bench", "row"]);
    expect(result[0]?.slot).toEqual({ planExerciseId: "pe-1", originalExerciseId: "bench", isSubstituted: false });
  });

  it("cambia el ejercicio y su peso, y conserva series, reps y descanso del plan", () => {
    const [swapped, untouched] = applySwaps(DETAILS, [SWAP], SUBSTITUTES);
    expect(swapped?.exercise).toMatchObject({ id: "db-press", equipment: "dumbbell" });
    expect(swapped?.planExercise).toMatchObject({ exerciseId: "db-press", targetWeight: 30, unit: "lb", loadType: "per_arm", sets: 4, reps: 12, restSec: 90 });
    expect(swapped?.slot).toEqual({ planExerciseId: "pe-1", originalExerciseId: "bench", isSubstituted: true });
    expect(untouched?.slot.isSubstituted).toBe(false);
  });

  it("ignora una sustitución cuyo ejercicio ya no existe", () => {
    const [first] = applySwaps(DETAILS, [SWAP], new Map());
    expect(first?.exercise.id).toBe("bench");
    expect(first?.slot.isSubstituted).toBe(false);
  });
});

describe("buildSwapSeed", () => {
  const planExercise = { exerciseId: "bench", targetWeight: 80, unit: "kg", loadType: "total" } as const;
  const substitute = { id: "db-press", defaultLoadType: "per_arm" } as const;

  it("arranca con el último registro del sustituto", () => {
    const lastSet = { targetWeight: 30, unit: "lb", loadType: "per_arm" } as const;
    expect(buildSwapSeed({ planExercise, substitute, lastSet })).toEqual(lastSet);
  });

  it("sin historial deja el peso vacío: no convierte el del ejercicio original", () => {
    expect(buildSwapSeed({ planExercise, substitute, lastSet: null })).toEqual({ targetWeight: null, unit: "kg", loadType: "per_arm" });
  });

  it("volver al original recupera el peso del plan", () => {
    const lastSet = { targetWeight: 70, unit: "kg", loadType: "total" } as const;
    expect(buildSwapSeed({ planExercise, substitute: { id: "bench", defaultLoadType: "total" }, lastSet })).toEqual({ targetWeight: 80, unit: "kg", loadType: "total" });
  });
});

describe("planSubstituteSets", () => {
  it("crea las series que faltan del plan", () => {
    expect(planSubstituteSets({ planSets: 4, doneSets: 0, existingIndexes: [] })).toEqual({ count: 4, startIndex: 0 });
    expect(planSubstituteSets({ planSets: 4, doneSets: 1, existingIndexes: [] })).toEqual({ count: 3, startIndex: 0 });
  });

  it("deja al menos una serie aunque ya se hicieran todas las del plan", () => {
    expect(planSubstituteSets({ planSets: 4, doneSets: 4, existingIndexes: [] })).toEqual({ count: 1, startIndex: 0 });
    expect(planSubstituteSets({ planSets: 4, doneSets: 6, existingIndexes: [] })).toEqual({ count: 1, startIndex: 0 });
  });

  it("si el sustituto ya tiene series en la sesión, continúa después de ellas y no agrega de más", () => {
    expect(planSubstituteSets({ planSets: 4, doneSets: 1, existingIndexes: [0, 1] })).toEqual({ count: 1, startIndex: 2 });
    expect(planSubstituteSets({ planSets: 4, doneSets: 2, existingIndexes: [0, 3] })).toEqual({ count: 0, startIndex: 4 });
  });
});
