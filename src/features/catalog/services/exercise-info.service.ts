import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listMusclesForExercise } from "@/shared/db/queries/exercise.queries";
import { exercises } from "@/shared/db/schema";
import instructionsEs from "../data/instructions-es.json";
import type { ExerciseInfo } from "../types/exercise-info.types";
import { exerciseImageUrls, splitSteps } from "../utils/exercise-info.utils";

/** Traducciones propias de los pasos, por id de free-exercise-db. Los que faltan se muestran en inglés. */
const SPANISH_STEPS: Readonly<Record<string, readonly string[] | undefined>> = instructionsEs.steps;

const infoColumns = {
  id: exercises.id,
  sourceId: exercises.sourceId,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  equipment: exercises.equipment,
  instructionsEs: exercises.instructionsEs,
  instructionsEn: exercises.instructionsEn,
};

/** La ficha de un ejercicio: fotos, pasos y músculos con fuente; null si el ejercicio no existe. */
export async function loadExerciseInfo(exerciseId: string): Promise<ExerciseInfo | null> {
  const [[row], muscles] = await Promise.all([
    db.select(infoColumns).from(exercises).where(eq(exercises.id, exerciseId)),
    listMusclesForExercise(exerciseId),
  ]);
  if (!row) return null;
  const translated = row.sourceId ? SPANISH_STEPS[row.sourceId] : undefined;
  return {
    id: row.id,
    nameEs: row.nameEs,
    nameEn: row.nameEn,
    equipment: row.equipment,
    imageUrls: exerciseImageUrls(row.sourceId),
    stepsEs: translated ? [...translated] : splitSteps(row.instructionsEs),
    stepsEn: splitSteps(row.instructionsEn),
    muscles: muscles.map(({ muscleGroup, view, role }) => ({ group: muscleGroup, view, role })),
  };
}
