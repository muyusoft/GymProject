import { and, eq } from "drizzle-orm";
import { db, type Transaction } from "@/shared/db/client";
import {
  clearDeletion,
  recordDeletions,
} from "@/shared/db/queries/deletion.queries";
import { exerciseSwaps, planExercises, setLogs } from "@/shared/db/schema";
import type { PlanExerciseRow } from "@/shared/db/types";
import {
  findCatalogExercise,
  findLastSwapSeed,
} from "@/shared/services/substitute-context.service";
import { generateId } from "@/shared/utils/id.utils";
import { swapId } from "@/shared/utils/stable-id.utils";
import { buildSwapSeed, type SwapSeed } from "@/shared/utils/swap-seed.utils";
import type { SubstituteScope } from "../types/workout.types";
import { planSubstituteSets } from "../utils/swap.utils";

interface ReplaceSetsOptions {
  sessionId: string;
  currentExerciseId: string;
  substituteId: string;
  planExercise: Pick<PlanExerciseRow, "sets" | "reps" | "seconds">;
  seed: SwapSeed;
}

/** Borra las series pendientes del ejercicio anterior y crea las del sustituto; las hechas no se tocan. */
function replaceSessionSets(
  tx: Transaction,
  options: ReplaceSetsOptions,
): void {
  const { sessionId, currentExerciseId, substituteId, planExercise, seed } =
    options;
  const logs = tx
    .select()
    .from(setLogs)
    .where(eq(setLogs.sessionId, sessionId))
    .all();
  const current = logs.filter((log) => log.exerciseId === currentExerciseId);
  const existingIndexes = logs
    .filter((log) => log.exerciseId === substituteId)
    .map((log) => log.setIndex);
  const doneSets = current.filter((log) => log.completed).length;
  const { count, startIndex } = planSubstituteSets({
    planSets: planExercise.sets,
    doneSets,
    existingIndexes,
  });
  const pending = current.filter((item) => !item.completed);
  recordDeletions(
    tx,
    "set_logs",
    pending.map((log) => log.id),
  );
  for (const log of pending)
    tx.delete(setLogs).where(eq(setLogs.id, log.id)).run();
  const { targetWeight: weight, unit, loadType } = seed;
  const { reps, seconds } = planExercise;
  for (let offset = 0; offset < count; offset += 1) {
    const values = {
      id: generateId(),
      sessionId,
      exerciseId: substituteId,
      setIndex: startIndex + offset,
    };
    tx.insert(setLogs)
      .values({
        ...values,
        weight,
        unit,
        loadType,
        reps,
        seconds,
        completed: false,
        isPR: false,
      })
      .run();
  }
}

export interface SubstituteOptions {
  planExerciseId: string;
  /** El ejercicio que hoy ocupa ese lugar (el del plan o un sustituto anterior). */
  currentExerciseId: string;
  substituteId: string;
  date: string;
  /** La sesión abierta de hoy, si ya se inició: se reemplazan sus series pendientes. */
  sessionId: string | null;
  scope: SubstituteScope;
}

/**
 * Cambia el ejercicio de ese lugar: solo en esa fecha ("today") o también en el plan ("plan").
 * En la sesión abierta, las series hechas del ejercicio anterior se conservan en su historial
 * y las pendientes se reemplazan por series del sustituto.
 */
export async function substituteExercise(
  options: SubstituteOptions,
): Promise<void> {
  const {
    planExerciseId,
    currentExerciseId,
    substituteId,
    date,
    sessionId,
    scope,
  } = options;
  const [[planExercise], substitute, lastSet] = await Promise.all([
    db.select().from(planExercises).where(eq(planExercises.id, planExerciseId)),
    findCatalogExercise(substituteId),
    findLastSwapSeed(substituteId),
  ]);
  if (!planExercise || !substitute)
    throw new Error("Substitute target not found");
  const seed = buildSwapSeed({ planExercise, substitute, lastSet });
  const slot = and(
    eq(exerciseSwaps.date, date),
    eq(exerciseSwaps.planExerciseId, planExerciseId),
  );

  // Transacción síncrona (expo-sqlite): sin await adentro, cada sentencia con .run()/.all().
  db.transaction((tx) => {
    const swap = swapId(date, planExerciseId);
    recordDeletions(tx, "exercise_swaps", [swap]);
    tx.delete(exerciseSwaps).where(slot).run();
    if (scope === "plan") {
      tx.update(planExercises)
        .set({ exerciseId: substituteId, ...seed })
        .where(eq(planExercises.id, planExerciseId))
        .run();
    } else if (substituteId !== planExercise.exerciseId) {
      clearDeletion(tx, "exercise_swaps", swap);
      tx.insert(exerciseSwaps)
        .values({
          id: swap,
          date,
          planExerciseId,
          exerciseId: substituteId,
          ...seed,
        })
        .run();
    }
    if (!sessionId || substituteId === currentExerciseId) return;
    replaceSessionSets(tx, {
      sessionId,
      currentExerciseId,
      substituteId,
      planExercise,
      seed,
    });
  });
}
