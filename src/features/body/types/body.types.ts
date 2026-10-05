import type { WeightUnit } from "@/shared/types/training.types";

export interface BodyWeightEntry {
  id: string;
  /** Fecha local yyyy-MM-dd. */
  date: string;
  weight: number;
  unit: WeightUnit;
}

/** Siete días seguidos que terminan en `end`; la media es null si no hubo registros. */
export interface WeekBucket {
  end: string;
  averageKg: number | null;
  count: number;
}

export const LOGGING_STATUSES = ["empty", "stale", "sparse", "due", "ok"] as const;
export type LoggingStatus = (typeof LOGGING_STATUSES)[number];

export interface LoggingState {
  status: LoggingStatus;
  daysSinceLast: number | null;
}

export const BMI_CATEGORIES = ["underweight", "normal", "overweight", "obesity"] as const;
export type BmiCategory = (typeof BMI_CATEGORIES)[number];

export interface BmiResult {
  value: number;
  category: BmiCategory;
}

export const RATE_DIRECTIONS = ["up", "down", "same"] as const;
export type RateDirection = (typeof RATE_DIRECTIONS)[number];

export interface WeekPoint {
  end: string;
  value: number | null;
}

/** Todo lo que pinta la pantalla, ya en la unidad en que se muestra. */
export interface BodyView {
  unit: WeightUnit;
  latest: BodyWeightEntry | null;
  todayEntry: BodyWeightEntry | null;
  average: number | null;
  averageCount: number;
  ratePerWeek: number | null;
  bmi: BmiResult | null;
  logging: LoggingState;
  weeks: WeekPoint[];
  /** Del más nuevo al más viejo. */
  recent: BodyWeightEntry[];
}
