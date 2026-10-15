import type { MuscleGroup, SessionMinutes } from "@/shared/types/training.types";
import { STRETCH_MOVEMENTS, WARMUP_MOVEMENTS } from "../data/movements";
import type { Movement } from "../types/warmup.types";

/** Series por músculo del día; sale de exercise_muscles. */
export type DayMuscleLoad = Partial<Record<MuscleGroup, number>>;
export type DayRegion = "lower" | "upper" | "full";

/** Cuántos movimientos caben según el tiempo de la sesión (regla de producto). */
export const WARMUP_COUNT: Record<SessionMinutes, number> = { 30: 3, 45: 4, 60: 5, 75: 6 };
export const STRETCH_COUNT: Record<SessionMinutes, number> = { 30: 2, 45: 3, 60: 4, 75: 4 };

const LOWER_GROUPS: readonly MuscleGroup[] = ["quadriceps", "hamstring", "gluteal", "adductors", "calves"];
const NEUTRAL_GROUPS: ReadonlySet<MuscleGroup> = new Set(["abs", "obliques"]);
const DOMINANT_SHARE = 2 / 3;
const MAIN_REGION_SHARE = 0.75;
const MAX_BAND_MOVES = 2;
const BAND_PRIORITY = 1000;

function share(load: DayMuscleLoad, groups: readonly MuscleGroup[]): number {
  return groups.reduce((sum, group) => sum + (load[group] ?? 0), 0);
}

/** Inferior o superior si ese lado lleva al menos 2/3 de las series; el core no inclina la balanza. */
export function dayRegion(load: DayMuscleLoad): DayRegion {
  const entries = Object.entries(load) as [MuscleGroup, number][];
  const counted = entries.filter(([group]) => !NEUTRAL_GROUPS.has(group));
  const total = counted.reduce((sum, [, sets]) => sum + sets, 0);
  if (total === 0) return "full";
  const lower = share(load, LOWER_GROUPS) / total;
  if (lower >= DOMINANT_SHARE) return "lower";
  if (lower <= 1 - DOMINANT_SHARE) return "upper";
  return "full";
}

/** Más alto = trabaja más los músculos del día; con banda, la versión con banda va primero. */
function rank(movements: readonly Movement[], load: DayMuscleLoad, hasBand: boolean): Movement[] {
  const score = (movement: Movement) =>
    share(load, movement.targets) + (movement.needsBand && hasBand ? BAND_PRIORITY : 0);
  return movements
    .filter((movement) => hasBand || !movement.needsBand)
    .map((movement, index) => ({ movement, index, value: score(movement) }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(({ movement }) => movement);
}

interface PickState {
  picked: Movement[];
  bandCount: number;
}

function takeInto(state: PickState, candidates: readonly Movement[], count: number): void {
  let taken = 0;
  for (const movement of candidates) {
    if (taken === count) return;
    if (movement.needsBand && state.bandCount === MAX_BAND_MOVES) continue;
    state.picked.push(movement);
    state.bandCount += movement.needsBand ? 1 : 0;
    taken += 1;
  }
}

export interface WarmupRequest {
  load: DayMuscleLoad;
  minutes: SessionMinutes;
  hasBand: boolean;
}

/** Uno general y el resto repartido entre la región principal del día (3/4) y la otra. */
export function pickWarmup({ load, minutes, hasBand }: WarmupRequest): readonly Movement[] {
  const slots = WARMUP_COUNT[minutes] - 1;
  const region = dayRegion(load);
  const mainShare = region === "full" ? 1 / 2 : MAIN_REGION_SHARE;
  const main = region === "upper" ? "upper" : "lower";
  const other = main === "upper" ? "lower" : "upper";
  const mainSlots = Math.ceil(slots * mainShare);
  const state: PickState = { picked: [], bandCount: 0 };
  takeInto(state, WARMUP_MOVEMENTS.filter((movement) => movement.region === "general"), 1);
  takeInto(state, rank(WARMUP_MOVEMENTS.filter((movement) => movement.region === main), load, hasBand), mainSlots);
  takeInto(state, rank(WARMUP_MOVEMENTS.filter((movement) => movement.region === other), load, hasBand), slots - mainSlots);
  return state.picked;
}

/** Los que estiran lo trabajado y uno general para espalda o cadera al final; si faltan, se completa en orden. */
export function pickStretches(load: DayMuscleLoad, minutes: SessionMinutes): readonly Movement[] {
  const count = STRETCH_COUNT[minutes];
  const worked = rank(STRETCH_MOVEMENTS.filter((movement) => movement.region !== "general"), load, false)
    .filter((movement) => share(load, movement.targets) > 0)
    .slice(0, count - 1);
  const general = STRETCH_MOVEMENTS.filter((movement) => movement.region === "general");
  const rest = [...new Set([...general, ...STRETCH_MOVEMENTS])].filter((movement) => !worked.includes(movement));
  return [...worked, ...rest.slice(0, count - worked.length)];
}
