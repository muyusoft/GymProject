/** Forma de los JSON del catálogo; los textos se validan al construir las filas. */
export interface FreeExerciseRecord {
  id: string;
  name: string;
  equipment: string | null;
  instructions: string[];
}

export interface MuscleEntryRecord {
  group: string;
  role: string;
  basis: string;
  view: string;
}

export interface MusclesOverrideRecord {
  replace?: MuscleEntryRecord[];
  add?: MuscleEntryRecord[];
  source?: string;
}

export interface CommonExerciseRecord {
  nameEs: string;
  freeExerciseDbName: string | null;
  pattern: string;
  musclesOverride?: MusclesOverrideRecord;
}

export interface PatternRecord {
  muscles: MuscleEntryRecord[];
  sources: string[];
}

export interface SourceRecord {
  citation: string;
  url: string;
  strength: string;
}

export interface SeedInput {
  freeExercises: FreeExerciseRecord[];
  commonExercises: CommonExerciseRecord[];
  patterns: Record<string, PatternRecord>;
  sources: Record<string, SourceRecord>;
}
