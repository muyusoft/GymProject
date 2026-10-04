import type { LoadType, WeightUnit } from "@/shared/types/training.types";

export interface SessionSet {
  id: string;
  index: number;
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  seconds: number | null;
  loadType: LoadType;
  completed: boolean;
  isPR: boolean;
}

export interface ExerciseTemplate {
  sets: number;
  reps: number | null;
  seconds: number | null;
  restSec: number;
  targetWeight: number | null;
  unit: WeightUnit;
  loadType: LoadType;
  /** Salto de peso del equipo en la unidad del ejercicio. */
  weightStep: number;
}

export interface ExerciseInsight {
  /** Peso que sugiere probar hoy (ya cumplió la regla de subir). */
  increase: number | null;
  /** Peso que se sugerirá la próxima vez si hoy completa todo. */
  preview: number | null;
  /** Peso de una semana de descarga. */
  deload: number | null;
}

export interface SessionExercise {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  template: ExerciseTemplate;
  sets: SessionSet[];
  insight: ExerciseInsight;
}

export interface SessionView {
  id: string;
  dayName: string;
  startedAt: number;
  endedAt: number | null;
  exercises: SessionExercise[];
}

export type WeekStripStatus = "done" | "planned" | "rest";

export interface WeekStripDay {
  date: Date;
  weekday: number;
  status: WeekStripStatus;
  isToday: boolean;
}

export type HintKind = "increase" | "deload";

export interface ProgressionHintData {
  kind: HintKind;
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  sets: number;
  reps: number;
  currentWeight: number;
  nextWeight: number;
  unit: WeightUnit;
}

export interface TodayExercise {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  template: ExerciseTemplate;
}

export interface TodayView {
  hasPlan: boolean;
  today: Date;
  weekStrip: WeekStripDay[];
  day: { id: string; name: string } | null;
  exercises: TodayExercise[];
  durationMinutes: number;
  totalSets: number;
  completedExercises: number;
  activeSessionId: string | null;
  isDoneToday: boolean;
  hints: ProgressionHintData[];
}
