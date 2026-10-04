import { getExerciseName } from "@/shared/utils/exercise-name.utils";
import { normalizeText } from "@/shared/utils/search.utils";
import type { LibraryExercise, LibraryFilters, LibraryRow } from "../types/catalog.types";

function matchesQuery(exercise: LibraryExercise, query: string): boolean {
  if (!query) return true;
  const haystack = [exercise.nameEs, exercise.nameEn, ...exercise.aliases].map(normalizeText);
  return haystack.some((text) => text.includes(query));
}

/** Busca en español e inglés sin acentos y aplica los filtros de músculo y equipo. */
export function filterLibrary(
  exercises: readonly LibraryExercise[],
  filters: LibraryFilters,
): LibraryExercise[] {
  const query = normalizeText(filters.query);
  return exercises.filter(
    (exercise) =>
      matchesQuery(exercise, query) &&
      (filters.category === null || exercise.category === filters.category) &&
      (filters.equipment === null || exercise.equipment === filters.equipment),
  );
}

/** "En tu plan" primero, luego el resto; cada grupo en orden alfabético del idioma actual. */
export function buildLibraryRows(
  exercises: readonly LibraryExercise[],
  language: string,
): LibraryRow[] {
  const byName = (a: LibraryExercise, b: LibraryExercise) =>
    getExerciseName(a, language).localeCompare(getExerciseName(b, language), language);
  const inPlan = exercises.filter((exercise) => exercise.plan !== null).sort(byName);
  const others = exercises.filter((exercise) => exercise.plan === null).sort(byName);

  return [
    ...(inPlan.length > 0 ? [{ kind: "section", key: "inPlan" } as const] : []),
    ...inPlan.map((exercise) => ({ kind: "exercise", exercise }) as const),
    ...(others.length > 0 ? [{ kind: "section", key: "more" } as const] : []),
    ...others.map((exercise) => ({ kind: "exercise", exercise }) as const),
  ];
}
