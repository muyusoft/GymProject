import type { PlanExerciseRow } from "@/shared/db/types";
import { formatClock } from "@/shared/utils/duration.utils";
import {
  formatReps,
  parseProgressionRule,
  repRangeMin,
} from "@/shared/utils/progression-rule.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import { loadTypeUsesTime, loadTypeUsesWeight } from "./exercise-config.utils";

export type TranslateFn = (key: string) => string;

interface SubtitleOptions {
  exercise: PlanExerciseRow;
  t: TranslateFn;
  locale: string;
}

const SEPARATOR = " · ";
const SETS_BY = " × ";

function weightPart({ exercise, t, locale }: SubtitleOptions): string | null {
  if (!loadTypeUsesWeight(exercise.loadType) || exercise.targetWeight === null)
    return null;
  const weight = formatWeight({
    value: exercise.targetWeight,
    unit: exercise.unit,
    locale,
  });
  const suffix = t(`plan.load.suffix.${exercise.loadType}`);
  return suffix ? `${weight} ${suffix}` : weight;
}

function repsPart(exercise: PlanExerciseRow): string {
  const reps = exercise.reps ?? 0;
  return formatReps(
    reps,
    repRangeMin(parseProgressionRule(exercise.progressionRule), reps),
  );
}

/** "30 lb c/brazo · 4 × 12 · 1:30" (o "4 × 8–12" con rango) o, por tiempo, "3 × 1:30 de tiempo · descanso 2:00". */
export function formatExerciseSubtitle(options: SubtitleOptions): string {
  const { exercise, t } = options;
  if (loadTypeUsesTime(exercise.loadType)) {
    const duration = formatClock(exercise.seconds ?? 0);
    return [
      `${exercise.sets}${SETS_BY}${duration} ${t("plan.load.timeSuffix")}`,
      `${t("plan.load.rest")} ${formatClock(exercise.restSec)}`,
    ].join(SEPARATOR);
  }
  return [
    weightPart(options),
    `${exercise.sets}${SETS_BY}${repsPart(exercise)}`,
    formatClock(exercise.restSec),
  ]
    .filter((part): part is string => part !== null)
    .join(SEPARATOR);
}
