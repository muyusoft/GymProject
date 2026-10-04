import { router } from "expo-router";
import { useCallback } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadDay, reorderExercise, saveDay } from "../services/day.service";
import type { DayDetail, ReorderDirection } from "../types/plan.types";
import { useDayDraft } from "./use-day-draft";

interface DayEditorState {
  status: ResourceStatus;
  detail: DayDetail | null;
  reload: () => Promise<void>;
  draft: ReturnType<typeof useDayDraft>;
  save: () => Promise<void>;
  move: (planExerciseId: string, direction: ReorderDirection) => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
}

export function useDayEditor(dayId: string): DayEditorState {
  const loader = useCallback(() => loadDay(dayId), [dayId]);
  const { status, data: detail, reload } = useFocusResource(loader);
  const draft = useDayDraft(detail);
  const { run, isRunning, hasError } = useActionRunner();

  const save = useCallback(async () => {
    if (await run(() => saveDay(dayId, draft.toPatch()))) router.back();
  }, [dayId, draft, run]);

  const move = useCallback(
    async (planExerciseId: string, direction: ReorderDirection) => {
      const isMoved = await run(() => reorderExercise({ dayId, planExerciseId, direction }));
      if (isMoved) await reload();
    },
    [dayId, run, reload],
  );

  return { status, detail, reload, draft, save, move, isSaving: isRunning, hasError };
}
