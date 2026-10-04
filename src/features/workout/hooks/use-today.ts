import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useActionRunner } from "@/shared/hooks/use-action-runner";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadToday } from "../services/today.service";
import { startSession } from "../services/session-write.service";
import type { HintKind, ProgressionHintData, TodayView } from "../types/workout.types";
import { useInsightSettings } from "./use-insight-settings";

interface TodayState {
  status: ResourceStatus;
  today: TodayView | null;
  reload: () => Promise<void>;
  hints: ProgressionHintData[];
  dismissHint: (kind: HintKind) => void;
  start: () => Promise<void>;
  isStarting: boolean;
  hasError: boolean;
}

export function useToday(): TodayState {
  const settings = useInsightSettings();
  const loader = useCallback(() => loadToday({ now: new Date(), settings }), [settings]);
  const { status, data, reload } = useFocusResource(loader);
  const [dismissed, setDismissed] = useState<ReadonlySet<HintKind>>(new Set());
  const { run, isRunning, hasError } = useActionRunner();

  const start = useCallback(async () => {
    const dayId = data?.day?.id;
    if (!dayId) return;
    let sessionId = "";
    const isStarted = await run(async () => {
      sessionId = await startSession({ dayId, now: new Date(), settings });
    });
    if (isStarted) router.push({ pathname: "/session/[id]", params: { id: sessionId } });
  }, [data, run, settings]);

  return {
    status,
    today: data,
    reload,
    hints: (data?.hints ?? []).filter((hint) => !dismissed.has(hint.kind)),
    dismissHint: (kind) => setDismissed((current) => new Set(current).add(kind)),
    start,
    isStarting: isRunning,
    hasError,
  };
}
