import { differenceInCalendarDays, parseISO, subDays } from "date-fns";
import type { WeighInFrequency } from "@/shared/types/settings.types";
import { toIsoDate } from "@/shared/utils/week.utils";
import { convertWeight } from "@/shared/utils/weight.utils";
import type { BodyWeightEntry, LoggingState, WeekBucket } from "../types/body.types";

export const WEEK_DAYS = 7;
/** El cambio semanal se mide sobre las últimas 4 semanas. */
export const RATE_WEEKS = 4;
/** Con menos registros en 7 días, la media diaria todavía no es fiable. */
export const MIN_DAILY_ENTRIES = 3;
/** Días sin registrar a partir de los cuales la tendencia deja de ser fiable. */
export const STALE_AFTER_DAYS: Record<WeighInFrequency, number> = { daily: 7, weekly: 14 };

/** Días desde esa fecha hasta hoy; negativo si la fecha es futura. */
export function daysAgo(isoDate: string, today: Date): number {
  return differenceInCalendarDays(today, parseISO(isoDate));
}

interface BucketOptions {
  entries: readonly BodyWeightEntry[];
  today: Date;
  weeks: number;
}

/** Medias de 7 días, de la semana más vieja a la actual. La semana actual son hoy y los 6 días anteriores. */
export function weeklyBuckets({ entries, today, weeks }: BucketOptions): WeekBucket[] {
  return Array.from({ length: weeks }, (_, position) => {
    const weeksBack = weeks - 1 - position;
    const kilos = entries
      .filter((entry) => Math.floor(daysAgo(entry.date, today) / WEEK_DAYS) === weeksBack)
      .map((entry) => convertWeight(entry.weight, entry.unit, "kg"));
    const total = kilos.reduce((sum, value) => sum + value, 0);
    return {
      end: toIsoDate(subDays(today, weeksBack * WEEK_DAYS)),
      averageKg: kilos.length > 0 ? total / kilos.length : null,
      count: kilos.length,
    };
  });
}

/** La semana más reciente que tiene registros. */
export function latestBucket(buckets: readonly WeekBucket[]): WeekBucket | null {
  return [...buckets].reverse().find((bucket) => bucket.averageKg !== null) ?? null;
}

/** Kilos por semana entre la semana con datos más vieja y la más nueva de las últimas 4; null con una sola. */
export function weeklyRateKg(buckets: readonly WeekBucket[]): number | null {
  const points = buckets
    .slice(-(RATE_WEEKS + 1))
    .flatMap((bucket, index) => (bucket.averageKg === null ? [] : [{ index, kg: bucket.averageKg }]));
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || first.index === last.index) return null;
  return (last.kg - first.kg) / (last.index - first.index);
}

interface LoggingOptions {
  entries: readonly BodyWeightEntry[];
  today: Date;
  frequency: WeighInFrequency;
}

/** Qué decirle a la persona sobre su registro: sin datos, abandonado, con pocos datos, toca pesarse o al día. */
export function loggingState({ entries, today, frequency }: LoggingOptions): LoggingState {
  const ages = entries.map((entry) => daysAgo(entry.date, today)).filter((age) => age >= 0);
  if (ages.length === 0) return { status: "empty", daysSinceLast: null };
  const daysSinceLast = Math.min(...ages);
  if (daysSinceLast > STALE_AFTER_DAYS[frequency]) return { status: "stale", daysSinceLast };
  if (frequency === "weekly") return { status: daysSinceLast >= WEEK_DAYS ? "due" : "ok", daysSinceLast };
  const inLastWeek = ages.filter((age) => age < WEEK_DAYS).length;
  if (inLastWeek < MIN_DAILY_ENTRIES) return { status: "sparse", daysSinceLast };
  return { status: daysSinceLast > 0 ? "due" : "ok", daysSinceLast };
}
