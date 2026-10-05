import { useCallback, useMemo, useState } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { useSettingsStore } from "@/shared/store";
import { loadProgress } from "../services/progress.service";
import type { ProgressRange } from "../types/progress.types";
import { buildProgressView, type ProgressView } from "../utils/progress-view.utils";

interface ProgressState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  view: ProgressView | null;
  range: ProgressRange;
  setRange: (range: ProgressRange) => void;
  selectedId: string | null;
  select: (exerciseId: string) => void;
}

export function useProgress(): ProgressState {
  const loader = useCallback(() => loadProgress(new Date()), []);
  const { status, data, reload } = useFocusResource(loader);
  const preference = useSettingsStore((state) => state.weightUnit);
  const [range, setRange] = useState<ProgressRange>("quarter");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(
    () => (data ? buildProgressView({ data, range, preference, selectedId }) : null),
    [data, range, preference, selectedId],
  );

  return {
    status,
    reload,
    view,
    range,
    setRange,
    selectedId: view?.featured?.exerciseId ?? null,
    select: setSelectedId,
  };
}
