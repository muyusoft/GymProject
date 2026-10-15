import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "../client";
import { exerciseMuscles, exercises } from "../schema";
import type { ExerciseMuscleRow } from "../types";

const exerciseSummary = {
  id: exercises.id,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  aliases: exercises.aliases,
  equipment: exercises.equipment,
  defaultLoadType: exercises.defaultLoadType,
};

export type ExerciseSummary = {
  id: string;
  nameEs: string;
  nameEn: string;
  aliases: string;
  equipment: (typeof exercises.$inferSelect)["equipment"];
  defaultLoadType: (typeof exercises.$inferSelect)["defaultLoadType"];
};

export async function listExercises(): Promise<ExerciseSummary[]> {
  return db.select(exerciseSummary).from(exercises);
}

export async function findExercise(id: string): Promise<ExerciseSummary | null> {
  const rows = await db.select(exerciseSummary).from(exercises).where(eq(exercises.id, id));
  return rows[0] ?? null;
}

export async function listPrimaryMuscles(): Promise<ExerciseMuscleRow[]> {
  return db.select().from(exerciseMuscles).where(eq(exerciseMuscles.role, "primary"));
}

/** Músculos principales de varios ejercicios a la vez (calentamiento y estiramientos del día). */
export async function listPrimaryMusclesFor(exerciseIds: readonly string[]): Promise<ExerciseMuscleRow[]> {
  if (exerciseIds.length === 0) return [];
  return db
    .select()
    .from(exerciseMuscles)
    .where(and(eq(exerciseMuscles.role, "primary"), inArray(exerciseMuscles.exerciseId, [...exerciseIds])));
}

export async function listAllExerciseMuscles(): Promise<ExerciseMuscleRow[]> {
  return db.select().from(exerciseMuscles);
}

export async function listMusclesForExercise(
  exerciseId: string,
): Promise<ExerciseMuscleRow[]> {
  return db.select().from(exerciseMuscles).where(eq(exerciseMuscles.exerciseId, exerciseId));
}

/** Ejercicios con patrón de movimiento: los que puede usar el generador de planes. */
export async function listPatternExercises() {
  return db
    .select({
      id: exercises.id,
      nameEs: exercises.nameEs,
      nameEn: exercises.nameEn,
      pattern: exercises.pattern,
      requires: exercises.requires,
      equipment: exercises.equipment,
      defaultLoadType: exercises.defaultLoadType,
    })
    .from(exercises)
    .where(isNotNull(exercises.pattern));
}
