import { useCallback, useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { loadDaySummary, type DaySummaryData } from "../services/day-summary.service";
import type { MuscleLink } from "../types/muscles.types";
import { mergeDayLinks, sessionMinutes } from "../utils/day-summary.utils";
import { rankGroups, weeklySetsByGroup, type GroupTotal } from "../utils/muscle-volume.utils";

interface DaySummaryState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  data: DaySummaryData | null;
  /** Un vínculo por grupo trabajado ese día, para la figura. */
  dayLinks: MuscleLink[];
  /** Series del día por grupo (1 principal, 0.5 secundario), de más a menos. */
  groups: GroupTotal[];
  minutes: number;
}

export function useDaySummary(date: string): DaySummaryState {
  const loader = useCallback(() => loadDaySummary(date), [date]);
  const { status, data, reload } = useFocusResource(loader);

  const derived = useMemo(() => {
    if (!data) return { dayLinks: [], groups: [], minutes: 0 };
    const exerciseIds = new Set(data.exercises.map((exercise) => exercise.exerciseId));
    return {
      dayLinks: mergeDayLinks(data.links, exerciseIds),
      groups: rankGroups(weeklySetsByGroup(data.setEntries, data.links)).filter((item) => item.sets > 0),
      minutes: sessionMinutes(data.sessions),
    };
  }, [data]);

  return { status, reload, data, ...derived };
}
