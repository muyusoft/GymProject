import { asc, eq } from "drizzle-orm";
import { generateId } from "@/shared/utils/id.utils";
import { db } from "../client";
import { exercises, planDays, planExercises } from "../schema";
import type {
  NewPlanExercise,
  PlanExercisePatch,
  PlanExerciseRow,
} from "../types";

const exerciseColumns = {
  id: exercises.id,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  equipment: exercises.equipment,
};

export interface PlanExerciseDetail {
  planExercise: PlanExerciseRow;
  exercise: {
    id: string;
    nameEs: string;
    nameEn: string;
    equipment: (typeof exercises.$inferSelect)["equipment"];
  };
}

export interface PlanExerciseInWeek {
  planExercise: PlanExerciseRow;
  weekday: number;
}

export async function listPlanExercisesByDay(
  planDayId: string,
): Promise<PlanExerciseDetail[]> {
  return db
    .select({ planExercise: planExercises, exercise: exerciseColumns })
    .from(planExercises)
    .innerJoin(exercises, eq(planExercises.exerciseId, exercises.id))
    .where(eq(planExercises.planDayId, planDayId))
    .orderBy(asc(planExercises.order));
}

export async function listPlanExercisesByPlan(
  planId: string,
): Promise<PlanExerciseInWeek[]> {
  return db
    .select({ planExercise: planExercises, weekday: planDays.weekday })
    .from(planExercises)
    .innerJoin(planDays, eq(planExercises.planDayId, planDays.id))
    .where(eq(planDays.planId, planId));
}

export async function findPlanExercise(
  id: string,
): Promise<PlanExerciseDetail | null> {
  const rows = await db
    .select({ planExercise: planExercises, exercise: exerciseColumns })
    .from(planExercises)
    .innerJoin(exercises, eq(planExercises.exerciseId, exercises.id))
    .where(eq(planExercises.id, id));
  return rows[0] ?? null;
}

export async function insertPlanExercise(values: NewPlanExercise): Promise<void> {
  await db.insert(planExercises).values({ id: generateId(), ...values });
}

export async function updatePlanExercise(
  id: string,
  patch: PlanExercisePatch,
): Promise<void> {
  await db.update(planExercises).set(patch).where(eq(planExercises.id, id));
}

export async function deletePlanExercise(id: string): Promise<void> {
  await db.delete(planExercises).where(eq(planExercises.id, id));
}

export async function setPlanExerciseOrders(
  orders: readonly { id: string; order: number }[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const { id, order } of orders) {
      await tx.update(planExercises).set({ order }).where(eq(planExercises.id, id));
    }
  });
}
