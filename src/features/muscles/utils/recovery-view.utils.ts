import type { SemanticColors } from "@/design/tokens";
import type { MuscleGroup } from "@/shared/types/training.types";
import type { GroupPaintMap } from "@/shared/utils/body-map.utils";
import type { GroupRecovery, RecoveryCause, RecoveryState } from "../types/muscles.types";
import { readyMoment } from "./ready-moment.utils";

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

/** Una línea de la lista: grupos trabajados el mismo día, con el mismo porcentaje, motivo y momento de estar listos. */
export interface RecoveryLine {
  /** Estable entre renders, para la lista y para abrir su detalle. */
  key: string;
  groups: MuscleGroup[];
  /** Fin de la sesión más reciente de la línea; null si no hay registro. */
  workedAt: number | null;
  /** Entero 0-100, solo si la línea lo muestra. */
  percent: number | null;
  /** 0 a 1 del grupo menos recuperado, para la barra. */
  progress: number;
  /** Horas que pide la sesión que limita; null sin registro. */
  requiredHours: number | null;
  /** Horas de una sesión al límite (por eso tarda más); null si no fue al límite. */
  hardHours: number | null;
  /** Cuándo estará listo el último grupo de la línea; null si ya lo está. */
  readyAt: number | null;
  /** Los ejercicios que dejaron así a estos grupos, sin repetir. */
  causes: RecoveryCause[];
}

interface LineOptions {
  now: number;
  /** "Recuperando" muestra el porcentaje; "Recién trabajado", no. */
  withPercent: boolean;
}

function dayKey(timestamp: number | null, now: number): string {
  if (timestamp === null) return "none";
  const day = relativeDay(timestamp, now);
  return day.kind === "daysAgo" ? String(day.days) : day.kind;
}

function readyKey(readyAt: number | null, now: number): string {
  if (readyAt === null) return "none";
  const moment = readyMoment(readyAt, now);
  return `${moment.day}-${new Date(readyAt).getDay()}-${moment.band}`;
}

function maxOf(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

function addCause(causes: readonly RecoveryCause[], cause: RecoveryCause | null): RecoveryCause[] {
  if (!cause || causes.some((item) => item.exerciseId === cause.exerciseId)) return [...causes];
  return [...causes, cause];
}

function emptyLine(key: string, item: GroupRecovery, percent: number | null): RecoveryLine {
  const hardHours = item.isHard ? item.requiredHours : null;
  return { key, groups: [], workedAt: null, percent, progress: 1, requiredHours: null, hardHours, readyAt: null, causes: [] };
}

function addToLine(line: RecoveryLine, item: GroupRecovery): RecoveryLine {
  return {
    ...line,
    groups: [...line.groups, item.group],
    workedAt: maxOf(line.workedAt, item.lastWorkedAt),
    progress: Math.min(line.progress, item.percent),
    requiredHours: maxOf(line.requiredHours, item.requiredHours),
    readyAt: maxOf(line.readyAt, item.readyAt),
    causes: addCause(line.causes, item.cause),
  };
}

/** Ordena primero lo menos recuperado y, a igual porcentaje, lo más reciente. */
function byPercentThenRecent(a: RecoveryLine, b: RecoveryLine): number {
  return (a.percent ?? 0) - (b.percent ?? 0) || (b.workedAt ?? 0) - (a.workedAt ?? 0);
}

/**
 * Separa los grupos de un estado por día trabajado, porcentaje (si se muestra), motivo y momento de estar
 * listos: así cada línea dice su propio "hoy" o "ayer" y su propio "listo el jue por la tarde".
 */
export function recoveryLines(items: readonly GroupRecovery[], { now, withPercent }: LineOptions): RecoveryLine[] {
  const lines = new Map<string, RecoveryLine>();
  for (const item of items) {
    const percent = withPercent ? Math.round(item.percent * PERCENT) : null;
    const hardHours = item.isHard ? item.requiredHours : null;
    const key = [dayKey(item.lastWorkedAt, now), percent, hardHours, readyKey(item.readyAt, now)].join("|");
    lines.set(key, addToLine(lines.get(key) ?? emptyLine(key, item, percent), item));
  }
  return [...lines.values()].sort(byPercentThenRecent);
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

interface TodayPlan {
  /** Grupos principales del día de hoy. */
  groups: readonly MuscleGroup[];
  /** El entreno de hoy ya se terminó: el aviso ya no sirve para decidir nada. */
  isDone: boolean;
}

/** Los grupos que toca hoy y aún no están al 100%; null si todo está listo, no hay entreno o ya se hizo. */
export function todayInsight(today: TodayPlan, recoveries: readonly GroupRecovery[]): TodayInsight | null {
  if (today.isDone) return null;
  const pending = recoveries.filter((item) => today.groups.includes(item.group) && item.percent < 1);
  const [limiting] = [...pending].sort((a, b) => a.percent - b.percent);
  if (!limiting) return null;
  return {
    groups: pending.map((item) => item.group),
    percent: Math.round(limiting.percent * PERCENT),
    cause: limiting.cause,
    causeAt: limiting.lastWorkedAt,
  };
}
