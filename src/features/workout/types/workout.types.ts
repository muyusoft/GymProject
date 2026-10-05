import type {
  Equipment,
  LoadType,
  WeightUnit,
} from "@/shared/types/training.types";

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
  /** Esfuerzo del ejercicio (respuesta guardada como RPE); null si no se respondió. */
  rpe: number | null;
}

export interface ExerciseTemplate {
  sets: number;
  /** Objetivo de repeticiones: el tope del rango si lo hay. */
  reps: number | null;
  /** Mínimo del rango de repeticiones (doble progresión); null con objetivo fijo. */
  repsMin: number | null;
  seconds: number | null;
  restSec: number;
  targetWeight: number | null;
  unit: WeightUnit;
  loadType: LoadType;
  /** Salto de peso del equipo en la unidad del ejercicio. */
  weightStep: number;
  /** "Sugerirme subir peso" de este ejercicio en el plan. */
  isProgressionEnabled: boolean;
}

export interface ExerciseInsight {
  /** Peso que sugiere probar hoy (ya cumplió la regla de subir). */
  increase: number | null;
  /** Peso que se sugerirá la próxima vez si hoy completa todo. */
  preview: number | null;
  /** Peso de una semana de descarga. */
  deload: number | null;
}

/** El lugar del ejercicio en el plan: sirve para sustituirlo hoy y saber si ya está sustituido. */
export interface PlanSlot {
  planExerciseId: string;
  /** El ejercicio que el plan tiene en ese lugar. */
  originalExerciseId: string;
  isSubstituted: boolean;
}

export const SUBSTITUTE_SCOPES = ["today", "plan"] as const;
export type SubstituteScope = (typeof SUBSTITUTE_SCOPES)[number];

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

export interface SessionExercise {
  slot: PlanSlot;
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

/** "none" es un día pasado sin entreno: de semanas anteriores no se dice "planificado" porque el plan pudo cambiar. */
export type WeekStripStatus = "done" | "planned" | "rest" | "none";

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
  slot: PlanSlot;
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
