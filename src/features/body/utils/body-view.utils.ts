import type { WeighInFrequency } from "@/shared/types/settings.types";
import type { UnitPreference, WeightUnit } from "@/shared/types/training.types";
import { toIsoDate } from "@/shared/utils/week.utils";
import { convertWeight } from "@/shared/utils/weight.utils";
import type { BodyView, BodyWeightEntry, RateDirection } from "../types/body.types";
import { bmiResult } from "./bmi.utils";
import { latestBucket, loggingState, weeklyBuckets, weeklyRateKg } from "./body-weight.utils";

export const CHART_WEEKS = 6;
const RECENT_LIMIT = 10;
const TENTHS = 10;
/** Por debajo de esto el cambio semanal se muestra como estable. */
const STABLE_BELOW = 0.05;

interface StepperConfig {
  coarse: number;
  fine: number;
  min: number;
  max: number;
  initial: number;
}

/** Sin teclado: un paso grande para llegar rápido y uno fino para la décima que marca la báscula. */
export const BODY_WEIGHT_STEPPER: Record<WeightUnit, StepperConfig> = {
  kg: { coarse: 1, fine: 0.1, min: 20, max: 300, initial: 70 },
  lb: { coarse: 1, fine: 0.2, min: 45, max: 660, initial: 155 },
};

/** La unidad de Ajustes; con "según ejercicio" se usa la del último registro (kg si no hay). */
export function resolveBodyUnit(preference: UnitPreference, latest: BodyWeightEntry | null): WeightUnit {
  if (preference !== "per_exercise") return preference;
  return latest?.unit ?? "kg";
}

/** Valor con que arranca el registro de hoy: el último peso, redondeado a una décima. */
export function initialDraft(latest: BodyWeightEntry | null, unit: WeightUnit): number {
  if (!latest) return BODY_WEIGHT_STEPPER[unit].initial;
  return Math.round(convertWeight(latest.weight, latest.unit, unit) * TENTHS) / TENTHS;
}

export function rateDirection(rate: number): RateDirection {
  if (Math.abs(rate) < STABLE_BELOW) return "same";
  return rate > 0 ? "up" : "down";
}

export interface BodyViewOptions {
  /** Ordenados por fecha, del más viejo al más nuevo. */
  entries: readonly BodyWeightEntry[];
  today: Date;
  preference: UnitPreference;
  frequency: WeighInFrequency;
  heightCm: number;
}

export function buildBodyView({ entries, today, preference, frequency, heightCm }: BodyViewOptions): BodyView {
  const latest = entries.at(-1) ?? null;
  const unit = resolveBodyUnit(preference, latest);
  const buckets = weeklyBuckets({ entries, today, weeks: CHART_WEEKS });
  const current = latestBucket(buckets);
  const averageKg = current?.averageKg ?? null;
  const rateKg = weeklyRateKg(buckets);
  const toUnit = (kg: number | null) => (kg === null ? null : convertWeight(kg, "kg", unit));
  return {
    unit,
    latest,
    todayEntry: entries.find((entry) => entry.date === toIsoDate(today)) ?? null,
    average: toUnit(averageKg),
    averageCount: current?.count ?? 0,
    ratePerWeek: toUnit(rateKg),
    bmi: bmiResult(averageKg, heightCm),
    logging: loggingState({ entries, today, frequency }),
    weeks: buckets.map((bucket) => ({ end: bucket.end, value: toUnit(bucket.averageKg) })),
    recent: [...entries].reverse().slice(0, RECENT_LIMIT),
  };
}
