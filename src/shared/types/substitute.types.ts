import type { Equipment } from "./training.types";

export const SUBSTITUTE_REASONS = ["pattern", "muscle"] as const;
export type SubstituteReason = (typeof SUBSTITUTE_REASONS)[number];

export interface SubstituteCandidate {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  equipment: Equipment;
  /** null cuando solo aparece por búsqueda de nombre. */
  reason: SubstituteReason | null;
  hasHistory: boolean;
}

/** El ejercicio que se quiere cambiar, tal como lo necesita la hoja de sustitutos. */
export interface SubstituteSubject {
  /** Identifica el lugar que se cambia; al cambiar, la hoja arranca de cero. */
  key: string;
  /** El ejercicio del que salen las sugerencias (el del plan, aunque hoy esté sustituido). */
  originalExerciseId: string;
  /** El nombre del ejercicio que hoy ocupa ese lugar, para el título. */
  nameEs: string;
  nameEn: string;
}
