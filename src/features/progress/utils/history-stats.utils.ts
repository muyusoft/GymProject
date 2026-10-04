import type { UnitPreference, WeightUnit } from "@/shared/types/training.types";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { ExerciseSession, SessionBest } from "../types/progress.types";

export const MIN_TREND_SESSIONS = 4;

export interface HistoryStats {
  oneRepMaxKg: number;
  bestSet: SessionBest;
  /** Volumen medio por sesión, en kg. */
  averageVolumeKg: number;
}

export function historyStats(sessions: readonly ExerciseSession[]): HistoryStats | null {
  const [first, ...rest] = sessions;
  if (!first) return null;
  const bestSet = [first, ...rest].reduce((top, session) => (session.best.oneRepMaxKg > top.oneRepMaxKg ? session.best : top), first.best);
  const totalVolume = sessions.reduce((sum, session) => sum + session.volumeKg, 0);
  return { oneRepMaxKg: bestSet.oneRepMaxKg, bestSet, averageVolumeKg: totalVolume / sessions.length };
}

interface SummaryOptions {
  session: ExerciseSession;
  locale: string;
}

/** "4 × 12 · 30 kg": series hechas × reps de la mejor serie y su peso. */
export function formatSessionSummary({ session, locale }: SummaryOptions): string {
  const weight = formatWeight({ value: session.best.weight, unit: session.best.unit, locale });
  return `${session.completedSets} × ${session.best.reps} · ${weight}`;
}

/** La unidad elegida en Ajustes; con "según ejercicio" se usa la de la última marca registrada. */
export function pickDisplayUnit(preference: UnitPreference, latest: WeightUnit | undefined): WeightUnit {
  if (preference === "kg" || preference === "lb") return preference;
  return latest ?? "kg";
}
