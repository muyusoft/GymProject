import type { WeightUnit } from "@/shared/types/training.types";
import { oneRepMaxKg, toValidSet } from "@/shared/utils/one-rep-max.utils";
import type { LoggedSetRow } from "../types/progress.types";

export interface RecentRecord {
  exerciseId: string;
  nameEs: string;
  nameEn: string;
  date: string;
  weight: number;
  unit: WeightUnit;
  reps: number;
}

/**
 * Los récords más recientes, uno por ejercicio: de las series marcadas como récord se toma la de la
 * última fecha (y, de ellas, la de mayor 1RM estimado).
 */
export function recentRecords(rows: readonly LoggedSetRow[], limit: number): RecentRecord[] {
  const best = new Map<string, { record: RecentRecord; estimate: number }>();
  for (const row of rows) {
    const valid = row.isPR ? toValidSet({ ...row, completed: true }) : null;
    if (!valid) continue;
    const estimate = oneRepMaxKg(valid);
    const current = best.get(row.exerciseId);
    const isNewer = !current || row.date > current.record.date;
    const isBetter = current && row.date === current.record.date && estimate > current.estimate;
    if (isNewer || isBetter) {
      best.set(row.exerciseId, {
        estimate,
        record: {
          exerciseId: row.exerciseId,
          nameEs: row.nameEs,
          nameEn: row.nameEn,
          date: row.date,
          weight: valid.weight,
          unit: valid.unit,
          reps: valid.reps,
        },
      });
    }
  }
  return [...best.values()]
    .sort((a, b) => b.record.date.localeCompare(a.record.date) || b.estimate - a.estimate)
    .slice(0, limit)
    .map((entry) => entry.record);
}
