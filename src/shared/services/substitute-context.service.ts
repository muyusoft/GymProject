import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listPrimaryMuscles } from "@/shared/db/queries/exercise.queries";
import { exercises, sessions, setLogs } from "@/shared/db/schema";
import type { MuscleGroup } from "@/shared/types/training.types";
import type { CatalogExercise, SubstituteContext } from "@/shared/utils/substitutes.utils";
import type { SwapSeed } from "@/shared/utils/swap-seed.utils";

const catalogColumns = {
  id: exercises.id,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  pattern: exercises.pattern,
  equipment: exercises.equipment,
  defaultLoadType: exercises.defaultLoadType,
};

function groupPrimaryMuscles(
  rows: readonly { exerciseId: string; muscleGroup: MuscleGroup }[],
): Map<string, MuscleGroup[]> {
  const byExercise = new Map<string, MuscleGroup[]>();
  for (const row of rows)
    byExercise.set(row.exerciseId, [
      ...(byExercise.get(row.exerciseId) ?? []),
      row.muscleGroup,
    ]);
  return byExercise;
}

/** Todo lo que hace falta para sugerir sustitutos de un ejercicio; null si el ejercicio ya no existe. */
export async function loadSubstituteContext(
  originalExerciseId: string,
  excludedIds: readonly string[],
): Promise<SubstituteContext | null> {
  const [catalog, muscles, used] = await Promise.all([
    db.select(catalogColumns).from(exercises),
    listPrimaryMuscles(),
    db
      .selectDistinct({ exerciseId: setLogs.exerciseId })
      .from(setLogs)
      .where(eq(setLogs.completed, true)),
  ]);
  const original = catalog.find(
    (exercise: CatalogExercise) => exercise.id === originalExerciseId,
  );
  if (!original) return null;
  return {
    original,
    catalog,
    primaryMuscles: groupPrimaryMuscles(muscles),
    usedIds: new Set(used.map((row) => row.exerciseId)),
    excludedIds: new Set(excludedIds),
  };
}

export async function findCatalogExercise(
  exerciseId: string,
): Promise<CatalogExercise | null> {
  const [row] = await db
    .select(catalogColumns)
    .from(exercises)
    .where(eq(exercises.id, exerciseId));
  return row ?? null;
}

/** La última serie con peso que se registró del ejercicio: de ahí arranca como sustituto. */
export async function findLastSwapSeed(
  exerciseId: string,
): Promise<SwapSeed | null> {
  const [row] = await db
    .select({
      targetWeight: setLogs.weight,
      unit: setLogs.unit,
      loadType: setLogs.loadType,
    })
    .from(setLogs)
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .where(
      and(
        eq(setLogs.exerciseId, exerciseId),
        eq(setLogs.completed, true),
        isNotNull(setLogs.weight),
      ),
    )
    .orderBy(desc(sessions.startedAt), desc(setLogs.setIndex))
    .limit(1);
  return row ?? null;
}
