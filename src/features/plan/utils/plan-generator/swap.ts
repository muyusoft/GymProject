import type { GymEquipment } from "@/shared/types/equipment.types";
import { canPerform } from "@/shared/utils/equipment-requirements.utils";
import type {
  CatalogExercise,
  GeneratedPlan,
  PlanAnswers,
} from "../../types/plan-generator.types";
import { prescribe } from "./prescription";

/** Un ejercicio del plan propuesto: el día (0 = lunes) y su posición en ese día. */
export interface PlanSlot {
  weekday: number;
  index: number;
}

/**
 * Con qué se puede cambiar un ejercicio de la vista previa: otros del mismo patrón (mismos músculos con
 * fuente), que se puedan hacer con el equipo y que no estén ya en ese día.
 */
export function alternativesFor(
  plan: GeneratedPlan,
  slot: PlanSlot,
  catalog: readonly CatalogExercise[],
  equipment: readonly GymEquipment[],
): CatalogExercise[] {
  const day = plan.days.find((candidate) => candidate.weekday === slot.weekday);
  const current = day?.exercises[slot.index];
  if (!day || !current) return [];
  const available = new Set(equipment);
  const inDay = new Set(day.exercises.map((exercise) => exercise.exerciseId));
  return catalog.filter(
    (exercise) =>
      exercise.pattern === current.pattern &&
      exercise.muscles.length > 0 &&
      !inDay.has(exercise.id) &&
      canPerform(exercise.requires, available),
  );
}

/** El plan con ese ejercicio cambiado. Conserva las series (ya ajustadas a la prioridad y al tiempo). */
export function swapExercise(
  plan: GeneratedPlan,
  slot: PlanSlot,
  replacement: CatalogExercise,
  answers: PlanAnswers,
): GeneratedPlan {
  return {
    ...plan,
    days: plan.days.map((day) =>
      day.weekday !== slot.weekday
        ? day
        : {
            ...day,
            exercises: day.exercises.map((exercise, index) =>
              index === slot.index ? { ...prescribe(replacement, answers), sets: exercise.sets } : exercise,
            ),
          },
    ),
  };
}
