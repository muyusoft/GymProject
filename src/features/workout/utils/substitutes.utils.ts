import type { Equipment, LoadType, MuscleGroup } from "@/shared/types/training.types";
import { normalizeText } from "@/shared/utils/search.utils";
import type { SubstituteCandidate, SubstituteReason } from "../types/workout.types";

export const SUGGESTION_LIMIT = 8;
export const SEARCH_LIMIT = 20;
const TIME_LOAD: LoadType = "time";

export interface CatalogExercise {
  id: string;
  nameEs: string;
  nameEn: string;
  pattern: string | null;
  equipment: Equipment;
  defaultLoadType: LoadType;
}

export interface SubstituteContext {
  original: CatalogExercise;
  catalog: readonly CatalogExercise[];
  /** Grupos principales por ejercicio, solo los que tienen fuente (`exercise_muscles`). */
  primaryMuscles: ReadonlyMap<string, readonly MuscleGroup[]>;
  /** Ejercicios que la persona ya registró alguna vez. */
  usedIds: ReadonlySet<string>;
  /** Los que ya están en el entreno de hoy: no se ofrecen para no repetirlos. */
  excludedIds: ReadonlySet<string>;
}

interface Ranked extends SubstituteCandidate {
  overlap: number;
}

function sharedMuscles(a: readonly MuscleGroup[], b: readonly MuscleGroup[]): number {
  return a.filter((group) => b.includes(group)).length;
}

function reasonFor(candidate: CatalogExercise, original: CatalogExercise, overlap: number): SubstituteReason | null {
  if (original.pattern !== null && candidate.pattern === original.pattern) return "pattern";
  return overlap > 0 ? "muscle" : null;
}

function toCandidate(exercise: CatalogExercise, context: SubstituteContext, overlap: number): Ranked {
  return {
    exerciseId: exercise.id,
    nameEs: exercise.nameEs,
    nameEn: exercise.nameEn,
    equipment: exercise.equipment,
    reason: reasonFor(exercise, context.original, overlap),
    hasHistory: context.usedIds.has(exercise.id),
    overlap,
  };
}

/** Un ejercicio por tiempo solo se cambia por otro por tiempo, y uno de repeticiones por otro de repeticiones. */
function isComparable(candidate: CatalogExercise, { original, excludedIds }: SubstituteContext): boolean {
  if (candidate.id === original.id || excludedIds.has(candidate.id)) return false;
  return (candidate.defaultLoadType === TIME_LOAD) === (original.defaultLoadType === TIME_LOAD);
}

function byRelevance(a: Ranked, b: Ranked): number {
  const tier = Number(b.reason === "pattern") - Number(a.reason === "pattern");
  if (tier !== 0) return tier;
  const history = Number(b.hasHistory) - Number(a.hasHistory);
  if (history !== 0) return history;
  return b.overlap - a.overlap || a.nameEs.localeCompare(b.nameEs);
}

/**
 * Alternativas ordenadas: primero el mismo patrón de movimiento, luego los que comparten músculo principal;
 * dentro de cada grupo, antes los que ya hiciste. Sin patrón ni músculos con fuente, no se sugiere.
 */
export function rankSubstitutes(context: SubstituteContext): SubstituteCandidate[] {
  const originalMuscles = context.primaryMuscles.get(context.original.id) ?? [];
  return context.catalog
    .filter((exercise) => isComparable(exercise, context))
    .map((exercise) => toCandidate(exercise, context, sharedMuscles(originalMuscles, context.primaryMuscles.get(exercise.id) ?? [])))
    .filter((candidate) => candidate.reason !== null)
    .sort(byRelevance)
    .map(({ overlap: _overlap, ...candidate }) => candidate);
}

/** Búsqueda libre por nombre en todo el catálogo comparable, para cuando ninguna sugerencia sirve. */
export function searchSubstitutes(context: SubstituteContext, query: string): SubstituteCandidate[] {
  const needle = normalizeText(query);
  if (needle === "") return [];
  return context.catalog
    .filter((exercise) => isComparable(exercise, context))
    .filter((exercise) => normalizeText(exercise.nameEs).includes(needle) || normalizeText(exercise.nameEn).includes(needle))
    .slice(0, SEARCH_LIMIT)
    .map(({ id, nameEs, nameEn, equipment }) => ({ exerciseId: id, nameEs, nameEn, equipment, reason: null, hasHistory: context.usedIds.has(id) }));
}

/** Equipos presentes en las sugerencias, en orden de aparición, para los filtros. */
export function equipmentOptions(candidates: readonly SubstituteCandidate[]): Equipment[] {
  return [...new Set(candidates.map((candidate) => candidate.equipment))];
}

export function visibleSuggestions(candidates: readonly SubstituteCandidate[], equipment: Equipment | null): SubstituteCandidate[] {
  return candidates.filter((candidate) => equipment === null || candidate.equipment === equipment).slice(0, SUGGESTION_LIMIT);
}
