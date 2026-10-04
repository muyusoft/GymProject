import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { exerciseMuscles, exercises, planDays, sessions, setLogs } from "@/shared/db/schema";
import type { DayExercise, DaySession, MuscleLink } from "../types/muscles.types";
import { toMuscleLink } from "../utils/exercise-muscles.utils";

export interface DaySummaryData {
  date: string;
  sessions: DaySession[];
  /** En el orden en que se hicieron. */
  exercises: DayExercise[];
  links: MuscleLink[];
  /** Una entrada por serie completada, para contar series por músculo. */
  setEntries: { exerciseId: string }[];
}

async function loadSessions(date: string): Promise<DaySession[]> {
  const rows = await db
    .select({ id: sessions.id, dayName: planDays.name, startedAt: sessions.startedAt, endedAt: sessions.endedAt })
    .from(sessions)
    .leftJoin(planDays, eq(sessions.planDayId, planDays.id))
    .where(and(eq(sessions.date, date), isNotNull(sessions.endedAt)))
    .orderBy(asc(sessions.startedAt));
  return rows.flatMap((row) => (row.endedAt === null ? [] : [{ ...row, endedAt: row.endedAt }]));
}

function groupByExercise(rows: Awaited<ReturnType<typeof loadSetRows>>): DayExercise[] {
  const byExercise = new Map<string, DayExercise>();
  for (const { exerciseId, nameEs, nameEn, ...set } of rows) {
    const entry = byExercise.get(exerciseId) ?? { exerciseId, nameEs, nameEn, sets: [] };
    entry.sets.push(set);
    byExercise.set(exerciseId, entry);
  }
  return [...byExercise.values()];
}

function loadSetRows(sessionIds: string[]) {
  return db
    .select({
      exerciseId: setLogs.exerciseId,
      nameEs: exercises.nameEs,
      nameEn: exercises.nameEn,
      weight: setLogs.weight,
      unit: setLogs.unit,
      reps: setLogs.reps,
      seconds: setLogs.seconds,
      loadType: setLogs.loadType,
      isPR: setLogs.isPR,
    })
    .from(setLogs)
    .innerJoin(exercises, eq(setLogs.exerciseId, exercises.id))
    .innerJoin(sessions, eq(setLogs.sessionId, sessions.id))
    .where(and(inArray(setLogs.sessionId, sessionIds), eq(setLogs.completed, true)))
    .orderBy(asc(sessions.startedAt), asc(setLogs.setIndex));
}

/** Lo que se hizo un día (yyyy-MM-dd): sesiones terminadas, ejercicios con sus series hechas y sus músculos. */
export async function loadDaySummary(date: string): Promise<DaySummaryData> {
  const daySessions = await loadSessions(date);
  if (daySessions.length === 0) return { date, sessions: [], exercises: [], links: [], setEntries: [] };

  const rows = await loadSetRows(daySessions.map((session) => session.id));
  const exerciseIds = [...new Set(rows.map((row) => row.exerciseId))];
  const linkRows =
    exerciseIds.length > 0
      ? await db.select().from(exerciseMuscles).where(inArray(exerciseMuscles.exerciseId, exerciseIds))
      : [];

  return {
    date,
    sessions: daySessions,
    exercises: groupByExercise(rows),
    links: linkRows.map(toMuscleLink),
    setEntries: rows.map((row) => ({ exerciseId: row.exerciseId })),
  };
}
