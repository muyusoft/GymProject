import { transact, type Transaction } from "@/shared/db/client";
import {
  listAllExerciseMuscles,
  listPatternExercises,
} from "@/shared/db/queries/exercise.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import { planDays, planExercises, plans } from "@/shared/db/schema";
import { syncReminders } from "@/shared/services/reminders.service";
import type { WeightUnit } from "@/shared/types/training.types";
import { parseRequirements } from "@/shared/utils/equipment-requirements.utils";
import { generateId } from "@/shared/utils/id.utils";
import { serializeProgressionRule } from "@/shared/utils/progression-rule.utils";
import type {
  CatalogExercise,
  DayTemplate,
  GeneratedDay,
  GeneratedExercise,
  GeneratedPlan,
} from "../types/plan-generator.types";
import { loadTypeUsesWeight } from "../utils/exercise-config.utils";

/** Valores del día cuando no tiene ejercicios (el catálogo no tuvo ninguno para sus patrones). */
const EMPTY_DAY_DEFAULTS = { sets: 3, reps: 10, restSec: 90 };

/** El catálogo que puede usar el generador: ejercicios con patrón y sus músculos con fuente. */
export async function loadGeneratorCatalog(): Promise<CatalogExercise[]> {
  const [rows, muscles] = await Promise.all([listPatternExercises(), listAllExerciseMuscles()]);
  return rows.flatMap((row) =>
    row.pattern === null
      ? []
      : [
          {
            id: row.id,
            nameEs: row.nameEs,
            nameEn: row.nameEn,
            pattern: row.pattern,
            equipment: row.equipment,
            loadType: row.defaultLoadType,
            requires: parseRequirements(row.requires),
            muscles: muscles
              .filter((muscle) => muscle.exerciseId === row.id)
              .map((muscle) => ({ group: muscle.muscleGroup, role: muscle.role })),
          },
        ],
  );
}

interface SaveOptions {
  plan: GeneratedPlan;
  planName: string;
  dayNames: Record<DayTemplate, string>;
  unit: WeightUnit;
}

function insertExercises(tx: Transaction, dayId: string, exercises: readonly GeneratedExercise[], unit: WeightUnit) {
  exercises.forEach((exercise, order) => {
    tx.insert(planExercises)
      .values({
        id: generateId(),
        planDayId: dayId,
        exerciseId: exercise.exerciseId,
        order,
        sets: exercise.sets,
        reps: exercise.reps,
        seconds: exercise.seconds,
        restSec: exercise.restSec,
        // El peso lo define la primera sesión; 0 deja claro que hay peso que poner y que lleva unidad.
        targetWeight: loadTypeUsesWeight(exercise.loadType) ? 0 : null,
        unit,
        loadType: exercise.loadType,
        progressionRule: serializeProgressionRule({
          enabled: true,
          sessions: 2,
          ...(exercise.repsMin === null ? {} : { repsMin: exercise.repsMin }),
        }),
      })
      .run();
  });
}

function insertDay(tx: Transaction, planId: string, day: GeneratedDay, options: SaveOptions) {
  const dayId = generateId();
  const first = day.exercises[0];
  tx.insert(planDays)
    .values({
      id: dayId,
      planId,
      weekday: day.weekday,
      name: options.dayNames[day.template],
      order: day.weekday,
      defaultSets: first?.sets ?? EMPTY_DAY_DEFAULTS.sets,
      defaultReps: first?.reps ?? EMPTY_DAY_DEFAULTS.reps,
      defaultRestSec: first?.restSec ?? EMPTY_DAY_DEFAULTS.restSec,
    })
    .run();
  insertExercises(tx, dayId, day.exercises, options.unit);
}

/** El plan donde guardar: uno nuevo, o el que existe si todavía no tiene días. null si ya tiene días. */
async function targetPlanId(): Promise<string | null | undefined> {
  const existing = await findActivePlan();
  if (!existing) return undefined;
  return (await listPlanDays(existing.id)).length === 0 ? existing.id : null;
}

/**
 * Guarda el plan generado como un plan normal, todo o nada. Si ya hay un plan vacío (por ejemplo, creado
 * desde cero por error) se llena ese; un plan con días no se toca.
 */
export async function saveGeneratedPlan(options: SaveOptions): Promise<void> {
  const target = await targetPlanId();
  if (target === null) throw new Error("A plan with days already exists");
  await transact((tx) => {
    const planId = target ?? generateId();
    if (target === undefined)
      tx.insert(plans).values({ id: planId, name: options.planName, repeatsWeekly: true }).run();
    for (const day of options.plan.days) insertDay(tx, planId, day, options);
  });
  void syncReminders();
}
