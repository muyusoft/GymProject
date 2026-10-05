import type { PlanDayRow } from "@/shared/db/types";
import type { PlanExerciseDetail } from "@/shared/db/queries/plan-exercise.queries";
import type { DayNameSuggestion } from "../utils/day-name.utils";

export interface DayDefaults {
  sets: number;
  reps: number;
  restSec: number;
}

export interface DaySummary {
  id: string;
  weekday: number;
  name: string;
  exerciseCount: number;
  durationMinutes: number;
  isDone: boolean;
  isToday: boolean;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  repeatsWeekly: boolean;
  days: DaySummary[];
  restWeekdays: number[];
  totalExercises: number;
  defaults: DayDefaults;
  weekStart: Date;
}

export interface DayDetail {
  day: PlanDayRow;
  planName: string;
  exercises: PlanExerciseDetail[];
  /** Nombre sugerido según los ejercicios del día; null si no hay músculos con fuente para deducirlo. */
  nameSuggestion: DayNameSuggestion | null;
}

export type ReorderDirection = "up" | "down";

export interface PlanSettingsPatch {
  name: string;
  repeatsWeekly: boolean;
}
