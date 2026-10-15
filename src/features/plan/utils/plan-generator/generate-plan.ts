import type {
  CatalogExercise,
  GeneratedDay,
  GeneratedExercise,
  GeneratedPlan,
  PlanAnswers,
} from "../../types/plan-generator.types";
import { createExercisePicker, type ExercisePicker } from "./exercise-picker";
import { fallbackFor } from "./pattern-fallback";
import { prescribe } from "./prescription";
import { fitToSessionTime, isShortOfTime } from "./session-time";
import { dayPatterns, SPLITS } from "./templates";
import { applyFocus, capVolume } from "./volume";

/**
 * Arma el plan semanal a partir de las respuestas: tipo de rutina por días, ejercicios del catálogo por
 * patrón (solo los que permite el equipo; si un patrón no se puede, su sustituto), series y reps por
 * objetivo y experiencia, más volumen para la prioridad, un tope por músculo y cada día ajustado al tiempo.
 * Puro: el mismo catálogo y las mismas respuestas dan siempre el mismo plan.
 */
interface FillContext {
  picker: ExercisePicker;
  answers: PlanAnswers;
  /** Patrones que el equipo no permitió; se van anotando para avisarlo en la vista previa. */
  missing: Set<string>;
}

/** Un ejercicio para el patrón; si el equipo no lo permite, uno de su sustituto. */
function fillPattern(pattern: string, patterns: readonly string[], context: FillContext): GeneratedExercise[] {
  const direct = context.picker.pick(pattern);
  if (direct) return [prescribe(direct, context.answers)];
  context.missing.add(pattern);
  const fallback = fallbackFor(pattern, patterns);
  const substitute = fallback ? context.picker.pick(fallback) : null;
  return substitute ? [prescribe(substitute, context.answers)] : [];
}

export function generatePlan(answers: PlanAnswers, catalog: readonly CatalogExercise[]): GeneratedPlan {
  const picker = createExercisePicker(catalog, { experience: answers.experience, equipment: answers.equipment });
  const lookup = new Map(catalog.map((exercise) => [exercise.id, exercise.muscles]));
  const context: FillContext = { picker, answers, missing: new Set() };
  const days: GeneratedDay[] = SPLITS[answers.days].map(({ weekday, template }) => {
    const patterns = dayPatterns(template, answers.focus);
    return { weekday, template, exercises: patterns.flatMap((pattern) => fillPattern(pattern, patterns, context)) };
  });
  const capOptions = { experience: answers.experience, focus: answers.focus, lookup };
  const capped = capVolume(applyFocus(days, answers.focus, lookup), capOptions);
  const timed = fitToSessionTime(capped, { ...capOptions, picker, answers });
  return {
    days: timed,
    isShortOfTime: isShortOfTime(timed, answers.minutes),
    missingPatterns: [...context.missing],
  };
}
