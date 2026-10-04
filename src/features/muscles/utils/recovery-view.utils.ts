import type { SemanticColors } from "@/design/tokens";
import type { MuscleGroup } from "@/shared/types/training.types";
import type { GroupPaintMap } from "@/shared/utils/body-map.utils";
import type { GroupRecovery, RecoveryCause, RecoveryState } from "../types/muscles.types";

const PERCENT = 100;
const MS_PER_DAY = 86_400_000;

export function stateColors(c: SemanticColors): Record<RecoveryState, string> {
  return { worked: c.recoveryWorked, recovering: c.recoveryRecovering, ready: c.recoveryReady };
}

/** Todos los grupos se pintan con el color de su estado; el texto de la lista dice lo mismo sin depender del color. */
export function recoveryPaint(recoveries: readonly GroupRecovery[], c: SemanticColors): GroupPaintMap {
  const colors = stateColors(c);
  return Object.fromEntries(recoveries.map((item) => [item.group, { color: colors[item.state], view: "both" as const }]));
}

export interface StateGroups {
  worked: GroupRecovery[];
  recovering: GroupRecovery[];
  ready: GroupRecovery[];
}

export function groupByState(recoveries: readonly GroupRecovery[]): StateGroups {
  return {
    worked: recoveries.filter((item) => item.state === "worked"),
    recovering: recoveries.filter((item) => item.state === "recovering"),
    ready: recoveries.filter((item) => item.state === "ready"),
  };
}

export interface PercentLine {
  percent: number;
  groups: MuscleGroup[];
}

/** Agrupa los grupos con el mismo porcentaje ("Pecho, espalda alta y bíceps · 65%"), de menos a más recuperado. */
export function groupByPercent(items: readonly GroupRecovery[]): PercentLine[] {
  const lines = new Map<number, MuscleGroup[]>();
  for (const item of items) {
    const percent = Math.round(item.percent * PERCENT);
    lines.set(percent, [...(lines.get(percent) ?? []), item.group]);
  }
  return [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([percent, groups]) => ({ percent, groups }));
}

/** Última vez que se trabajó el grupo con menos recuperación del estado, para el titular de cada fila. */
export function latestWorkedAt(items: readonly GroupRecovery[]): number | null {
  return items.reduce<number | null>(
    (latest, item) => (item.lastWorkedAt === null ? latest : Math.max(latest ?? 0, item.lastWorkedAt)),
    null,
  );
}

export type RelativeDay = { kind: "today" } | { kind: "yesterday" } | { kind: "daysAgo"; days: number };

/** Cuántos días calendario atrás fue (hoy, ayer, hace N días). */
export function relativeDay(timestamp: number, now: number): RelativeDay {
  const startOf = (value: number) => new Date(new Date(value).getFullYear(), new Date(value).getMonth(), new Date(value).getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(timestamp)) / MS_PER_DAY);
  if (days <= 0) return { kind: "today" };
  return days === 1 ? { kind: "yesterday" } : { kind: "daysAgo", days };
}

export interface TodayInsight {
  groups: MuscleGroup[];
  /** Recuperación del grupo más cargado, entero 0-100. */
  percent: number;
  cause: RecoveryCause | null;
  causeAt: number | null;
}

/** Los grupos que toca hoy y aún no están al 100%; null si todo está listo (o no hay entreno). */
export function todayInsight(todayGroups: readonly MuscleGroup[], recoveries: readonly GroupRecovery[]): TodayInsight | null {
  const pending = recoveries.filter((item) => todayGroups.includes(item.group) && item.percent < 1);
  const [limiting] = [...pending].sort((a, b) => a.percent - b.percent);
  if (!limiting) return null;
  return {
    groups: pending.map((item) => item.group),
    percent: Math.round(limiting.percent * PERCENT),
    cause: limiting.cause,
    causeAt: limiting.lastWorkedAt,
  };
}
