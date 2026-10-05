import type {
  LoggedSet,
  ProgressionTarget,
  SessionResult,
} from "@/shared/types/history.types";
import { LIMIT_RPE, rpeToEffort, type EffortLevel } from "./effort.utils";

/** Sin respuesta de esfuerzo hacen falta dos sesiones completas; con ella basta la última. */
export const REQUIRED_SESSIONS = 2;
export const REQUIRED_SESSIONS_WITH_EFFORT = 1;
export const RPE_LIMIT = LIMIT_RPE;

interface IncreaseOptions {
  /** Sesiones terminadas del ejercicio, de la más nueva a la más vieja. */
  history: readonly SessionResult[];
  target: ProgressionTarget;
  /** Salto mínimo del equipo, en la unidad del ejercicio. */
  step: number;
  trackRpe: boolean;
}

function completedSets(result: SessionResult): LoggedSet[] {
  return result.sets.filter((set) => set.completed);
}

/** Todas las series planeadas hechas, con peso y con al menos las reps objetivo. */
export function isSessionComplete(
  result: SessionResult,
  target: ProgressionTarget,
): boolean {
  const done = completedSets(result);
  return (
    done.length >= target.sets &&
    done.every((set) => set.weight !== null && (set.reps ?? 0) >= target.reps)
  );
}

export function topWeight(result: SessionResult): number | null {
  const weights = completedSets(result).flatMap((set) =>
    set.weight === null ? [] : [set.weight],
  );
  return weights.length > 0 ? Math.max(...weights) : null;
}

export function averageRpe(result: SessionResult): number | null {
  const values = completedSets(result).flatMap((set) =>
    set.rpe === null ? [] : [set.rpe],
  );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Peso común si todas las series de todas las sesiones se hicieron igual (misma carga y unidad). */
function sharedWeight(sessions: readonly SessionResult[]): number | null {
  const sets = sessions.flatMap(completedSets);
  const first = sets[0];
  if (!first || first.weight === null) return null;
  const isSame = sets.every(
    (set) => set.weight === first.weight && set.unit === first.unit,
  );
  return isSame ? first.weight : null;
}

/** Cómo se sintió la última sesión, si la pregunta de esfuerzo está activa y se respondió. */
function latestEffort(
  latest: SessionResult | undefined,
  trackRpe: boolean,
): EffortLevel | null {
  if (!trackRpe || !latest) return null;
  return rpeToEffort(averageRpe(latest));
}

function isTooHard(
  latest: SessionResult | undefined,
  trackRpe: boolean,
): boolean {
  return latestEffort(latest, trackRpe) === "limit";
}

/**
 * Regla de producto: sugerir peso + salto del equipo cuando las últimas sesiones se completaron al mismo peso.
 * Si la última tiene respuesta de esfuerzo, decide ella: al límite no se sugiere; con repeticiones en reserva
 * basta esa sesión. Sin respuesta hacen falta las 2 últimas.
 */
export function suggestIncrease({
  history,
  target,
  step,
  trackRpe,
}: IncreaseOptions): number | null {
  const effort = latestEffort(history[0], trackRpe);
  if (effort === "limit") return null;
  const required =
    effort === null ? REQUIRED_SESSIONS : REQUIRED_SESSIONS_WITH_EFFORT;
  const recent = history.slice(0, required);
  if (recent.length < required) return null;
  if (!recent.every((session) => isSessionComplete(session, target)))
    return null;
  const weight = sharedWeight(recent);
  return weight === null ? null : weight + step;
}

/** Con solo la última sesión completa: el peso que se sugerirá la próxima vez si hoy también se completa. */
export function previewIncrease(options: IncreaseOptions): number | null {
  const { history, target, step, trackRpe } = options;
  const latest = history[0];
  if (!latest || suggestIncrease(options) !== null) return null;
  if (!isSessionComplete(latest, target) || isTooHard(latest, trackRpe))
    return null;
  const weight = sharedWeight([latest]);
  return weight === null ? null : weight + step;
}
