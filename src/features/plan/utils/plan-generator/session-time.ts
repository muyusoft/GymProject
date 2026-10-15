import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import type {
  DayTemplate,
  ExperienceLevel,
  GeneratedDay,
  GeneratedExercise,
  PlanAnswers,
} from "../../types/plan-generator.types";
import type { ExercisePicker } from "./exercise-picker";
import { MIN_SETS, prescribe } from "./prescription";
import { capFor, weeklySets, type CapOptions } from "./volume";

/** Margen alrededor del tiempo pedido: la estimación ya redondea a 5 minutos. */
const TOLERANCE_MINUTES = 5;
/** Un día nunca queda con menos ejercicios que esto al recortar por tiempo. */
const MIN_KEPT_EXERCISES = 3;
const MAX_COMPOUND_SETS: Record<ExperienceLevel, number> = { beginner: 3, intermediate: 4, advanced: 5 };

/** Complementos por tipo de día, para llenar el tiempo: primero lo que el día todavía no trabaja. */
const ACCESSORY_PATTERNS: Record<DayTemplate, readonly string[]> = {
  fullA: ["elbow_flexion", "elbow_extension", "calf_standing"],
  fullB: ["lateral_raise", "knee_flexion", "core"],
  fullC: ["hip_thrust", "elbow_flexion", "elbow_extension"],
  upperA: ["lateral_raise", "rear_delt", "fly", "core"],
  upperB: ["elbow_flexion", "fly", "core"],
  lowerA: ["hip_thrust", "hip_adduction", "hip_abduction"],
  lowerB: ["hinge_rdl", "hip_adduction", "hip_abduction"],
  push: ["dip", "elbow_extension", "core"],
  pull: ["elbow_flexion", "horizontal_pull", "core"],
};

interface FillContext extends CapOptions {
  picker: ExercisePicker;
  answers: PlanAnswers;
}

const minutesOf = (day: GeneratedDay) => estimateDurationMinutes(day.exercises);

/** ¿Cabe esta carga extra sin que ninguno de sus músculos pase su tope semanal? */
function fitsCap(days: readonly GeneratedDay[], extra: GeneratedExercise, context: FillContext): boolean {
  const totals = weeklySets([...days, { weekday: -1, template: "fullA", exercises: [extra] }], context.lookup);
  return (context.lookup.get(extra.exerciseId) ?? []).every(
    ({ group }) => (totals.get(group) ?? 0) <= capFor(group, context),
  );
}

function addAccessory(days: GeneratedDay[], day: GeneratedDay, context: FillContext): boolean {
  const present = new Set(day.exercises.map((exercise) => exercise.pattern));
  for (const pattern of ACCESSORY_PATTERNS[day.template].filter((candidate) => !present.has(candidate))) {
    const exercise = context.picker.pick(pattern);
    const prescribed = exercise ? prescribe(exercise, context.answers) : null;
    if (prescribed && fitsCap(days, prescribed, context)) {
      day.exercises.push(prescribed);
      return true;
    }
  }
  return false;
}

function addCompoundSet(days: GeneratedDay[], day: GeneratedDay, context: FillContext): boolean {
  const target = day.exercises.find(
    (exercise) =>
      exercise.isCompound &&
      exercise.sets < MAX_COMPOUND_SETS[context.experience] &&
      fitsCap(days, { ...exercise, sets: 1 }, context),
  );
  if (target) target.sets += 1;
  return target !== undefined;
}

/** Quita lo último que sobra: series de aislamiento, después aislamientos enteros, al final series de compuestos. */
function trimOnce(day: GeneratedDay): boolean {
  const isolation = [...day.exercises].reverse().find((exercise) => !exercise.isCompound && exercise.sets > MIN_SETS);
  if (isolation) {
    isolation.sets -= 1;
    return true;
  }
  const lastIsolation = [...day.exercises].reverse().find((exercise) => !exercise.isCompound);
  if (lastIsolation && day.exercises.length > MIN_KEPT_EXERCISES) {
    day.exercises.splice(day.exercises.indexOf(lastIsolation), 1);
    return true;
  }
  const compound = [...day.exercises].reverse().find((exercise) => exercise.sets > MIN_SETS);
  if (compound) compound.sets -= 1;
  return compound !== undefined;
}

function fitDay(days: GeneratedDay[], day: GeneratedDay, context: FillContext): void {
  const target = context.answers.minutes;
  while (minutesOf(day) < target - TOLERANCE_MINUTES) {
    if (!addAccessory(days, day, context) && !addCompoundSet(days, day, context)) break;
  }
  let isTrimming = minutesOf(day) > target + TOLERANCE_MINUTES;
  while (isTrimming) isTrimming = trimOnce(day) && minutesOf(day) > target + TOLERANCE_MINUTES;
}

/**
 * Acerca cada día al tiempo pedido: si sobra tiempo agrega complementos y series, si falta recorta. Nunca
 * pasa el tope semanal por músculo, así que para quien empieza un día largo puede quedar más corto.
 */
export function fitToSessionTime(days: GeneratedDay[], context: FillContext): GeneratedDay[] {
  const result = days.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) }));
  for (const day of result) fitDay(result, day, context);
  return result;
}

export function isShortOfTime(days: readonly GeneratedDay[], minutes: number): boolean {
  return days.some((day) => minutesOf(day) < minutes - TOLERANCE_MINUTES);
}
