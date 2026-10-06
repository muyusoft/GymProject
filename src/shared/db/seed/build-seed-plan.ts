import { SOURCE_STRENGTHS } from "@/shared/types/training.types";
import { generateId } from "@/shared/utils/id.utils";
import { parseOneOf } from "@/shared/utils/guard.utils";
import {
  catalogExerciseId,
  commonExerciseId,
  incrementId,
} from "@/shared/utils/stable-id.utils";
import type { equipmentIncrements } from "../schema/settings";
import type { exerciseMuscles, exercises, sources } from "../schema/catalog";
import { DEFAULT_INCREMENTS } from "./defaults";
import {
  bestStrength,
  defaultLoadTypeFor,
  mapEquipment,
} from "./exercise-rows";
import { resolveMuscles, resolveSourceIds } from "./muscle-rows";
import type {
  CommonExerciseRecord,
  FreeExerciseRecord,
  SeedInput,
} from "./seed.types";

type SourceInsert = typeof sources.$inferInsert;
type ExerciseInsert = typeof exercises.$inferInsert;
type MuscleInsert = typeof exerciseMuscles.$inferInsert;
type IncrementInsert = typeof equipmentIncrements.$inferInsert;

export interface SeedPlan {
  sources: SourceInsert[];
  exercises: ExerciseInsert[];
  muscles: MuscleInsert[];
  increments: IncrementInsert[];
}

interface CatalogEntry {
  free: FreeExerciseRecord | null;
  common: CommonExerciseRecord | null;
}

const YEAR_AT_END = /(\d{4})$/;

function buildSourceRows(input: SeedInput): SourceInsert[] {
  return Object.entries(input.sources).map(([id, source]) => ({
    id,
    citation: source.citation,
    url: source.url,
    year: Number(YEAR_AT_END.exec(id)?.[1]) || null,
    strength: parseOneOf(SOURCE_STRENGTHS, source.strength, "source strength"),
  }));
}

function collectEntries(input: SeedInput): CatalogEntry[] {
  const commonByFreeName = new Map(
    input.commonExercises.flatMap((common) =>
      common.freeExerciseDbName
        ? [[common.freeExerciseDbName, common] as const]
        : [],
    ),
  );
  const fromFree = input.freeExercises.map((free) => ({
    free,
    common: commonByFreeName.get(free.name) ?? null,
  }));
  const customCommon = input.commonExercises
    .filter((common) => common.freeExerciseDbName === null)
    .map((common) => ({ free: null, common }));
  return [...fromFree, ...customCommon];
}

interface EntryContext {
  input: SeedInput;
  strengthById: ReadonlyMap<string, string>;
  createId: () => string;
}

function buildEntryRows(
  entry: CatalogEntry,
  { input, strengthById, createId }: EntryContext,
): { exercise: ExerciseInsert; muscles: MuscleInsert[] } {
  const { free, common } = entry;
  // Id estable: el mismo ejercicio se llama igual en todas las instalaciones (ver stable-id.utils).
  const id = free
    ? catalogExerciseId(free.id)
    : commonExerciseId(common?.nameEs ?? "");
  const pattern = common ? input.patterns[common.pattern] : undefined;
  if (common && !pattern) throw new Error(`Unknown pattern: ${common.pattern}`);

  const entries =
    common && pattern ? resolveMuscles(pattern, common.musclesOverride) : [];
  const sourceIds =
    common && pattern ? resolveSourceIds(pattern, common.musclesOverride) : [];
  const equipment = mapEquipment(free?.equipment ?? null);

  return {
    exercise: {
      id,
      sourceId: free?.id ?? null,
      nameEs: common?.nameEs ?? free?.name ?? "",
      nameEn: free?.name ?? common?.nameEs ?? "",
      instructionsEn: free ? free.instructions.join("\n") : null,
      pattern: common?.pattern ?? null,
      equipment,
      defaultLoadType: defaultLoadTypeFor(equipment),
      evidenceLevel: bestStrength(sourceIds, strengthById),
      status: entries.length > 0 ? "sourced" : "claude_draft",
    },
    muscles: entries.map((muscle) => ({
      id: createId(),
      exerciseId: id,
      muscleGroup: muscle.group,
      view: muscle.view,
      role: muscle.role,
      basis: muscle.basis,
      sourceIds: JSON.stringify(sourceIds),
    })),
  };
}

/** Todo lo que el seed inserta, calculado sin tocar la base (por eso se puede probar). */
export function buildSeedPlan(
  input: SeedInput,
  createId: () => string = generateId,
): SeedPlan {
  const strengthById = new Map(
    Object.entries(input.sources).map(([id, source]) => [id, source.strength]),
  );
  const rows = collectEntries(input).map((entry) =>
    buildEntryRows(entry, { input, strengthById, createId }),
  );
  return {
    sources: buildSourceRows(input),
    exercises: rows.map((row) => row.exercise),
    muscles: rows.flatMap((row) => row.muscles),
    increments: DEFAULT_INCREMENTS.map((increment) => ({
      id: incrementId(increment.equipment, increment.unit),
      ...increment,
    })),
  };
}
