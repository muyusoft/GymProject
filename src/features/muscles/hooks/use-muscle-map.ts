import { useCallback, useMemo } from "react";
import { useFocusResource, type ResourceStatus } from "@/shared/hooks/use-focus-resource";
import { startOfWeekMonday } from "@/shared/utils/week.utils";
import { loadMuscleMap } from "../services/muscle-map.service";
import {
  computeStreak,
  nextPendingDay,
  type PendingDay,
} from "../utils/consistency.utils";
import {
  balanceInsight,
  rankGroups,
  weeklySetsByGroup,
  type BalanceInsight,
  type GroupTotal,
} from "../utils/muscle-volume.utils";

export interface MuscleMapView {
  /** Lunes de la semana en curso. */
  weekStart: Date;
  ranking: GroupTotal[];
  maxSets: number;
  balance: BalanceInsight | null;
  /** Lo que necesita el calendario de constancia para armar cualquier mes. */
  sessionDates: string[];
  plannedWeekdays: number[];
  today: Date;
  streak: number;
  pending: PendingDay | null;
}

interface MuscleMapState {
  status: ResourceStatus;
  reload: () => Promise<void>;
  view: MuscleMapView | null;
}

export function useMuscleMap(): MuscleMapState {
  const loader = useCallback(() => loadMuscleMap(new Date()), []);
  const { status, data, reload } = useFocusResource(loader);

  const view = useMemo((): MuscleMapView | null => {
    if (!data) return null;
    const totals = weeklySetsByGroup(data.weekSets, data.links);
    const ranking = rankGroups(totals);
    const consistency = { sessionDates: data.sessionDates, plannedWeekdays: data.plannedWeekdays, today: data.today };
    return {
      weekStart: startOfWeekMonday(data.today),
      ranking,
      maxSets: ranking[0]?.sets ?? 0,
      balance: balanceInsight(totals),
      ...consistency,
      streak: computeStreak(consistency),
      pending: nextPendingDay(consistency),
    };
  }, [data]);

  return { status, reload, view };
}
