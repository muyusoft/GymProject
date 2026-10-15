import type { MuscleGroup } from "@/shared/types/training.types";

export const BODY_REGIONS = ["general", "lower", "upper"] as const;
export type BodyRegion = (typeof BODY_REGIONS)[number];

export const MOVEMENT_KINDS = ["warmup", "stretch"] as const;
export type MovementKind = (typeof MOVEMENT_KINDS)[number];

/** Cómo se dosifica: repeticiones, pasos o segundos; "perSide" duplica por lado. */
export interface MovementDose {
  amount: number;
  unit: "reps" | "steps" | "seconds";
  isPerSide: boolean;
}

export const MOVEMENT_SOURCES = ["fradkin2010", "behm2016", "herbert2011", "garber2011"] as const;
export type MovementSource = (typeof MOVEMENT_SOURCES)[number];

/**
 * Un movimiento de calentamiento o estiramiento. Los textos (nombre, para qué sirve, pasos, consejo)
 * viven en las traducciones bajo `movement.<id>`; aquí solo los datos para elegirlo.
 */
export interface Movement {
  id: string;
  kind: MovementKind;
  region: BodyRegion;
  /** Músculos a los que apunta, solo para elegirlo según el día; no se pintan en la figura. */
  targets: readonly MuscleGroup[];
  needsBand: boolean;
  dose: MovementDose;
  stepCount: number;
  sources: readonly MovementSource[];
}

/** Una serie de aproximación; weight null = la barra sola o la carga mínima de la máquina. */
export interface RampSet {
  reps: number;
  weight: number | null;
}
