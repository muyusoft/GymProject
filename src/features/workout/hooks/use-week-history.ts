import { useMemo } from "react";
import { useFocusResource } from "@/shared/hooks/use-focus-resource";
import { listTrainedDates } from "../services/week-history.service";
import type { WeekStripDay } from "../types/workout.types";
import { buildWeekPages, type WeekPage } from "../utils/week-history.utils";

const NO_DATES: readonly string[] = [];

interface WeekHistoryOptions {
  today: Date;
  currentWeek: readonly WeekStripDay[];
}

interface WeekHistory {
  /** De la semana de la primera sesión a la actual. Mientras cargan las fechas, solo la actual. */
  pages: WeekPage[];
  trainedDates: ReadonlySet<string>;
}

/** Las semanas que se pueden recorrer en Hoy: hasta la primera sesión registrada. */
export function useWeekHistory({ today, currentWeek }: WeekHistoryOptions): WeekHistory {
  const { data } = useFocusResource(listTrainedDates);
  const dates = data ?? NO_DATES;

  return useMemo(
    () => ({ pages: buildWeekPages({ trainedDates: dates, today, currentWeek }), trainedDates: new Set(dates) }),
    [dates, today, currentWeek],
  );
}
