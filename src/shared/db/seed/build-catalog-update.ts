import { buildSeedPlan, type SeedPlan } from "./build-seed-plan";
import type { SeedInput } from "./seed.types";

type CatalogUpdate = Pick<SeedPlan, "exercises" | "muscles">;

/**
 * Lo que la actualización del catálogo vuelve a escribir en una instalación existente: los ejercicios
 * comunes (los que tienen patrón) y sus músculos. Los demás ejercicios del catálogo abierto no cambian.
 */
export function buildCatalogUpdate(input: SeedInput, createId?: () => string): CatalogUpdate {
  const plan = buildSeedPlan(input, createId);
  const exercises = plan.exercises.filter((exercise) => exercise.pattern !== null);
  const ids = new Set(exercises.map((exercise) => exercise.id));
  return {
    exercises,
    muscles: plan.muscles.filter((muscle) => ids.has(muscle.exerciseId)),
  };
}
