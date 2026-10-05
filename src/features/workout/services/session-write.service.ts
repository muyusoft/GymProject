import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { listIncrements } from "@/shared/db/queries/equipment.queries";
import { sessions, setLogs } from "@/shared/db/schema";
import { chunk } from "@/shared/utils/chunk.utils";
import { generateId } from "@/shared/utils/id.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { SessionSet } from "../types/workout.types";
import { buildInsight, type InsightSettings } from "../utils/insight.utils";
import { buildInitialSets, nextSetValues, type NewSetLog } from "../utils/session-plan.utils";
import { buildTemplate } from "../utils/template.utils";
import { listDayExercises } from "./day-exercises.service";
import { loadHistory } from "./history.service";
import { findActiveSession } from "./session-read.service";

const INSERT_BATCH_SIZE = 50;

interface StartSessionOptions {
  dayId: string;
  now: Date;
  settings: InsightSettings;
}

async function buildSessionSets(sessionId: string, { dayId, now, settings }: StartSessionOptions) {
  const [details, increments] = await Promise.all([listDayExercises(dayId, toIsoDate(now)), listIncrements()]);
  const history = await loadHistory(details.map((detail) => detail.exercise.id), now.getTime());
  return details.flatMap((detail): NewSetLog[] => {
    const template = buildTemplate({
      planExercise: detail.planExercise,
      equipment: detail.exercise.equipment,
      increments,
    });
    const insight = buildInsight({
      history: history.get(detail.exercise.id) ?? [],
      template,
      settings,
      today: now,
    });
    return buildInitialSets({
      sessionId,
      exerciseId: detail.exercise.id,
      template,
      insight,
      createId: generateId,
    });
  });
}

/** Crea la sesión de hoy con todas sus series pendientes; si ya hay una abierta, la reanuda. */
export async function startSession(options: StartSessionOptions): Promise<string> {
  const date = toIsoDate(options.now);
  const existing = await findActiveSession(options.dayId, date);
  if (existing) return existing;

  const sessionId = generateId();
  const rows = await buildSessionSets(sessionId, options);
  await db.transaction(async (tx) => {
    await tx.insert(sessions).values({
      id: sessionId,
      planDayId: options.dayId,
      date,
      startedAt: options.now.getTime(),
      origin: "app",
    });
    for (const part of chunk(rows, INSERT_BATCH_SIZE)) {
      await tx.insert(setLogs).values(part);
    }
  });
  return sessionId;
}

export type SetPatch = Partial<Pick<SessionSet, "weight" | "reps" | "seconds" | "completed" | "isPR">>;

export async function updateSet(id: string, patch: SetPatch): Promise<void> {
  await db.update(setLogs).set(patch).where(eq(setLogs.id, id));
}

interface AddSetOptions {
  sessionId: string;
  exerciseId: string;
  last: SessionSet | undefined;
  template: Parameters<typeof nextSetValues>[1];
}

export async function addSet({ sessionId, exerciseId, last, template }: AddSetOptions): Promise<SessionSet> {
  const values = nextSetValues(last, template);
  const index = (last?.index ?? -1) + 1;
  const id = generateId();
  await db
    .insert(setLogs)
    .values({ id, sessionId, exerciseId, setIndex: index, completed: false, isPR: false, ...values });
  return { id, index, completed: false, isPR: false, ...values };
}

export async function finishSession(sessionId: string, now: Date): Promise<void> {
  await db.update(sessions).set({ endedAt: now.getTime() }).where(eq(sessions.id, sessionId));
}
