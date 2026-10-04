import type { MuscleGroup } from "@/shared/types/training.types";
import { formatClock } from "@/shared/utils/duration.utils";
import { formatWeight } from "@/shared/utils/weight.utils";
import type { DayExercise, DaySession, MuscleLink } from "../types/muscles.types";

const MS_PER_MINUTE = 60_000;
const SEPARATOR = " · ";

/**
 * Un vínculo por grupo con lo que hizo el día: principal si algún ejercicio lo trabajó como principal,
 * y la vista de los ejercicios (si difieren, las dos). Solo cuentan los ejercicios hechos ese día.
 */
export function mergeDayLinks(links: readonly MuscleLink[], exerciseIds: ReadonlySet<string>): MuscleLink[] {
  const byGroup = new Map<MuscleGroup, MuscleLink>();
  for (const link of links) {
    if (!exerciseIds.has(link.exerciseId)) continue;
    const current = byGroup.get(link.group);
    if (!current) {
      byGroup.set(link.group, link);
      continue;
    }
    byGroup.set(link.group, {
      ...current,
      role: current.role === "primary" || link.role === "primary" ? "primary" : "secondary",
      view: current.view === link.view ? current.view : "both",
      basis: current.basis === "measured" || link.basis === "measured" ? "measured" : "described",
      sourceIds: [...new Set([...current.sourceIds, ...link.sourceIds])],
    });
  }
  return [...byGroup.values()];
}

/** Minutos entrenados ese día, sumando todas las sesiones. */
export function sessionMinutes(sessions: readonly DaySession[]): number {
  const total = sessions.reduce((sum, session) => sum + Math.max(0, session.endedAt - session.startedAt), 0);
  return Math.round(total / MS_PER_MINUTE);
}

/** "4 × 12 · 30 lb": series hechas × reps de la serie más pesada y su peso; por tiempo, la duración. */
export function summarizeDayExercise(exercise: DayExercise, locale: string): string {
  const [first, ...rest] = exercise.sets;
  if (!first) return "";
  const heaviest = rest.reduce((top, set) => ((set.weight ?? 0) > (top.weight ?? 0) ? set : top), first);
  const work = heaviest.loadType === "time" ? formatClock(heaviest.seconds ?? 0) : String(heaviest.reps ?? 0);
  const weight =
    heaviest.weight !== null && heaviest.weight > 0
      ? formatWeight({ value: heaviest.weight, unit: heaviest.unit, locale })
      : null;
  return [`${exercise.sets.length} × ${work}`, weight].filter((part): part is string => part !== null).join(SEPARATOR);
}

export function hasRecord(exercise: DayExercise): boolean {
  return exercise.sets.some((set) => set.isPR);
}
