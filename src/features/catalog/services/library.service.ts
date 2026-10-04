import { findActivePlan, findPlanDay } from "@/shared/db/queries/plan.queries";
import {
  findExercise,
  listExercises,
  listPrimaryMuscles,
} from "@/shared/db/queries/exercise.queries";
import {
  insertPlanExercise,
  listPlanExercisesByDay,
  listPlanExercisesByPlan,
} from "@/shared/db/queries/plan-exercise.queries";
import type { WeightUnit } from "@/shared/types/training.types";
import type { LibraryData } from "../types/catalog.types";
import { buildLibrary } from "../utils/build-library.utils";

/** Catálogo con músculos principales y presencia en el plan; `dayId` indica a qué día se está agregando. */
export async function loadLibrary(dayId: string | undefined): Promise<LibraryData> {
  const plan = await findActivePlan();
  const [exercises, primaryMuscles, inPlan, day] = await Promise.all([
    listExercises(),
    listPrimaryMuscles(),
    plan ? listPlanExercisesByPlan(plan.id) : Promise.resolve([]),
    dayId ? findPlanDay(dayId) : Promise.resolve(null),
  ]);
  return {
    exercises: buildLibrary({ exercises, primaryMuscles, inPlan }),
    targetWeekday: day?.weekday ?? null,
  };
}

interface AddToDayOptions {
  dayId: string;
  exerciseId: string;
  unit: WeightUnit;
}

/** Agrega el ejercicio al final del día con los valores base del día; el peso se define al configurarlo. */
export async function addExerciseToDay({ dayId, exerciseId, unit }: AddToDayOptions): Promise<void> {
  const [day, existing, exercise] = await Promise.all([
    findPlanDay(dayId),
    listPlanExercisesByDay(dayId),
    findExercise(exerciseId),
  ]);
  if (!day || !exercise) throw new Error("Day or exercise not found");
  if (existing.some((entry) => entry.exercise.id === exerciseId)) return;

  await insertPlanExercise({
    planDayId: dayId,
    exerciseId,
    order: existing.length,
    sets: day.defaultSets,
    reps: day.defaultReps,
    seconds: null,
    restSec: day.defaultRestSec,
    targetWeight: null,
    unit,
    loadType: exercise.defaultLoadType,
    progressionRule: null,
  });
}
