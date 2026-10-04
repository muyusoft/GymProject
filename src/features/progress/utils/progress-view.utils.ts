import type { UnitPreference, WeightUnit } from "@/shared/types/training.types";
import type { Bucket, LoggedSetRow, ProgressData, ProgressRange, Trend } from "../types/progress.types";
import { buildExerciseProgress, topExercises, type ExerciseProgress } from "./exercise-sessions.utils";
import { buildFeaturedSeries, isLatestRecord, type FeaturedSeries } from "./featured.utils";
import { pickDisplayUnit } from "./history-stats.utils";
import { monthSessionStats, type MonthSessionStats } from "./month-sessions.utils";
import { buildBuckets, rangeStartIso, spanUnit } from "./range.utils";
import { recentRecords, type RecentRecord } from "./records-list.utils";
import { percentChange, trendOf } from "./trend.utils";
import { weeklyVolumes } from "./volume.utils";

const PICKER_LIMIT = 5;
const RECORDS_LIMIT = 3;
const KG_PER_TONNE = 1000;

export interface PickerItem {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  /** Sesiones con peso en el periodo. */
  count: number;
}

export interface FeaturedView extends FeaturedSeries {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  unit: WeightUnit;
  isRecord: boolean;
  spanUnit: "weeks" | "months";
  /** Inicio de cada periodo, para rotular el eje. */
  bucketStarts: Date[];
}

export interface VolumeView {
  tonnes: number;
  /** Cambio contra la semana anterior (0.08 = +8%), o null si no había semana anterior. */
  change: number | null;
  trend: Trend | null;
}

export interface ProgressView {
  isEmpty: boolean;
  /** Los más entrenados (más el elegido, si no está entre ellos). */
  picker: PickerItem[];
  /** Todos los ejercicios con sesiones en el periodo, para el selector completo. */
  all: PickerItem[];
  featured: FeaturedView | null;
  volume: VolumeView;
  month: MonthSessionStats;
  records: RecentRecord[];
}

interface ViewOptions {
  data: ProgressData;
  range: ProgressRange;
  preference: UnitPreference;
  /** Ejercicio elegido; si falta o ya no tiene datos en el periodo, se toma el más entrenado. */
  selectedId: string | null;
}

function buildVolume(sets: readonly LoggedSetRow[], now: Date): VolumeView {
  const { current, previous } = weeklyVolumes({ sets, now });
  return {
    tonnes: current / KG_PER_TONNE,
    change: percentChange(previous, current),
    trend: previous > 0 ? trendOf(previous, current) : null,
  };
}

interface FeaturedOptions {
  chosen: ExerciseProgress;
  buckets: readonly Bucket[];
  range: ProgressRange;
  preference: UnitPreference;
}

function buildFeaturedView({ chosen, buckets, range, preference }: FeaturedOptions): FeaturedView {
  const unit = pickDisplayUnit(preference, chosen.sessions[0]?.best.unit);
  return {
    ...buildFeaturedSeries({ sessions: chosen.sessions, buckets, unit }),
    exerciseId: chosen.exerciseId,
    nameEs: chosen.nameEs,
    nameEn: chosen.nameEn,
    unit,
    isRecord: isLatestRecord(chosen.sessions),
    spanUnit: spanUnit(range),
    bucketStarts: buckets.map((bucket) => bucket.start),
  };
}

export function buildProgressView({ data, range, preference, selectedId }: ViewOptions): ProgressView {
  const now = new Date(data.generatedAt);
  const buckets = buildBuckets({ range, now });
  const ranked = topExercises({
    progress: buildExerciseProgress(data.sets),
    from: rangeStartIso(buckets),
    limit: Number.POSITIVE_INFINITY,
  });
  const chosen = ranked.find((item) => item.exerciseId === selectedId) ?? ranked[0];
  const top = ranked.slice(0, PICKER_LIMIT);
  const toItem = ({ exerciseId, nameEs, nameEn, count }: (typeof ranked)[number]): PickerItem => ({ exerciseId, nameEs, nameEn, count });

  return {
    isEmpty: data.sessions.length === 0,
    picker: (chosen && !top.includes(chosen) ? [...top, chosen] : top).map(toItem),
    all: ranked.map(toItem),
    featured: chosen ? buildFeaturedView({ chosen, buckets, range, preference }) : null,
    volume: buildVolume(data.sets, now),
    month: monthSessionStats({ sessions: data.sessions, plannedWeekdays: data.plannedWeekdays, today: now }),
    records: recentRecords(data.sets, RECORDS_LIMIT),
  };
}
