import type { Equipment, MuscleGroup, MuscleRole, MuscleView } from "@/shared/types/training.types";

export interface InfoMuscle {
  group: MuscleGroup;
  view: MuscleView;
  role: MuscleRole;
}

export interface ExerciseSteps {
  steps: string[];
  /** Se pidió español pero solo hay texto en inglés: la ficha lo avisa. */
  isUntranslated: boolean;
}

export interface ExerciseInfo {
  id: string;
  nameEs: string;
  nameEn: string;
  equipment: Equipment;
  /** Posición inicial y final; vacío si el ejercicio no viene del catálogo abierto. */
  imageUrls: string[];
  /** Pasos en español (traducción propia) y en inglés (free-exercise-db). */
  stepsEs: string[];
  stepsEn: string[];
  muscles: InfoMuscle[];
}
