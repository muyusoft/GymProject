import { useCallback } from "react";
import { useFocusResource, type FocusResource } from "@/shared/hooks/use-focus-resource";
import { loadExerciseInfo } from "../services/exercise-info.service";
import type { ExerciseInfo } from "../types/exercise-info.types";

export function useExerciseInfo(exerciseId: string): FocusResource<ExerciseInfo | null> {
  const loader = useCallback(() => loadExerciseInfo(exerciseId), [exerciseId]);
  return useFocusResource(loader);
}
