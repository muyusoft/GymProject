import type { SessionResult } from "@/shared/types/history.types";
import {
  increaseBasis,
  previewIncrease,
  suggestIncrease,
} from "@/shared/utils/progression.utils";
import type { ExerciseInsight, ExerciseTemplate } from "../types/workout.types";
import { suggestDeload } from "./deload.utils";

export const NO_INSIGHT: ExerciseInsight = {
  increase: null,
  increaseBasis: null,
  preview: null,
  deload: null,
};

export interface InsightSettings {
  progressionSuggestions: boolean;
  trackRpe: boolean;
  autoDeload: boolean;
}

interface InsightOptions {
  history: readonly SessionResult[];
  template: ExerciseTemplate;
  settings: InsightSettings;
  today: Date;
}

type IncreaseOptions = Parameters<typeof suggestIncrease>[0];
type IncreaseInsight = Pick<
  ExerciseInsight,
  "increase" | "increaseBasis" | "preview"
>;

function increaseInsight(
  options: IncreaseOptions,
  canSuggest: boolean,
): IncreaseInsight {
  if (!canSuggest) return { increase: null, increaseBasis: null, preview: null };
  const increase = suggestIncrease(options);
  return {
    increase,
    increaseBasis:
      increase === null ? null : increaseBasis(options.history, options.trackRpe),
    preview: previewIncrease(options),
  };
}

/** Solo los ejercicios con peso y reps tienen sugerencias; por tiempo o peso corporal no. */
export function buildInsight({
  history,
  template,
  settings,
  today,
}: InsightOptions): ExerciseInsight {
  const { reps, sets, weightStep } = template;
  if (reps === null || template.targetWeight === null) return NO_INSIGHT;
  const options = {
    history,
    target: { sets, reps, hasRepRange: template.repsMin !== null },
    step: weightStep,
    trackRpe: settings.trackRpe,
  };
  // Hacen falta los dos interruptores: el general de Ajustes y el del ejercicio en el plan.
  const canSuggest =
    settings.progressionSuggestions && template.isProgressionEnabled;
  return {
    ...increaseInsight(options, canSuggest),
    deload: settings.autoDeload
      ? suggestDeload({ history, today, step: weightStep })
      : null,
  };
}
