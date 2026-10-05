import type { ExerciseSteps } from "../types/exercise-info.types";

/** Fotos de free-exercise-db (dominio público): dos por ejercicio, posición inicial y final. */
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const IMAGE_FILES = ["0.jpg", "1.jpg"] as const;
const LINE_BREAK = "\n";

/** Las rutas salen del id del catálogo abierto; un ejercicio propio (sin ese id) no tiene fotos. */
export function exerciseImageUrls(sourceId: string | null): string[] {
  if (!sourceId) return [];
  return IMAGE_FILES.map((file) => `${IMAGE_BASE_URL}/${encodeURIComponent(sourceId)}/${file}`);
}

/** El texto guardado (un paso por línea) → lista de pasos sin líneas vacías. */
export function splitSteps(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(LINE_BREAK)
    .map((step) => step.trim())
    .filter((step) => step !== "");
}

interface PickStepsOptions {
  language: string;
  stepsEs: readonly string[];
  stepsEn: readonly string[];
}

/** En español se muestran los pasos traducidos; si aún no hay, los de inglés con aviso. En inglés, siempre inglés. */
export function pickSteps({ language, stepsEs, stepsEn }: PickStepsOptions): ExerciseSteps {
  const wantsSpanish = language === "es";
  if (wantsSpanish && stepsEs.length > 0) return { steps: [...stepsEs], isUntranslated: false };
  return { steps: [...stepsEn], isUntranslated: wantsSpanish && stepsEn.length > 0 };
}
