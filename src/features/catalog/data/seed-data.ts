import type { SeedInput } from "@/shared/db/seed/seed.types";
import commonExercises from "./common-exercises.json";
import freeExerciseDb from "./free-exercise-db.json";
import muscleMap from "./muscle-map.json";

/** Entrada del seed: catálogo abierto + ejercicios comunes + mapeo de músculos con fuentes. */
export const catalogSeedData: SeedInput = {
  freeExercises: freeExerciseDb,
  commonExercises: commonExercises.exercises,
  patterns: muscleMap.patterns,
  sources: muscleMap.sources,
};
