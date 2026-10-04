import { addWeeks, subWeeks } from "date-fns";
import type { LoadType, WeightUnit } from "@/shared/types/training.types";
import { convertWeight } from "@/shared/utils/weight.utils";
import { startOfWeekMonday, toIsoDate } from "@/shared/utils/week.utils";

interface VolumeSet {
  date?: string;
  weight: number | null;
  unit: WeightUnit;
  reps: number | null;
  loadType: LoadType;
}

/**
 * Volumen en kg = peso × reps. Regla de producto: por brazo cuenta los dos brazos (×2);
 * peso corporal y tiempo no suman porque no tienen peso cargado.
 */
export function setVolumeKg({ weight, unit, reps, loadType }: VolumeSet): number {
  if (weight === null || reps === null || weight <= 0 || reps <= 0) return 0;
  const arms = loadType === "per_arm" ? 2 : 1;
  return convertWeight(weight, unit, "kg") * reps * arms;
}

interface WeeklyOptions {
  sets: readonly (VolumeSet & { date: string })[];
  now: Date;
}

export function weeklyVolumes({ sets, now }: WeeklyOptions): { current: number; previous: number } {
  const weekStart = startOfWeekMonday(now);
  const bounds = {
    previous: toIsoDate(subWeeks(weekStart, 1)),
    current: toIsoDate(weekStart),
    end: toIsoDate(addWeeks(weekStart, 1)),
  };
  let current = 0;
  let previous = 0;
  for (const set of sets) {
    if (set.date >= bounds.current && set.date < bounds.end) current += setVolumeKg(set);
    else if (set.date >= bounds.previous && set.date < bounds.current) previous += setVolumeKg(set);
  }
  return { current, previous };
}
