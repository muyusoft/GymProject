import { listPrimaryMusclesFor } from "@/shared/db/queries/exercise.queries";
import { listDoneSetCounts } from "@/shared/db/queries/session.queries";
import type { DayMuscleLoad } from "../utils/warmup-selection.utils";
import { muscleLoad, type PrimaryMuscle } from "../utils/warmup-plan.utils";

/** Músculos principales de los ejercicios del día, para elegir el calentamiento y la aproximación. */
export async function loadPrimaryMuscles(exerciseIds: readonly string[]): Promise<PrimaryMuscle[]> {
  const rows = await listPrimaryMusclesFor(exerciseIds);
  return rows.map(({ exerciseId, muscleGroup }) => ({ exerciseId, group: muscleGroup }));
}

/** Lo que se trabajó de verdad en la sesión (series hechas), para elegir los estiramientos. */
export async function loadWorkedLoad(sessionId: string): Promise<DayMuscleLoad> {
  const counts = await listDoneSetCounts(sessionId);
  const muscles = await loadPrimaryMuscles(counts.map((count) => count.exerciseId));
  return muscleLoad(counts, muscles);
}
