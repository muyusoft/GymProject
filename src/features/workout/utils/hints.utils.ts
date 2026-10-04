import type { ProgressionHintData, TodayExercise, ExerciseInsight } from "../types/workout.types";

interface HintCandidate {
  exercise: TodayExercise;
  insight: ExerciseInsight;
}

function toHint(
  { exercise }: HintCandidate,
  kind: ProgressionHintData["kind"],
  nextWeight: number,
): ProgressionHintData {
  const { template } = exercise;
  return {
    kind,
    exerciseId: exercise.exerciseId,
    nameEs: exercise.nameEs,
    nameEn: exercise.nameEn,
    sets: template.sets,
    reps: template.reps ?? 0,
    currentWeight: template.targetWeight ?? 0,
    nextWeight,
    unit: template.unit,
  };
}

/** Un aviso de subir peso y uno de descarga como máximo, para no saturar Hoy. */
export function buildHints(candidates: readonly HintCandidate[]): ProgressionHintData[] {
  const increase = candidates.find((candidate) => candidate.insight.increase !== null);
  const deload = candidates.find(
    (candidate) => candidate.insight.deload !== null && candidate !== increase,
  );
  return [
    ...(increase?.insight.increase != null ? [toHint(increase, "increase", increase.insight.increase)] : []),
    ...(deload?.insight.deload != null ? [toHint(deload, "deload", deload.insight.deload)] : []),
  ];
}
