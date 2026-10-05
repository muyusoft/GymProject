import { eq, inArray } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listPlanExercisesByDay } from "@/shared/db/queries/plan-exercise.queries";
import { exerciseSwaps, exercises } from "@/shared/db/schema";
import { applySwaps, type DayExercise } from "../utils/swap.utils";

const substituteColumns = {
  id: exercises.id,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  equipment: exercises.equipment,
};

/** Los ejercicios del día del plan tal como se entrenan en esa fecha: con las sustituciones de ese día aplicadas. */
export async function listDayExercises(dayId: string, date: string): Promise<DayExercise[]> {
  const [details, swaps] = await Promise.all([
    listPlanExercisesByDay(dayId),
    db.select().from(exerciseSwaps).where(eq(exerciseSwaps.date, date)),
  ]);
  if (swaps.length === 0) return applySwaps(details, [], new Map());

  const ids = swaps.map((swap) => swap.exerciseId);
  const rows = await db.select(substituteColumns).from(exercises).where(inArray(exercises.id, ids));
  return applySwaps(details, swaps, new Map(rows.map((row) => [row.id, row])));
}
