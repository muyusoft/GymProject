import { useCallback, useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadRecovery, type RecoveryData } from "../services/recovery.service";
import { groupByState, todayInsight, type StateGroups, type TodayInsight } from "../utils/recovery-view.utils";

interface RecoveryState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  data: RecoveryData | null;
  states: StateGroups | null;
  insight: TodayInsight | null;
}

export function useRecovery(): RecoveryState {
  const loader = useCallback(() => loadRecovery(Date.now()), []);
  const { status, data, reload } = useFocusResource(loader);

  const states = useMemo(() => (data ? groupByState(data.recoveries) : null), [data]);
  const insight = useMemo(
    () => (data?.today ? todayInsight(data.today.groups, data.recoveries) : null),
    [data],
  );

  return { status, reload, data, states, insight };
}
