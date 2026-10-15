import { useCallback, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { updatePlanReps, type PlanRepsScope } from "../services/plan-reps.service";
import type { SessionExercise } from "../types/workout.types";
import { planRepsOffer } from "../utils/plan-reps.utils";

interface PlanRepsState {
  /** Reps a proponer; null si no hay pregunta (o ya se respondió). */
  reps: number | null;
  update: (scope: PlanRepsScope) => void;
  dismiss: () => void;
  isSaving: boolean;
  hasError: boolean;
}

export function usePlanReps(
  exercise: SessionExercise,
  onUpdated: () => Promise<void>,
): PlanRepsState {
  const { run, isRunning, hasError } = useActionRunner();
  const [isAnswered, setIsAnswered] = useState(false);
  const reps = isAnswered ? null : planRepsOffer(exercise);

  const save = useCallback(
    async (scope: PlanRepsScope) => {
      if (reps === null) return;
      const isSaved = await run(() =>
        updatePlanReps({
          planExerciseId: exercise.slot.planExerciseId,
          exerciseId: exercise.exerciseId,
          reps,
          scope,
        }),
      );
      if (!isSaved) return;
      setIsAnswered(true);
      await onUpdated();
    },
    [reps, run, exercise, onUpdated],
  );

  return {
    reps,
    update: (scope) => void save(scope),
    dismiss: () => setIsAnswered(true),
    isSaving: isRunning,
    hasError,
  };
}
