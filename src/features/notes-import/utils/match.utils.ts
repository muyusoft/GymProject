import type { MuscleCategory } from "@/shared/types/training.types";
import type {
  AliasEntry,
  ExerciseCandidate,
  LineMatch,
  ParsedLine,
} from "../types/notes-import.types";
import { nameTokens, normalizeName } from "./normalize.utils";

/** Por debajo de esto el parecido no basta ni para sugerir. */
export const CONFIRM_THRESHOLD = 0.6;

interface IndexedCandidate {
  candidate: ExerciseCandidate;
  keys: string[];
  keyTokens: string[][];
}

export type CandidateIndex = readonly IndexedCandidate[];

/** Cada candidato se indexa por todos sus nombres: español, inglés, alias y las variantes "A / B". */
export function buildCandidateIndex(candidates: readonly ExerciseCandidate[]): CandidateIndex {
  return candidates.map((candidate) => {
    const names = [candidate.nameEs, candidate.nameEn, ...candidate.aliases].flatMap((name) => name.split("/"));
    const keyTokens = names.map(nameTokens).filter((tokens) => tokens.length > 0);
    return { candidate, keys: keyTokens.map((tokens) => tokens.join(" ")), keyTokens };
  });
}

/** Coeficiente de Dice entre dos conjuntos de palabras: 1 = iguales, 0 = nada en común. */
export function similarity(a: readonly string[], b: readonly string[]): number {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size === 0 || right.size === 0) return 0;
  const common = [...left].filter((token) => right.has(token)).length;
  return (2 * common) / (left.size + right.size);
}

function findByKey(index: CandidateIndex, key: string): ExerciseCandidate | null {
  return index.find((entry) => entry.keys.includes(key))?.candidate ?? null;
}

function findAlias(
  aliases: readonly AliasEntry[],
  key: string,
  dayCategory: MuscleCategory | null,
): AliasEntry | undefined {
  const matching = aliases.filter(
    (entry) =>
      normalizeName(entry.alias) === key &&
      (entry.dayCategory === undefined || entry.dayCategory === dayCategory),
  );
  return matching.find((entry) => entry.dayCategory !== undefined) ?? matching[0];
}

function bestSimilar(index: CandidateIndex, tokens: readonly string[]): { candidate: ExerciseCandidate; score: number } | null {
  let best: { candidate: ExerciseCandidate; score: number } | null = null;
  for (const entry of index) {
    const score = Math.max(...entry.keyTokens.map((keyTokens) => similarity(tokens, keyTokens)), 0);
    if (score > (best?.score ?? 0)) best = { candidate: entry.candidate, score };
  }
  return best;
}

interface MatchOptions {
  name: string;
  index: CandidateIndex;
  aliases: readonly AliasEntry[];
  dayCategory: MuscleCategory | null;
}

/** Alias exacto, luego nombre exacto, luego parecido; con poca confianza se pide confirmar. */
export function matchExercise({ name, index, aliases, dayCategory }: MatchOptions): LineMatch {
  const key = normalizeName(name);
  const alias = findAlias(aliases, key, dayCategory);
  const target = alias ? findByKey(index, normalizeName(alias.exercise)) : null;
  if (alias && target) return { status: alias.confirm ? "confirm" : "matched", candidate: target };

  const exact = findByKey(index, key);
  if (exact) return { status: "matched", candidate: exact };

  const similar = bestSimilar(index, nameTokens(name));
  if (similar && similar.score >= CONFIRM_THRESHOLD) return { status: "confirm", candidate: similar.candidate };
  return { status: "unknown", candidate: null };
}

/** La categoría más repetida entre los ejercicios ya reconocidos con seguridad; null si no hay ninguno. */
export function dominantCategory(matches: readonly LineMatch[]): MuscleCategory | null {
  const counts = new Map<MuscleCategory, number>();
  for (const { status, candidate } of matches) {
    if (status !== "matched" || !candidate?.category) continue;
    counts.set(candidate.category, (counts.get(candidate.category) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

interface MatchDayOptions {
  lines: readonly ParsedLine[];
  index: CandidateIndex;
  aliases: readonly AliasEntry[];
}

/**
 * Dos pasadas: la primera reconoce lo seguro y da el tipo de día (p. ej. pierna); la segunda
 * aplica los alias que dependen de ese contexto ("Press inclinado" en día de pierna → prensa).
 */
export function matchDay({ lines, index, aliases }: MatchDayOptions): LineMatch[] {
  const run = (dayCategory: MuscleCategory | null) =>
    lines.map((line) => matchExercise({ name: line.name, index, aliases, dayCategory }));
  return run(dominantCategory(run(null)));
}
