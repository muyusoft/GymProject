import type { LastPerformance } from "@/shared/utils/last-performance.utils";
import type { ExerciseTemplate } from "../types/workout.types";
import { usesWeight } from "./set-display.utils";

/**
 * La plantilla con el peso y la unidad de la última vez en lugar de los del plan, que solo sirven de punto
 * de partida mientras no hay historial. No aplica a ejercicios sin peso. Se decide por el tipo de carga y no
 * por un peso vacío: un sustituto sin historial entra al plan sin peso y lo define su primera sesión.
 */
export function withLastWeight(
  template: ExerciseTemplate,
  last: LastPerformance | null,
): ExerciseTemplate {
  if (!last || !usesWeight(template.loadType)) return template;
  return {
    ...template,
    targetWeight: last.weight,
    unit: last.unit,
    weightStep: template.weightSteps[last.unit],
  };
}
