import type { SessionExercise, SessionSet } from "../types/workout.types";

export type SessionHintVariant = "increase" | "preview" | "deload";

export interface SessionHintChoice {
  variant: SessionHintVariant;
  /** Peso que propone la sugerencia. */
  weight: number;
  /** Las sugerencias de subir o descargar se aceptan; el anticipo solo informa. */
  canApply: boolean;
}

function pendingWeights(sets: readonly SessionSet[]): number[] {
  return sets.flatMap((set) =>
    !set.completed && set.weight !== null ? [set.weight] : [],
  );
}

/**
 * La sugerencia que toca mostrar en un ejercicio de la sesión. Subir o descargar solo se ofrecen mientras
 * quede alguna serie pendiente que aún no tenga ese peso: una vez aceptada (o hecho el ejercicio) desaparece.
 */
export function pickSessionHint({
  insight,
  sets,
}: SessionExercise): SessionHintChoice | null {
  const pending = pendingWeights(sets);
  const { increase, preview, deload } = insight;
  if (increase !== null && pending.some((weight) => weight < increase)) {
    return { variant: "increase", weight: increase, canApply: true };
  }
  if (increase === null && preview !== null)
    return { variant: "preview", weight: preview, canApply: false };
  if (deload !== null && pending.some((weight) => weight > deload)) {
    return { variant: "deload", weight: deload, canApply: true };
  }
  return null;
}

/** Al aceptar una subida con rango de repeticiones se vuelve al mínimo; en lo demás las reps no cambian. */
export function repsAfterApply(
  exercise: SessionExercise,
  variant: SessionHintVariant,
): number | null {
  return variant === "increase" ? exercise.template.repsMin : null;
}
