import type { MuscleGroup } from "@/shared/types/training.types";

type TranslateFn = (key: string) => string;

/** "pecho, espalda alta, bíceps" → "Pecho, espalda alta, bíceps": nombres de grupos en una frase. */
export function joinGroupNames(groups: readonly MuscleGroup[], t: TranslateFn): string {
  const text = groups.map((group) => t(`muscles.group.${group}`).toLowerCase()).join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
