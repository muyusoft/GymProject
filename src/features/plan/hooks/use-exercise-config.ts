import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import type { WeightUnit } from "@/shared/types/training.types";
import { removeExercise } from "../services/day.service";
import {
  loadExerciseConfig,
  saveExerciseConfig,
  type ExerciseConfig,
} from "../services/exercise-config.service";
import {
  draftFromPlanExercise,
  draftToPatch,
  switchUnit,
  type ConfigDraft,
} from "../utils/exercise-config.utils";

interface ExerciseConfigState {
  status: ResourceStatus;
  config: ExerciseConfig | null;
  reload: () => Promise<void>;
  draft: ConfigDraft | null;
  patchDraft: (patch: Partial<ConfigDraft>) => void;
  changeUnit: (unit: WeightUnit) => void;
  save: () => Promise<void>;
  remove: () => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
}

export function useExerciseConfig(planExerciseId: string): ExerciseConfigState {
  const loader = useCallback(() => loadExerciseConfig(planExerciseId), [planExerciseId]);
  const { status, data: config, reload } = useFocusResource(loader);
  const [draft, setDraft] = useState<ConfigDraft | null>(null);
  const { run, isRunning, hasError } = useActionRunner();

  useEffect(() => {
    if (config && draft === null) setDraft(draftFromPlanExercise(config.detail.planExercise));
  }, [config, draft]);

  const patchDraft = useCallback((patch: Partial<ConfigDraft>) => {
    setDraft((current) => current && { ...current, ...patch });
  }, []);

  const changeUnit = useCallback(
    (unit: WeightUnit) => {
      if (!config || !draft || unit === draft.unit) return;
      const weight = switchUnit({
        weight: draft.weight,
        from: draft.unit,
        to: unit,
        step: config.steps[unit],
      });
      patchDraft({ unit, weight });
    },
    [config, draft, patchDraft],
  );

  const save = useCallback(async () => {
    if (!config || !draft) return;
    const rule = config.detail.planExercise.progressionRule;
    const isSaved = await run(() => saveExerciseConfig(planExerciseId, draftToPatch(draft, rule)));
    if (isSaved) router.back();
  }, [config, draft, planExerciseId, run]);

  const remove = useCallback(async () => {
    if (await run(() => removeExercise(planExerciseId))) router.back();
  }, [planExerciseId, run]);

  return {
    status,
    config,
    reload,
    draft,
    patchDraft,
    changeUnit,
    save,
    remove,
    isSaving: isRunning,
    hasError,
  };
}
