import type { LoadType, WeightUnit } from "@/shared/types/training.types";

export const PROGRESS_RANGES = ["month", "quarter", "year"] as const;
export type ProgressRange = (typeof PROGRESS_RANGES)[number];

/** Una serie completada de una sesión terminada. */
export interface LoggedSetRow {
  sessionId: string;
  /** Fecha local yyyy-MM-dd. */
  date: string;
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  rpe: number | null;
  loadType: LoadType;
  isPR: boolean;
}

export interface ProgressData {
  /** Series completadas de los últimos 12 meses. */
  sets: LoggedSetRow[];
  sessions: { id: string; date: string }[];
  /** Días de la semana (0 = lunes) con entreno en el plan. */
  plannedWeekdays: number[];
  generatedAt: number;
}

export interface SessionBest {
  weight: number;
  unit: WeightUnit;
  reps: number;
  loadType: LoadType | undefined;
  oneRepMaxKg: number;
}

/** El resumen de un ejercicio en una sesión: su mejor serie, cuántas series y cuánto volumen. */
export interface ExerciseSession {
  sessionId: string;
  date: string;
  dayName: string | null;
  best: SessionBest;
  completedSets: number;
  volumeKg: number;
}

export type TrendDirection = "up" | "same" | "down";

export interface Trend {
  direction: TrendDirection;
  delta: number;
}

export interface Bucket {
  start: Date;
  /** Exclusivo. */
  end: Date;
}
