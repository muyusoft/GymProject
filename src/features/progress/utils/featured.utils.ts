import type { WeightUnit } from "@/shared/types/training.types";
import { convertWeight } from "@/shared/utils/weight.utils";
import type { Bucket, ExerciseSession, Trend } from "../types/progress.types";
import { maxPerBucket } from "./range.utils";
import { trendOf } from "./trend.utils";

export interface FeaturedSeries {
  /** 1RM estimado por periodo, en la unidad de pantalla; null donde no hubo sesión. */
  bars: (number | null)[];
  current: number | null;
  trend: Trend | null;
  /** Periodos entre la primera y la última marca (inclusive), para "en 12 semanas". */
  span: number;
}

interface SeriesOptions {
  sessions: readonly ExerciseSession[];
  buckets: readonly Bucket[];
  unit: WeightUnit;
}

export function buildFeaturedSeries({
  sessions,
  buckets,
  unit,
}: SeriesOptions): FeaturedSeries {
  const bars = maxPerBucket(
    sessions.map((session) => ({
      date: session.date,
      value: convertWeight(session.best.oneRepMaxKg, "kg", unit),
    })),
    buckets,
  );
  const filled = bars.flatMap((value, index) =>
    value === null ? [] : [{ value, index }],
  );
  const first = filled[0];
  const last = filled.at(-1);
  if (!first || !last) return { bars, current: null, trend: null, span: 0 };
  return {
    bars,
    current: last.value,
    trend: filled.length > 1 ? trendOf(first.value, last.value) : null,
    span: last.index - first.index + 1,
  };
}

/** ¿La sesión más reciente superó el 1RM estimado de todas las anteriores? */
export function isLatestRecord(sessions: readonly ExerciseSession[]): boolean {
  const [latest, ...earlier] = sessions;
  if (!latest || earlier.length === 0) return false;
  return (
    latest.best.oneRepMaxKg >
    Math.max(...earlier.map((session) => session.best.oneRepMaxKg))
  );
}
