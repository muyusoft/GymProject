import { describe, expect, it } from "vitest";
import type { LoadType } from "@/shared/types/training.types";
import type { SessionExercise } from "../types/workout.types";
import { findRampExercise, muscleLoad, workingWeight, type PrimaryMuscle } from "../utils/warmup-plan.utils";

interface Spec {
  id: string;
  weight: number | null;
  targetWeight?: number | null;
  loadType?: LoadType;
}

function exercise({ id, weight, targetWeight = null, loadType = "total" }: Spec): SessionExercise {
  return {
    slot: { planExerciseId: `pe-${id}`, originalExerciseId: id, isSubstituted: false },
    exerciseId: id,
    nameEs: id,
    nameEn: id,
    template: {
      sets: 3,
      reps: 10,
      repsMin: null,
      seconds: null,
      restSec: 120,
      targetWeight,
      unit: "kg",
      loadType,
      weightStep: 2.5,
      weightSteps: { lb: 5, kg: 2.5 },
      isProgressionEnabled: true,
    },
    sets: [{ id: `${id}-1`, index: 0, weight, unit: "kg", reps: 10, seconds: null, loadType, completed: false, isPR: false, rpe: null }],
    insight: { increase: null, preview: null, deload: null },
    last: null,
  };
}

const MUSCLES: readonly PrimaryMuscle[] = [
  { exerciseId: "curl", group: "biceps" },
  { exerciseId: "squat", group: "quadriceps" },
  { exerciseId: "squat", group: "gluteal" },
  { exerciseId: "pushUp", group: "chest" },
  { exerciseId: "pushUp", group: "triceps" },
];

describe("muscleLoad", () => {
  it("suma las series a cada músculo principal del ejercicio", () => {
    const load = muscleLoad([{ exerciseId: "squat", sets: 4 }, { exerciseId: "curl", sets: 3 }], MUSCLES);
    expect(load).toEqual({ quadriceps: 4, gluteal: 4, biceps: 3 });
  });

  it("sin series ni músculos queda vacío", () => {
    expect(muscleLoad([], MUSCLES)).toEqual({});
    expect(muscleLoad([{ exerciseId: "squat", sets: 4 }], [])).toEqual({});
  });
});

describe("findRampExercise", () => {
  it("elige el primer compuesto con peso, saltando los aislados", () => {
    const exercises = [exercise({ id: "curl", weight: 15 }), exercise({ id: "squat", weight: 100 })];
    expect(findRampExercise(exercises, MUSCLES)?.exerciseId).toBe("squat");
  });

  it("descarta los de peso corporal y los que no tienen peso", () => {
    const exercises = [
      exercise({ id: "pushUp", weight: null, loadType: "bodyweight" }),
      exercise({ id: "squat", weight: null }),
    ];
    expect(findRampExercise(exercises, MUSCLES)).toBeNull();
  });

  it("usa el peso del plan si la primera serie aún no tiene", () => {
    const squat = exercise({ id: "squat", weight: null, targetWeight: 80 });
    expect(workingWeight(squat)).toBe(80);
    expect(findRampExercise([squat], MUSCLES)?.exerciseId).toBe("squat");
  });
});
