import type { EquipmentRequirements, GymEquipment } from "@/shared/types/equipment.types";
import type {
  Equipment,
  SessionMinutes,
  LoadType,
  MuscleGroup,
  MuscleRole,
} from "@/shared/types/training.types";

export const PLAN_GOALS = ["muscle", "strength", "fat_loss", "fitness"] as const;
export type PlanGoal = (typeof PLAN_GOALS)[number];

export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const PLAN_FOCUSES = ["balanced", "lower", "upper"] as const;
export type PlanFocus = (typeof PLAN_FOCUSES)[number];

export const TRAINING_DAY_COUNTS = [2, 3, 4, 5, 6] as const;
export type TrainingDayCount = (typeof TRAINING_DAY_COUNTS)[number];

export { SESSION_MINUTES, type SessionMinutes } from "@/shared/types/training.types";

/** Las respuestas del cuestionario "Crear un plan para mí". */
export interface PlanAnswers {
  goal: PlanGoal;
  days: TrainingDayCount;
  experience: ExperienceLevel;
  focus: PlanFocus;
  /** Tiempo por sesión: el generador llena o recorta cada día hasta acercarse a él. */
  minutes: SessionMinutes;
  /** El equipo disponible; vacío = sin equipo (solo peso corporal). */
  equipment: readonly GymEquipment[];
}

export const DAY_TEMPLATES = [
  "fullA",
  "fullB",
  "fullC",
  "upperA",
  "upperB",
  "lowerA",
  "lowerB",
  "push",
  "pull",
] as const;
export type DayTemplate = (typeof DAY_TEMPLATES)[number];

/** Un ejercicio del catálogo que el generador puede usar: con patrón y músculos con fuente. */
export interface CatalogExercise {
  id: string;
  nameEs: string;
  nameEn: string;
  pattern: string;
  equipment: Equipment;
  loadType: LoadType;
  muscles: readonly { group: MuscleGroup; role: MuscleRole }[];
  /** Qué equipo necesita (ver equipment.types); null = sin dato, no se usa. */
  requires: EquipmentRequirements;
}

export interface GeneratedExercise {
  exerciseId: string;
  pattern: string;
  isCompound: boolean;
  sets: number;
  /** Tope del rango; null en ejercicios por tiempo. */
  reps: number | null;
  /** Mínimo del rango (progresión doble); null en ejercicios por tiempo. */
  repsMin: number | null;
  seconds: number | null;
  restSec: number;
  loadType: LoadType;
}

export interface GeneratedDay {
  /** 0 = lunes … 6 = domingo. */
  weekday: number;
  template: DayTemplate;
  exercises: GeneratedExercise[];
}

export interface GeneratedPlan {
  days: GeneratedDay[];
  /** Algún día quedó por debajo del tiempo pedido porque más volumen pasaría el tope semanal por músculo. */
  isShortOfTime: boolean;
  /** Patrones que el equipo no permite: se cubrieron con otro patrón de los mismos músculos o se omitieron. */
  missingPatterns: string[];
}
