import { addMonths, addWeeks, startOfMonth, subMonths, subWeeks } from "date-fns";
import { startOfWeekMonday, toIsoDate } from "@/shared/utils/week.utils";
import type { Bucket, ProgressRange } from "../types/progress.types";

const MONTH_RANGE_WEEKS = 4;
const QUARTER_RANGE_WEEKS = 12;
const YEAR_RANGE_MONTHS = 12;

interface BucketOptions {
  range: ProgressRange;
  now: Date;
}

/** Mes = 4 semanas, 3 meses = 12 semanas, Año = 12 meses; el último periodo es el actual. */
export function buildBuckets({ range, now }: BucketOptions): Bucket[] {
  if (range === "year") {
    const first = startOfMonth(subMonths(now, YEAR_RANGE_MONTHS - 1));
    return Array.from({ length: YEAR_RANGE_MONTHS }, (_, index) => ({
      start: addMonths(first, index),
      end: addMonths(first, index + 1),
    }));
  }
  const count = range === "month" ? MONTH_RANGE_WEEKS : QUARTER_RANGE_WEEKS;
  const first = subWeeks(startOfWeekMonday(now), count - 1);
  return Array.from({ length: count }, (_, index) => ({
    start: addWeeks(first, index),
    end: addWeeks(first, index + 1),
  }));
}

export function spanUnit(range: ProgressRange): "weeks" | "months" {
  return range === "year" ? "months" : "weeks";
}

export function bucketIndexOf(date: string, buckets: readonly Bucket[]): number {
  return buckets.findIndex((bucket) => date >= toIsoDate(bucket.start) && date < toIsoDate(bucket.end));
}

export interface DatedValue {
  date: string;
  value: number;
}

/** El mayor valor de cada periodo; null si no hubo ninguno. */
export function maxPerBucket(points: readonly DatedValue[], buckets: readonly Bucket[]): (number | null)[] {
  const values: (number | null)[] = buckets.map(() => null);
  for (const point of points) {
    const index = bucketIndexOf(point.date, buckets);
    if (index < 0) continue;
    values[index] = Math.max(values[index] ?? Number.NEGATIVE_INFINITY, point.value);
  }
  return values;
}

export function rangeStartIso(buckets: readonly Bucket[]): string {
  const first = buckets[0];
  return first ? toIsoDate(first.start) : "";
}
