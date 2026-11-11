import type { WeightUnit } from "./training.types";

/** Una serie registrada, tal como la necesitan las reglas de progresión. */
export interface LoggedSet {
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
}

/** Una sesión terminada de un ejercicio; el historial se ordena de la más nueva a la más vieja. */
export interface SessionResult {
  /** Fecha local yyyy-MM-dd. */
  date: string;
  sets: LoggedSet[];
}

export interface ProgressionTarget {
  sets: number;
  /** Objetivo de repeticiones: el tope del rango si lo hay. */
  reps: number;
  /** Con rango (doble progresión) llegar al tope con 1 o 2 en reserva ya basta para subir peso. */
  hasRepRange?: boolean;
}
