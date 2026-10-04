import { MUSCLE_GROUPS, type MuscleGroup } from "@/shared/types/training.types";
import type { MuscleLink } from "../types/muscles.types";

/** Método fraccional (Pelland et al.): cada serie suma 1 al grupo principal y 0.5 al secundario. */
export const PRIMARY_SET_WEIGHT = 1;
export const SECONDARY_SET_WEIGHT = 0.5;

export type GroupSets = Record<MuscleGroup, number>;

export function emptyGroupSets(): GroupSets {
  return Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0])) as GroupSets;
}

/** Series de la semana por grupo muscular; `sets` son las series completadas (una entrada por serie). */
export function weeklySetsByGroup(sets: readonly { exerciseId: string }[], links: readonly MuscleLink[]): GroupSets {
  const linksByExercise = new Map<string, MuscleLink[]>();
  for (const link of links) {
    linksByExercise.set(link.exerciseId, [...(linksByExercise.get(link.exerciseId) ?? []), link]);
  }
  const totals = emptyGroupSets();
  for (const set of sets) {
    const weightByGroup = new Map<MuscleGroup, number>();
    for (const link of linksByExercise.get(set.exerciseId) ?? []) {
      const weight = link.role === "primary" ? PRIMARY_SET_WEIGHT : SECONDARY_SET_WEIGHT;
      weightByGroup.set(link.group, Math.max(weightByGroup.get(link.group) ?? 0, weight));
    }
    for (const [group, weight] of weightByGroup) totals[group] += weight;
  }
  return totals;
}

export interface GroupTotal {
  group: MuscleGroup;
  sets: number;
}

/** De más a menos series; a igualdad, el orden anatómico de MUSCLE_GROUPS. */
export function rankGroups(totals: GroupSets): GroupTotal[] {
  return MUSCLE_GROUPS.map((group) => ({ group, sets: totals[group] })).sort((a, b) => b.sets - a.sets);
}

export type VolumeTier = "high" | "mid" | "low";

const HIGH_RATIO = 0.75;
const MID_RATIO = 0.4;

/** Alto: cerca del máximo; medio; bajo: lo que queda atrás. Se muestra siempre junto al número. */
export function volumeTier(sets: number, max: number): VolumeTier {
  if (max <= 0) return "low";
  const ratio = sets / max;
  if (ratio >= HIGH_RATIO) return "high";
  return ratio >= MID_RATIO ? "mid" : "low";
}

export interface BalanceInsight {
  top: MuscleGroup;
  low: MuscleGroup[];
  /** Cuántas veces más series tiene el grupo principal que los más rezagados (entero). */
  ratio: number;
}

const MIN_BALANCE_RATIO = 2;
const LOW_COUNT = 2;
const MIN_GROUPS_FOR_BALANCE = LOW_COUNT + 1;

/** Aviso cuando el grupo con más series duplica o más a los dos más rezagados (entre los que tienen series). */
export function balanceInsight(totals: GroupSets): BalanceInsight | null {
  const worked = rankGroups(totals).filter((item) => item.sets > 0);
  if (worked.length < MIN_GROUPS_FOR_BALANCE) return null;
  const [top] = worked;
  const low = worked.slice(-LOW_COUNT);
  if (!top) return null;
  const average = low.reduce((sum, item) => sum + item.sets, 0) / low.length;
  const ratio = Math.round(top.sets / average);
  return ratio >= MIN_BALANCE_RATIO ? { top: top.group, low: low.map((item) => item.group), ratio } : null;
}
