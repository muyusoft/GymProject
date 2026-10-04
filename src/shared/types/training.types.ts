export const WEIGHT_UNITS = ["lb", "kg"] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export const UNIT_PREFERENCES = ["lb", "kg", "per_exercise"] as const;
export type UnitPreference = (typeof UNIT_PREFERENCES)[number];

export const LOAD_TYPES = [
  "per_arm",
  "total",
  "plates",
  "bodyweight",
  "time",
] as const;
export type LoadType = (typeof LOAD_TYPES)[number];

export const MUSCLE_GROUPS = [
  "chest",
  "deltoids",
  "triceps",
  "biceps",
  "forearm",
  "upper-back",
  "trapezius",
  "lower-back",
  "abs",
  "obliques",
  "gluteal",
  "quadriceps",
  "hamstring",
  "adductors",
  "calves",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_VIEWS = ["front", "back", "both"] as const;
export type MuscleView = (typeof MUSCLE_VIEWS)[number];

export const MUSCLE_ROLES = ["primary", "secondary"] as const;
export type MuscleRole = (typeof MUSCLE_ROLES)[number];

export const MUSCLE_BASES = ["measured", "described"] as const;
export type MuscleBasis = (typeof MUSCLE_BASES)[number];

export const EXERCISE_STATUSES = ["claude_draft", "sourced", "reviewed"] as const;
export type ExerciseStatus = (typeof EXERCISE_STATUSES)[number];

export const SOURCE_STRENGTHS = ["strong", "medium", "weak"] as const;
export type SourceStrength = (typeof SOURCE_STRENGTHS)[number];

export const EQUIPMENTS = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENTS)[number];

/** Grupos de equipo que tienen su propio salto de peso (Ajustes). */
export const INCREMENT_EQUIPMENTS = ["dumbbell", "machine", "plates"] as const;
export type IncrementEquipment = (typeof INCREMENT_EQUIPMENTS)[number];

export const SESSION_ORIGINS = ["app", "import"] as const;
export type SessionOrigin = (typeof SESSION_ORIGINS)[number];

export const MUSCLE_CATEGORIES = ["shoulder", "back", "chest", "legs", "arms", "core"] as const;
export type MuscleCategory = (typeof MUSCLE_CATEGORIES)[number];
