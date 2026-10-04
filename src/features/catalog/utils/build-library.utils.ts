import type {
  ExerciseSummary,
} from "@/shared/db/queries/exercise.queries";
import type { PlanExerciseInWeek } from "@/shared/db/queries/plan-exercise.queries";
import type { ExerciseMuscleRow } from "@/shared/db/types";
import type { LibraryExercise, PlanUsage, PrimaryMuscle } from "../types/catalog.types";
import { categoryOf } from "@/shared/utils/muscle-category.utils";

interface BuildLibraryInput {
  exercises: readonly ExerciseSummary[];
  primaryMuscles: readonly ExerciseMuscleRow[];
  inPlan: readonly PlanExerciseInWeek[];
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function parseAliases(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function toPlanUsage(entries: readonly PlanExerciseInWeek[] | undefined): PlanUsage | null {
  if (!entries || entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => a.weekday - b.weekday);
  const first = sorted[0]?.planExercise;
  if (!first) return null;
  return {
    weekdays: [...new Set(sorted.map((entry) => entry.weekday))],
    targetWeight: first.targetWeight,
    unit: first.unit,
  };
}

/** Une el catálogo con sus músculos principales y con dónde está cada ejercicio en el plan. */
export function buildLibrary({
  exercises,
  primaryMuscles,
  inPlan,
}: BuildLibraryInput): LibraryExercise[] {
  const musclesByExercise = groupBy(primaryMuscles, (row) => row.exerciseId);
  const planByExercise = groupBy(inPlan, (entry) => entry.planExercise.exerciseId);

  return exercises.map((exercise) => {
    const primary: PrimaryMuscle[] = (musclesByExercise.get(exercise.id) ?? []).map((row) => ({
      group: row.muscleGroup,
      view: row.view,
    }));
    return {
      id: exercise.id,
      nameEs: exercise.nameEs,
      nameEn: exercise.nameEn,
      aliases: parseAliases(exercise.aliases),
      equipment: exercise.equipment,
      defaultLoadType: exercise.defaultLoadType,
      primary,
      category: categoryOf(primary),
      plan: toPlanUsage(planByExercise.get(exercise.id)),
    };
  });
}
