import {
  findActivePlan,
  findPlanDay,
  updatePlanDay,
} from "@/shared/db/queries/plan.queries";
import {
  deletePlanExercise,
  listPlanExercisesByDay,
  setPlanExerciseOrders,
} from "@/shared/db/queries/plan-exercise.queries";
import { listPrimaryMuscles } from "@/shared/db/queries/exercise.queries";
import { listLastResults } from "@/shared/db/queries/session.queries";
import type { PlanDayPatch } from "@/shared/db/types";
import { syncReminders } from "@/shared/services/reminders.service";
import { lastPerformance } from "@/shared/utils/last-performance.utils";
import type { DayDetail, ReorderDirection } from "../types/plan.types";
import { suggestDayName } from "../utils/day-name.utils";
import { withLastWeightRow } from "../utils/last-weight.utils";

export async function loadDay(dayId: string): Promise<DayDetail | null> {
  const day = await findPlanDay(dayId);
  if (!day) return null;
  const [plan, planned, muscles] = await Promise.all([findActivePlan(), listPlanExercisesByDay(dayId), listPrimaryMuscles()]);
  const lastResults = await listLastResults(planned.map((entry) => entry.exercise.id));
  const exercises = planned.map((entry) => ({
    ...entry,
    planExercise: withLastWeightRow(entry.planExercise, lastPerformance(lastResults.get(entry.exercise.id))),
  }));
  const named = exercises.map(({ planExercise, exercise }) => ({
    sets: planExercise.sets,
    primary: muscles.filter((muscle) => muscle.exerciseId === exercise.id).map((muscle) => muscle.muscleGroup),
  }));
  return { day, planName: plan?.name ?? "", exercises, nameSuggestion: suggestDayName(named) };
}

/** El nombre del día va en el texto del recordatorio, así que se reprograman al guardar. */
export async function saveDay(dayId: string, patch: PlanDayPatch): Promise<void> {
  await updatePlanDay(dayId, patch);
  void syncReminders();
}

interface ReorderOptions {
  dayId: string;
  planExerciseId: string;
  direction: ReorderDirection;
}

/** Intercambia el ejercicio con su vecino y renumera el día para que el orden quede sin huecos. */
export async function reorderExercise({
  dayId,
  planExerciseId,
  direction,
}: ReorderOptions): Promise<void> {
  const ids = (await listPlanExercisesByDay(dayId)).map((entry) => entry.planExercise.id);
  const from = ids.indexOf(planExerciseId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to] as string, ids[from] as string];
  await setPlanExerciseOrders(ids.map((id, order) => ({ id, order })));
}

export function removeExercise(planExerciseId: string): Promise<void> {
  return deletePlanExercise(planExerciseId);
}
