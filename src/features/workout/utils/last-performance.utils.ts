import type { LastPerformance } from "@/shared/utils/last-performance.utils";
import type { ExerciseTemplate } from "../types/workout.types";

/**
 * La plantilla con el peso y la unidad de la última vez en lugar de los del plan, que solo sirven de punto
 * de partida mientras no hay historial. No aplica a ejercicios sin peso.
 */
export function withLastWeight(
  template: ExerciseTemplate,
  last: LastPerformance | null,
): ExerciseTemplate {
  if (!last || template.targetWeight === null) return template;
  return {
    ...template,
    targetWeight: last.weight,
    unit: last.unit,
    weightStep: template.weightSteps[last.unit],
  };
}
