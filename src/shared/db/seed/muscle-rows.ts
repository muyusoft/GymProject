import {
  MUSCLE_BASES,
  MUSCLE_GROUPS,
  MUSCLE_ROLES,
  MUSCLE_VIEWS,
  type MuscleBasis,
  type MuscleGroup,
  type MuscleRole,
  type MuscleView,
} from "@/shared/types/training.types";
import { parseOneOf } from "@/shared/utils/guard.utils";
import type {
  MuscleEntryRecord,
  MusclesOverrideRecord,
  PatternRecord,
} from "./seed.types";

export interface MuscleEntry {
  group: MuscleGroup;
  role: MuscleRole;
  basis: MuscleBasis;
  view: MuscleView;
}

export function parseMuscleEntry(entry: MuscleEntryRecord): MuscleEntry {
  return {
    group: parseOneOf(MUSCLE_GROUPS, entry.group, "muscle group"),
    role: parseOneOf(MUSCLE_ROLES, entry.role, "muscle role"),
    basis: parseOneOf(MUSCLE_BASES, entry.basis, "muscle basis"),
    view: parseOneOf(MUSCLE_VIEWS, entry.view, "muscle view"),
  };
}

/**
 * Músculos de un ejercicio: solo los del patrón de muscle-map.json,
 * ajustados por la excepción del ejercicio. Sin patrón no hay músculos.
 */
export function resolveMuscles(
  pattern: PatternRecord,
  override?: MusclesOverrideRecord,
): MuscleEntry[] {
  if (override?.replace) return override.replace.map(parseMuscleEntry);
  const base = pattern.muscles.map(parseMuscleEntry);
  if (!override?.add) return base;
  const added = override.add.map(parseMuscleEntry);
  const kept = base.filter((entry) => !added.some((a) => a.group === entry.group));
  return [...kept, ...added];
}

export function resolveSourceIds(
  pattern: PatternRecord,
  override?: MusclesOverrideRecord,
): string[] {
  return override?.source
    ? [...pattern.sources, override.source]
    : [...pattern.sources];
}
