import type { Language } from "@/shared/types/settings.types";

interface NamedExercise {
  nameEs: string;
  nameEn: string;
}

export function getExerciseName(exercise: NamedExercise, language: string): string {
  const preferred: Language = language === "es" ? "es" : "en";
  return preferred === "es" ? exercise.nameEs : exercise.nameEn;
}
