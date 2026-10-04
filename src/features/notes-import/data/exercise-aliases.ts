import { MUSCLE_CATEGORIES } from "@/shared/types/training.types";
import { parseOneOf } from "@/shared/utils/guard.utils";
import type { AliasEntry } from "../types/notes-import.types";
import aliasData from "./exercise-aliases.json";

/** Los alias del JSON, validados: un `dayCategory` inexistente falla al cargar y no en silencio al importar. */
export const EXERCISE_ALIASES: readonly AliasEntry[] = aliasData.aliases.map((entry) => ({
  alias: entry.alias,
  exercise: entry.exercise,
  ...("confirm" in entry && { confirm: entry.confirm }),
  ...("dayCategory" in entry && {
    dayCategory: parseOneOf(MUSCLE_CATEGORIES, entry.dayCategory, "alias dayCategory"),
  }),
}));
