import type { MuscleGroup, MuscleRole } from "@/shared/types/training.types";
import type {
  CatalogExercise,
  ExperienceLevel,
  GeneratedDay,
  GeneratedExercise,
  PlanFocus,
} from "../../types/plan-generator.types";
import { MIN_SETS } from "./prescription";
import { REGION_MUSCLES } from "./templates";

export type MuscleLookup = ReadonlyMap<string, CatalogExercise["muscles"]>;

/** Igual que en el resto de la app (pelland2024): una serie cuenta entera para el principal y media para el secundario. */
const ROLE_WEIGHT: Record<MuscleRole, number> = { primary: 1, secondary: 0.5 };

/** Tope de series semanales por músculo (schoenfeld2017); los músculos priorizados pueden pasarlo un poco. */
const WEEKLY_CAP: Record<ExperienceLevel, number> = { beginner: 12, intermediate: 16, advanced: 20 };
const PRIORITY_ALLOWANCE = 4;
/** Cota de seguridad del bucle de recorte: cada vuelta quita una serie. */
const MAX_TRIMS = 200;

export function weeklySets(days: readonly GeneratedDay[], lookup: MuscleLookup): Map<MuscleGroup, number> {
  const totals = new Map<MuscleGroup, number>();
  for (const exercise of days.flatMap((day) => day.exercises)) {
    for (const { group, role } of lookup.get(exercise.exerciseId) ?? []) {
      totals.set(group, (totals.get(group) ?? 0) + exercise.sets * ROLE_WEIGHT[role]);
    }
  }
  return totals;
}

function primaryGroups(exercise: GeneratedExercise, lookup: MuscleLookup): MuscleGroup[] {
  return (lookup.get(exercise.exerciseId) ?? []).flatMap((muscle) => (muscle.role === "primary" ? [muscle.group] : []));
}

/** Prioridad: una serie más en cada ejercicio cuyo músculo principal es de la zona elegida. */
export function applyFocus(days: GeneratedDay[], focus: PlanFocus, lookup: MuscleLookup): GeneratedDay[] {
  if (focus === "balanced") return days;
  const region = REGION_MUSCLES[focus];
  return days.map((day) => ({
    ...day,
    exercises: day.exercises.map((exercise) =>
      primaryGroups(exercise, lookup).some((group) => region.has(group))
        ? { ...exercise, sets: exercise.sets + 1 }
        : exercise,
    ),
  }));
}

export interface CapOptions {
  experience: ExperienceLevel;
  focus: PlanFocus;
  lookup: MuscleLookup;
}

export function capFor(group: MuscleGroup, { experience, focus }: CapOptions): number {
  const isPriority = focus !== "balanced" && REGION_MUSCLES[focus].has(group);
  return WEEKLY_CAP[experience] + (isPriority ? PRIORITY_ALLOWANCE : 0);
}

function touches(exercise: GeneratedExercise, group: MuscleGroup, lookup: MuscleLookup): boolean {
  return (lookup.get(exercise.exerciseId) ?? []).some((muscle) => muscle.group === group);
}

/**
 * A qué ejercicio quitarle una serie para bajar ese músculo: primero aislamiento, después compuestos, siempre
 * sin bajar del mínimo y empezando por el último de la semana.
 */
function trimmable(days: GeneratedDay[], group: MuscleGroup, lookup: MuscleLookup): GeneratedExercise | undefined {
  const candidates = days
    .flatMap((day) => day.exercises)
    .filter((exercise) => exercise.sets > MIN_SETS && touches(exercise, group, lookup))
    .reverse();
  return candidates.find((exercise) => !exercise.isCompound) ?? candidates[0];
}

/** Ejercicios mínimos por día: por debajo, el día deja de tener sentido y se prefiere pasar un poco el tope. */
const MIN_DAY_EXERCISES = 4;

/** Último recurso cuando todo está en el mínimo de series: quitar un aislamiento de ese músculo. */
function removable(days: GeneratedDay[], group: MuscleGroup, lookup: MuscleLookup): GeneratedDay | undefined {
  return [...days]
    .reverse()
    .find(
      (day) =>
        day.exercises.length > MIN_DAY_EXERCISES &&
        day.exercises.some((exercise) => !exercise.isCompound && primaryGroups(exercise, lookup).includes(group)),
    );
}

function removeIsolation(days: GeneratedDay[], group: MuscleGroup, lookup: MuscleLookup): boolean {
  const day = removable(days, group, lookup);
  if (!day) return false;
  const isTarget = (exercise: GeneratedExercise) => !exercise.isCompound && primaryGroups(exercise, lookup).includes(group);
  const index = day.exercises.length - 1 - [...day.exercises].reverse().findIndex(isTarget);
  day.exercises.splice(index, 1);
  return true;
}

/** Una vuelta de recorte: una serie menos, o un aislamiento menos. false si ya no hay nada que hacer. */
function trimOnce(days: GeneratedDay[], options: CapOptions): boolean {
  const over = [...weeklySets(days, options.lookup)].filter(([group, sets]) => sets > capFor(group, options));
  for (const [group] of over) {
    const exercise = trimmable(days, group, options.lookup);
    if (exercise) {
      exercise.sets -= 1;
      return true;
    }
  }
  return over.some(([group]) => removeIsolation(days, group, options.lookup));
}

/**
 * Si un músculo pasa su tope semanal se le quitan series (aislamiento primero, nunca bajo el mínimo) y, si
 * no alcanza, ejercicios de aislamiento. Los compuestos se quedan: son la base del plan.
 */
export function capVolume(days: GeneratedDay[], options: CapOptions): GeneratedDay[] {
  const result = days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) }));
  let trims = 0;
  while (trims < MAX_TRIMS && trimOnce(result, options)) trims += 1;
  return result;
}
