import { listExercises, listPrimaryMuscles } from "@/shared/db/queries/exercise.queries";
import type { MuscleGroup } from "@/shared/types/training.types";
import { categoryOf } from "@/shared/utils/muscle-category.utils";
import type { ExerciseCandidate } from "../types/notes-import.types";

function parseAliases(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Todo el catálogo como candidatos de vinculación, con la categoría de su primer músculo principal. */
export async function loadCandidates(): Promise<ExerciseCandidate[]> {
  const [exercises, muscles] = await Promise.all([listExercises(), listPrimaryMuscles()]);
  const firstGroup = new Map<string, MuscleGroup>();
  for (const muscle of muscles) {
    if (!firstGroup.has(muscle.exerciseId)) firstGroup.set(muscle.exerciseId, muscle.muscleGroup);
  }
  return exercises.map((exercise) => {
    const group = firstGroup.get(exercise.id);
    return {
      id: exercise.id,
      nameEs: exercise.nameEs,
      nameEn: exercise.nameEn,
      aliases: parseAliases(exercise.aliases),
      category: group ? categoryOf([{ group }]) : null,
    };
  });
}
