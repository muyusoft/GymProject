import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { planExercises } from "@/shared/db/schema";
import {
  findCatalogExercise,
  findLastSwapSeed,
} from "@/shared/services/substitute-context.service";
import { buildSwapSeed } from "@/shared/utils/swap-seed.utils";

interface ReplaceOptions {
  planExerciseId: string;
  substituteId: string;
}

/**
 * Cambia el ejercicio de ese lugar del plan. Conserva series, reps, descanso, orden y regla de progresión;
 * el peso sale del último registro del nuevo ejercicio (sin historial queda vacío), igual que en el entreno.
 * Las sustituciones de "solo hoy" ya guardadas para una fecha no se tocan.
 */
export async function replacePlanExercise({ planExerciseId, substituteId }: ReplaceOptions): Promise<void> {
  const [[planExercise], substitute, lastSet] = await Promise.all([
    db.select().from(planExercises).where(eq(planExercises.id, planExerciseId)),
    findCatalogExercise(substituteId),
    findLastSwapSeed(substituteId),
  ]);
  if (!planExercise || !substitute) throw new Error("Plan substitute target not found");
  const seed = buildSwapSeed({ planExercise, substitute, lastSet });
  await db
    .update(planExercises)
    .set({ exerciseId: substituteId, ...seed })
    .where(eq(planExercises.id, planExerciseId));
}
