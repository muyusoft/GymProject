import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { findActivePlan } from "@/shared/db/queries/plan.queries";
import { planDays, planExercises } from "@/shared/db/schema";

export const PLAN_REPS_SCOPES = ["day", "all"] as const;
export type PlanRepsScope = (typeof PLAN_REPS_SCOPES)[number];

interface PlanRepsUpdate {
  planExerciseId: string;
  exerciseId: string;
  reps: number;
  /** "day": solo este lugar del plan; "all": todos los días del plan con este ejercicio. */
  scope: PlanRepsScope;
}

/** Cambia el objetivo de reps del plan desde el entreno. El peso no se toca: ya sale del último registro. */
export async function updatePlanReps({
  planExerciseId,
  exerciseId,
  reps,
  scope,
}: PlanRepsUpdate): Promise<void> {
  if (scope === "day") {
    await db.update(planExercises).set({ reps }).where(eq(planExercises.id, planExerciseId));
    return;
  }
  const plan = await findActivePlan();
  if (!plan) return;
  const dayIds = db.select({ id: planDays.id }).from(planDays).where(eq(planDays.planId, plan.id));
  await db
    .update(planExercises)
    .set({ reps })
    .where(and(eq(planExercises.exerciseId, exerciseId), inArray(planExercises.planDayId, dayIds)));
}
