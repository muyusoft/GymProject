import type { MuscleGroup } from "@/shared/types/training.types";

export const DAY_FOCUSES = ["chest", "back", "shoulder", "legs", "biceps", "triceps", "arms", "core"] as const;
export type DayFocus = (typeof DAY_FOCUSES)[number];

export type DayNameSuggestion = { kind: "focus"; parts: DayFocus[] } | { kind: "fullBody" };

/** Un foco con menos de esta parte de las series del día no entra en el nombre. */
const MIN_SHARE = 0.2;
/** Con más focos que estos, el día se nombra como cuerpo completo. */
const MAX_PARTS = 3;

const FOCUS_BY_GROUP: Record<MuscleGroup, DayFocus> = {
  chest: "chest",
  "upper-back": "back",
  trapezius: "back",
  "lower-back": "back",
  deltoids: "shoulder",
  quadriceps: "legs",
  hamstring: "legs",
  gluteal: "legs",
  adductors: "legs",
  calves: "legs",
  biceps: "biceps",
  triceps: "triceps",
  forearm: "arms",
  abs: "core",
  obliques: "core",
};

export interface NamedExercise {
  sets: number;
  /** Músculos principales con fuente; un ejercicio sin datos no aporta al nombre. */
  primary: readonly MuscleGroup[];
}

/** Series por foco: cada ejercicio suma sus series una vez a cada foco de sus músculos principales. */
function setsByFocus(exercises: readonly NamedExercise[]): Map<DayFocus, number> {
  const totals = new Map<DayFocus, number>();
  for (const { sets, primary } of exercises) {
    for (const focus of new Set(primary.map((group) => FOCUS_BY_GROUP[group]))) {
      totals.set(focus, (totals.get(focus) ?? 0) + sets);
    }
  }
  return totals;
}

/** Bíceps y tríceps juntos (o antebrazo) se nombran "brazos", en el lugar del que más series tenga. */
function mergeArms(parts: readonly DayFocus[]): DayFocus[] {
  const armParts: ReadonlySet<DayFocus> = new Set(["biceps", "triceps", "arms"]);
  const inDay = parts.filter((part) => armParts.has(part));
  if (inDay.length < 2 && !inDay.includes("arms")) return [...parts];
  const merged = parts.map((part) => (armParts.has(part) ? "arms" : part));
  return merged.filter((part, index) => merged.indexOf(part) === index);
}

/**
 * Nombre sugerido para un día según lo que entrena: los focos con más series, del mayor al menor
 * (por ejemplo pecho y tríceps), o cuerpo completo si son muchos. Sin músculos con fuente no sugiere nada.
 */
export function suggestDayName(exercises: readonly NamedExercise[]): DayNameSuggestion | null {
  const totals = setsByFocus(exercises);
  const allSets = [...totals.values()].reduce((sum, sets) => sum + sets, 0);
  if (allSets === 0) return null;
  const ranked = [...totals.entries()]
    .filter(([, sets]) => sets / allSets >= MIN_SHARE)
    .sort((a, b) => b[1] - a[1] || DAY_FOCUSES.indexOf(a[0]) - DAY_FOCUSES.indexOf(b[0]))
    .map(([focus]) => focus);
  const parts = mergeArms(ranked);
  // Muchos focos, o tan repartidos que ninguno destaca: es un día de cuerpo completo.
  const isSpread = parts.length === 0 || parts.length > MAX_PARTS;
  return isSpread ? { kind: "fullBody" } : { kind: "focus", parts };
}
