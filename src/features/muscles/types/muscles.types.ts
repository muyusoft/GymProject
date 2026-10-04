import type {
  LoadType,
  MuscleBasis,
  MuscleGroup,
  MuscleRole,
  MuscleView,
  WeightUnit,
} from "@/shared/types/training.types";

/** Qué músculo trabaja un ejercicio y con qué sustento (una fila de exercise_muscles ya leída). */
export interface MuscleLink {
  exerciseId: string;
  group: MuscleGroup;
  view: MuscleView;
  role: MuscleRole;
  basis: MuscleBasis;
  sourceIds: string[];
}

/** Una serie completada de una sesión terminada, para calcular la recuperación. */
export interface RecoverySet {
  sessionId: string;
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  /** Fin de la sesión (ms desde epoch). */
  endedAt: number;
  rpe: number | null;
}

export type RecoveryState = "worked" | "recovering" | "ready";

export interface RecoveryCause {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
}

export interface GroupRecovery {
  group: MuscleGroup;
  state: RecoveryState;
  /** 0 a 1: horas transcurridas entre las requeridas, con tope. */
  percent: number;
  role: MuscleRole | null;
  /** Fin de la última sesión que lo trabajó, o null si no hay registro reciente. */
  lastWorkedAt: number | null;
  /** El ejercicio de la sesión que más pesa en la recuperación. */
  cause: RecoveryCause | null;
}

export interface SourceInfo {
  id: string;
  /** "Buonsenso et al. 2025". */
  citation: string;
  url: string;
}

export interface DayExerciseMuscles {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  links: MuscleLink[];
  sources: SourceInfo[];
}

export type CellState = "done" | "pending" | "empty";

export interface WeekColumn {
  weekStart: Date;
  cells: CellState[];
  /** Fechas yyyy-MM-dd de las sesiones de esa semana, en orden; la celda hecha i corresponde a dates[i]. */
  dates: string[];
}

/** Una serie completada en el resumen de un día. */
export interface DaySet {
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  seconds: number | null;
  loadType: LoadType;
  isPR: boolean;
}

export interface DayExercise {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  sets: DaySet[];
}

export interface DaySession {
  id: string;
  dayName: string | null;
  startedAt: number;
  endedAt: number;
}
