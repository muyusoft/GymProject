import type { LoadType, WeightUnit } from "@/shared/types/training.types";
import type { LastPerformance } from "@/shared/utils/last-performance.utils";
import type { IncreaseBasis } from "@/shared/utils/progression.utils";
import type { ValidSet } from "@/shared/utils/one-rep-max.utils";
import type { RecordKind } from "@/shared/utils/records.utils";

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
  /** El mismo salto en cada unidad, para poder cambiar de lb a kg durante la sesión. */
  weightSteps: Record<WeightUnit, number>;
  /** "Sugerirme subir peso" de este ejercicio en el plan. */
  isProgressionEnabled: boolean;
}

export interface ExerciseInsight {
  /** Peso que sugiere probar hoy (ya cumplió la regla de subir). */
  increase: number | null;
  /** En qué se basó la sugerencia de subir; null si no hay. */
  increaseBasis: IncreaseBasis | null;
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

export interface SessionExercise {
  slot: PlanSlot;
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  template: ExerciseTemplate;
  sets: SessionSet[];
  insight: ExerciseInsight;
  /** Lo que se hizo la última vez; null sin historial. */
  last: LastPerformance | null;
}

/** Un récord recién batido en la sesión: qué serie y de qué tipo, para explicarlo en el aviso. */
export interface RecordNotice {
  exercise: SessionExercise;
  set: ValidSet;
  kind: RecordKind;
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
  /** Solo en los avisos de subir: en qué se basó, para explicarlo en el mensaje. */
  increaseBasis: IncreaseBasis | null;
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
  /** Con el entreno terminado: lo que se hizo, en el orden en que se hizo. */
  doneExercises: TodayExercise[] | null;
  durationMinutes: number;
  totalSets: number;
  completedExercises: number;
  activeSessionId: string | null;
  /** La sesión de hoy ya terminada, para poder reabrirla; null si no hay. */
  finishedSessionId: string | null;
  isDoneToday: boolean;
  hints: ProgressionHintData[];
  /** Si lo de hoy es un día movido esta semana: de qué día de la semana viene. */
  movedFromWeekday: number | null;
  /** El último día de entreno que quedó sin hacer, ofrecido para hacerlo hoy. */
  missedDay: MissedDayOffer | null;
}

export interface MissedDayOffer {
  /** Fecha del día perdido, yyyy-MM-dd. */
  date: string;
  weekday: number;
  dayName: string;
  /** El día que se quedaría fuera esta semana si se hace hoy; null si todo cabe. */
  lostDayName: string | null;
}
