import { eq } from "drizzle-orm";
import { db, transact } from "@/shared/db/client";
import { recordDeletions } from "@/shared/db/queries/deletion.queries";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { sessions, setLogs } from "@/shared/db/schema";
import { chunk } from "@/shared/utils/chunk.utils";
import { generateId } from "@/shared/utils/id.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { SessionSet } from "../types/workout.types";
import {
  lastPerformance,
  withLastWeight,
} from "../utils/last-performance.utils";
import {
  buildInitialSets,
  nextSetValues,
  type NewSetLog,
} from "../utils/session-plan.utils";
import { buildTemplate } from "../utils/template.utils";
import { listDayExercises } from "./day-exercises.service";
import { loadHistory } from "./history.service";
import { findActiveSession } from "./session-read.service";

const INSERT_BATCH_SIZE = 50;

interface StartSessionOptions {
  dayId: string;
  now: Date;
}

async function buildSessionSets(
  sessionId: string,
  { dayId, now }: StartSessionOptions,
) {
  const [details, increments] = await Promise.all([
    listDayExercises(dayId, toIsoDate(now)),
    listIncrements(),
  ]);
  const history = await loadHistory(
    details.map((detail) => detail.exercise.id),
    now.getTime(),
  );
  return details.flatMap((detail): NewSetLog[] => {
    const exerciseHistory = history.get(detail.exercise.id) ?? [];
    const template = withLastWeight(
      buildTemplate({
        planExercise: detail.planExercise,
        equipment: detail.exercise.equipment,
        increments,
      }),
      lastPerformance(exerciseHistory[0]),
    );
    return buildInitialSets({
      sessionId,
      exerciseId: detail.exercise.id,
      template,
      createId: generateId,
      latest: exerciseHistory[0],
    });
  });
}

/** Crea la sesión de hoy con todas sus series pendientes; si ya hay una abierta, la reanuda. */
export async function startSession(
  options: StartSessionOptions,
): Promise<string> {
  const date = toIsoDate(options.now);
  const existing = await findActiveSession(options.dayId, date);
  if (existing) return existing;

  const sessionId = generateId();
  const rows = await buildSessionSets(sessionId, options);
  // Transacción síncrona (expo-sqlite): sin await adentro, cada sentencia con .run().
  db.transaction((tx) => {
    tx.insert(sessions)
      .values({
        id: sessionId,
        planDayId: options.dayId,
        date,
        startedAt: options.now.getTime(),
        origin: "app",
      })
      .run();
    for (const part of chunk(rows, INSERT_BATCH_SIZE))
      tx.insert(setLogs).values(part).run();
  });
  return sessionId;
}

export type SetPatch = Partial<
  Pick<SessionSet, "weight" | "reps" | "seconds" | "completed" | "isPR" | "rpe">
>;

export async function updateSet(id: string, patch: SetPatch): Promise<void> {
  await db.update(setLogs).set(patch).where(eq(setLogs.id, id));
}

interface AddSetOptions {
  sessionId: string;
  exerciseId: string;
  last: SessionSet | undefined;
  template: Parameters<typeof nextSetValues>[1];
}

export async function addSet({
  sessionId,
  exerciseId,
  last,
  template,
}: AddSetOptions): Promise<SessionSet> {
  const values = nextSetValues(last, template);
  const index = (last?.index ?? -1) + 1;
  const id = generateId();
  await db.insert(setLogs).values({
    id,
    sessionId,
    exerciseId,
    setIndex: index,
    completed: false,
    isPR: false,
    ...values,
  });
  return { id, index, completed: false, isPR: false, rpe: null, ...values };
}

/** Descarta una sesión empezada por error: se borra con todas sus series (cascada) y el borrado queda anotado. */
export function cancelSession(sessionId: string): Promise<void> {
  return transact((tx) => {
    recordDeletions(tx, "sessions", [sessionId]);
    tx.delete(sessions).where(eq(sessions.id, sessionId)).run();
  });
}

export async function finishSession(
  sessionId: string,
  now: Date,
): Promise<void> {
  await db
    .update(sessions)
    .set({ endedAt: now.getTime() })
    .where(eq(sessions.id, sessionId));
}
