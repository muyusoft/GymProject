import { subDays } from "date-fns";
import { roundToIncrement } from "@/shared/utils/weight.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { SessionResult } from "@/shared/types/history.types";
import { topWeight } from "@/shared/utils/progression.utils";

export const STAGNATION_WEEKS = 3;
export const DELOAD_FACTOR = 0.6;
const DAYS_PER_WEEK = 7;
const MIN_RECENT_SESSIONS = 2;

interface Best {
  weight: number;
  reps: number;
}

function bestOf(result: SessionResult): Best | null {
  const weight = topWeight(result);
  if (weight === null) return null;
  const reps = result.sets
    .filter((set) => set.completed && set.weight === weight)
    .reduce((max, set) => Math.max(max, set.reps ?? 0), 0);
  return { weight, reps };
}

function beats(candidate: Best, reference: Best): boolean {
  return candidate.weight > reference.weight || (candidate.weight === reference.weight && candidate.reps > reference.reps);
}

interface StagnationOptions {
  history: readonly SessionResult[];
  today: Date;
}

/**
 * Regla de producto: sin mejorar peso ni reps en 3 semanas.
 * Compara las sesiones de las últimas 3 semanas (mínimo 2) con la última anterior a esa ventana.
 */
export function isStagnated({ history, today }: StagnationOptions): boolean {
  const windowStart = toIsoDate(subDays(today, STAGNATION_WEEKS * DAYS_PER_WEEK));
  const recent = history.filter((session) => session.date >= windowStart);
  const baselineSession = history.find((session) => session.date < windowStart);
  const baseline = baselineSession && bestOf(baselineSession);
  if (!baseline || recent.length < MIN_RECENT_SESSIONS) return false;
  return !recent.some((session) => {
    const best = bestOf(session);
    return best !== null && beats(best, baseline);
  });
}

interface DeloadOptions extends StagnationOptions {
  step: number;
}

/** Una semana al 60% del último peso máximo, redondeada al salto del equipo; null si no hay estancamiento. */
export function suggestDeload({ history, today, step }: DeloadOptions): number | null {
  if (!isStagnated({ history, today })) return null;
  const latest = history[0];
  const weight = latest ? topWeight(latest) : null;
  if (weight === null) return null;
  return roundToIncrement(weight * DELOAD_FACTOR, step);
}
