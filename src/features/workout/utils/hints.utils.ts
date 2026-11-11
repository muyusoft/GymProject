import type { IncreaseBasis } from "@/shared/utils/progression.utils";
import type { ProgressionHintData, TodayExercise, ExerciseInsight } from "../types/workout.types";

interface HintCandidate {
  exercise: TodayExercise;
  insight: ExerciseInsight;
}

function toHint(
  { exercise, insight }: HintCandidate,
  kind: ProgressionHintData["kind"],
  nextWeight: number,
): ProgressionHintData {
  const { template } = exercise;
  return {
    kind,
    increaseBasis: kind === "increase" ? insight.increaseBasis : null,
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

/** El texto de un aviso: el de subir dice en qué se basó (la respuesta de la última vez o dos sesiones completas). */
export function hintMessageKey(
  variant: "increase" | "preview" | "deload",
  basis: IncreaseBasis | null,
): string {
  return variant === "increase" ? `hint.increaseBy.${basis ?? "streak"}` : `hint.${variant}`;
}

/**
 * Con el entreno de hoy ya hecho, Hoy no muestra avisos: se calcularían con la sesión recién terminada y
 * dirían "hoy prueba…" para algo que toca la próxima vez. Vuelven a salir en la siguiente sesión.
 */
export function hintsForToday(
  hints: readonly ProgressionHintData[],
  isDoneToday: boolean,
): ProgressionHintData[] {
  return isDoneToday ? [] : [...hints];
}
