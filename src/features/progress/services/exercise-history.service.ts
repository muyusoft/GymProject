import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { findExercise, listMusclesForExercise, type ExerciseSummary } from "@/shared/db/queries/exercise.queries";
import { findActivePlan } from "@/shared/db/queries/plan.queries";
import { listPlanExercisesByPlan } from "@/shared/db/queries/plan-exercise.queries";
import { exercises, planDays, sessions, setLogs } from "@/shared/db/schema";
import type { ProgressionTarget, SessionResult } from "@/shared/types/history.types";
import type { MuscleGroup, MuscleView } from "@/shared/types/training.types";
import { weightStepFor } from "@/shared/utils/equipment.utils";
import type { ExerciseSession, LoggedSetRow } from "../types/progress.types";
import { buildExerciseProgress } from "../utils/exercise-sessions.utils";
import { buildSessionResults, deriveTarget } from "../utils/session-results.utils";
import { loggedSetColumns } from "./progress.service";

export interface ExerciseHistoryData {
  exercise: ExerciseSummary;
  primary: { group: MuscleGroup; view: MuscleView } | null;
  /** Días de la semana (0 = lunes) en que el ejercicio está en el plan. */
  planWeekdays: number[];
  sessions: ExerciseSession[];
  /** Para la regla de subir peso: sesiones terminadas (más nueva primero), lo esperado y el salto del equipo. */
  results: SessionResult[];
  target: ProgressionTarget | null;
  weightStep: number;
}

async function loadSets(exerciseId: string): Promise<{ rows: LoggedSetRow[]; dayNames: Map<string, string> }> {
  const rows = await db
    .select({ ...loggedSetColumns, dayName: planDays.name })
    .from(setLogs)
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .innerJoin(exercises, eq(setLogs.exerciseId, exercises.id))
    .leftJoin(planDays, eq(sessions.planDayId, planDays.id))
    .where(and(eq(setLogs.exerciseId, exerciseId), eq(setLogs.completed, true), isNotNull(sessions.endedAt)))
    .orderBy(desc(sessions.startedAt));
  const dayNames = new Map(rows.flatMap((row) => (row.dayName ? [[row.sessionId, row.dayName] as const] : [])));
  return { rows, dayNames };
}

/** Todo el historial de un ejercicio: un solo historial aunque esté en varios días del plan. */
export async function loadExerciseHistory(exerciseId: string): Promise<ExerciseHistoryData | null> {
  const exercise = await findExercise(exerciseId);
  if (!exercise) return null;

  const plan = await findActivePlan();
  const [{ rows, dayNames }, muscles, inWeek, increments] = await Promise.all([
    loadSets(exerciseId),
    listMusclesForExercise(exerciseId),
    plan ? listPlanExercisesByPlan(plan.id) : Promise.resolve([]),
    listIncrements(),
  ]);
  const planned = inWeek.filter((entry) => entry.planExercise.exerciseId === exerciseId);
  const first = muscles.find((muscle) => muscle.role === "primary");
  const results = buildSessionResults(rows);
  const latestUnit = rows[0]?.unit ?? "kg";

  return {
    exercise,
    primary: first ? { group: first.muscleGroup, view: first.view } : null,
    planWeekdays: [...new Set(planned.map((entry) => entry.weekday))].sort((a, b) => a - b),
    sessions: buildExerciseProgress(rows, dayNames)[0]?.sessions ?? [],
    results,
    target: deriveTarget(planned[0]?.planExercise ?? null, results[0]),
    weightStep: weightStepFor({ increments, equipment: exercise.equipment, unit: latestUnit }),
  };
}
