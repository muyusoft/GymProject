import { eq } from "drizzle-orm";
import { transact } from "@/shared/db/client";
import { findActivePlan } from "@/shared/db/queries/plan.queries";
import { listPlanExercisesByPlan } from "@/shared/db/queries/plan-exercise.queries";
import { planExercises } from "@/shared/db/schema";
import type { PlanExerciseRow } from "@/shared/db/types";
import {
  canOfferRepRange,
  withProposedRange,
} from "../utils/rep-range-offer.utils";

/** Ejercicios del plan activo con peso y reps fijas: a los que se les propone un rango. */
export async function listFixedRepExercises(): Promise<PlanExerciseRow[]> {
  const plan = await findActivePlan();
  if (!plan) return [];
  const inWeek = await listPlanExercisesByPlan(plan.id);
  return inWeek
    .map((entry) => entry.planExercise)
    .filter(canOfferRepRange);
}

/** Pasa cada ejercicio a rango: el tope son sus reps actuales y el mínimo, ⅔ del tope. */
export async function applyRepRanges(
  rows: readonly PlanExerciseRow[],
): Promise<void> {
  // Transacción síncrona (expo-sqlite): sin await adentro, cada sentencia con .run().
  await transact((tx) => {
    for (const row of rows) {
      if (row.reps === null) continue;
      tx.update(planExercises)
        .set({ progressionRule: withProposedRange(row.progressionRule, row.reps) })
        .where(eq(planExercises.id, row.id))
        .run();
    }
  });
}
