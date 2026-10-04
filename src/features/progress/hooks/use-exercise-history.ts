import { useCallback, useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import type { WeightUnit } from "@/shared/types/training.types";
import { suggestIncrease } from "@/shared/utils/progression.utils";
import { loadExerciseHistory, type ExerciseHistoryData } from "../services/exercise-history.service";
import { historyStats, type HistoryStats } from "../utils/history-stats.utils";

export interface IncreaseHint {
  sets: number;
  reps: number;
  nextWeight: number;
  unit: WeightUnit;
}

interface ExerciseHistoryState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  data: ExerciseHistoryData | null;
  stats: HistoryStats | null;
  hint: IncreaseHint | null;
}

export function useExerciseHistory(exerciseId: string): ExerciseHistoryState {
  const loader = useCallback(() => loadExerciseHistory(exerciseId), [exerciseId]);
  const { status, data, reload } = useFocusResource(loader);
  const progressionSuggestions = useSettingsStore((state) => state.progressionSuggestions);
  const trackRpe = useSettingsStore((state) => state.trackRpe);

  const stats = useMemo(() => (data ? historyStats(data.sessions) : null), [data]);

  const hint = useMemo((): IncreaseHint | null => {
    if (!data?.target || !progressionSuggestions) return null;
    const nextWeight = suggestIncrease({
      history: data.results,
      target: data.target,
      step: data.weightStep,
      trackRpe,
    });
    const unit = data.sessions[0]?.best.unit;
    if (nextWeight === null || !unit) return null;
    return { sets: data.target.sets, reps: data.target.reps, nextWeight, unit };
  }, [data, progressionSuggestions, trackRpe]);

  return { status, reload, data, stats, hint };
}
