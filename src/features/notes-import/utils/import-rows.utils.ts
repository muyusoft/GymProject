import type { exercises, planExercises, setLogs } from "@/shared/db/schema";
import type { WeightUnit } from "@/shared/types/training.types";
import type { ParsedLine } from "../types/notes-import.types";

type NewExercise = typeof exercises.$inferInsert;
type NewPlanExerciseRow = typeof planExercises.$inferInsert;
type NewSetLogRow = typeof setLogs.$inferInsert;

export const FALLBACK_REST_SEC = 90;
export const FALLBACK_DAY_DEFAULTS = { sets: 4, reps: 12, restSec: FALLBACK_REST_SEC } as const;

const SESSION_START_HOUR = 12;
const MS_PER_MINUTE = 60_000;

/** Ejercicio nuevo con el nombre escrito: sin patrón no tiene músculos y no se pinta nada. */
export function buildCustomExerciseRow(line: ParsedLine, id: string): NewExercise {
  return {
    id,
    nameEs: line.name,
    nameEn: line.name,
    equipment: "other",
    defaultLoadType: line.loadType,
    status: "claude_draft",
  };
}

interface PlanRowOptions {
  line: ParsedLine;
  planDayId: string;
  exerciseId: string;
  order: number;
  unit: WeightUnit;
}

/** El peso, el descanso y el tipo de carga de las notas pasan a ser la plantilla del ejercicio en ese día. */
export function buildPlanExerciseRow({
  line,
  planDayId,
  exerciseId,
  order,
  unit,
}: PlanRowOptions): Omit<NewPlanExerciseRow, "id"> {
  return {
    planDayId,
    exerciseId,
    order,
    sets: line.sets,
    reps: line.reps,
    seconds: line.seconds,
    restSec: line.restSec ?? FALLBACK_REST_SEC,
    targetWeight: line.weight,
    unit: line.unit ?? unit,
    loadType: line.loadType,
    progressionRule: null,
  };
}

interface SetLogOptions {
  line: ParsedLine;
  sessionId: string;
  exerciseId: string;
  unit: WeightUnit;
  createId: () => string;
}

/** Las notas registran lo que se hizo: todas las series quedan completadas. */
export function buildSetLogRows({ line, sessionId, exerciseId, unit, createId }: SetLogOptions): NewSetLogRow[] {
  return Array.from({ length: line.sets }, (_, setIndex) => ({
    id: createId(),
    sessionId,
    exerciseId,
    setIndex,
    weight: line.weight,
    unit: line.unit ?? unit,
    loadType: line.loadType,
    reps: line.reps,
    seconds: line.seconds,
    completed: true,
    isPR: false,
  }));
}

/** La sesión importada se fecha ese día al mediodía y dura lo estimado. */
export function buildSessionTimes(date: Date, durationMinutes: number): { startedAt: number; endedAt: number } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), SESSION_START_HOUR);
  return { startedAt: start.getTime(), endedAt: start.getTime() + durationMinutes * MS_PER_MINUTE };
}
