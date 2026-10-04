import { and, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { exercises, planDays, planExercises, plans, sessions, setLogs } from "@/shared/db/schema";
import type { PlanDayRow, PlanRow } from "@/shared/db/types";
import { syncReminders } from "@/shared/services/reminders.service";
import type { WeightUnit } from "@/shared/types/training.types";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import { generateId } from "@/shared/utils/id.utils";
import { toIsoDate } from "@/shared/utils/week.utils";
import type { ImportDay, ImportLine } from "../types/notes-import.types";
import { normalizeName } from "../utils/normalize.utils";
import {
  buildCustomExerciseRow,
  buildPlanExerciseRow,
  buildSessionTimes,
  buildSetLogRows,
  FALLBACK_DAY_DEFAULTS,
  FALLBACK_REST_SEC,
} from "../utils/import-rows.utils";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface ImportOptions {
  days: readonly ImportDay[];
  defaultUnit: WeightUnit;
  planName: string;
  /** Nombre de un día nuevo, según su día de la semana (0 = lunes). */
  dayName: (weekday: number) => string;
  now: Date;
}

export interface ImportResult {
  exercises: number;
  sessions: number;
}

async function ensurePlan(tx: Tx, name: string): Promise<PlanRow> {
  const [existing] = await tx.select().from(plans).limit(1);
  if (existing) return existing;
  const [created] = await tx.insert(plans).values({ id: generateId(), name, repeatsWeekly: true }).returning();
  if (!created) throw new Error("Plan was not created");
  return created;
}

async function ensureDay(tx: Tx, plan: PlanRow, weekday: number, name: string): Promise<PlanDayRow> {
  const [existing] = await tx
    .select()
    .from(planDays)
    .where(and(eq(planDays.planId, plan.id), eq(planDays.weekday, weekday)));
  if (existing) return existing;
  const [created] = await tx
    .insert(planDays)
    .values({
      id: generateId(),
      planId: plan.id,
      weekday,
      name,
      order: weekday,
      defaultSets: FALLBACK_DAY_DEFAULTS.sets,
      defaultReps: FALLBACK_DAY_DEFAULTS.reps,
      defaultRestSec: FALLBACK_DAY_DEFAULTS.restSec,
    })
    .returning();
  if (!created) throw new Error("Plan day was not created");
  return created;
}

/** Vincula al catálogo o crea el ejercicio nuevo una sola vez por nombre dentro de la importación. */
async function resolveExerciseId(tx: Tx, line: ImportLine, created: Map<string, string>): Promise<string> {
  if (line.exerciseId) return line.exerciseId;
  const key = normalizeName(line.parsed.name);
  const known = created.get(key);
  if (known) return known;
  const id = generateId();
  await tx.insert(exercises).values(buildCustomExerciseRow(line.parsed, id));
  created.set(key, id);
  return id;
}

interface DayContext {
  tx: Tx;
  day: PlanDayRow;
  defaultUnit: WeightUnit;
  created: Map<string, string>;
}

/** Guarda las líneas como plantilla del día: actualiza el ejercicio si ya estaba y agrega al final si no. Nunca borra. */
async function saveTemplate({ tx, day, defaultUnit, created }: DayContext, lines: readonly ImportLine[]): Promise<string[]> {
  const existing = await tx.select().from(planExercises).where(eq(planExercises.planDayId, day.id));
  let nextOrder = existing.reduce((max, row) => Math.max(max, row.order + 1), 0);
  const exerciseIds: string[] = [];

  for (const line of lines) {
    const exerciseId = await resolveExerciseId(tx, line, created);
    exerciseIds.push(exerciseId);
    const current = existing.find((row) => row.exerciseId === exerciseId);
    const row = buildPlanExerciseRow({
      line: line.parsed,
      planDayId: day.id,
      exerciseId,
      order: current?.order ?? nextOrder,
      unit: defaultUnit,
    });
    if (current) await tx.update(planExercises).set(row).where(eq(planExercises.id, current.id));
    else {
      await tx.insert(planExercises).values({ id: generateId(), ...row });
      nextOrder += 1;
    }
  }
  return exerciseIds;
}

interface SessionContext extends DayContext {
  importDay: ImportDay;
  exerciseIds: readonly string[];
}

/** La sesión del día importado, con todas las series hechas; una importación repetida no la duplica. */
async function saveSession({ tx, day, defaultUnit, importDay, exerciseIds }: SessionContext): Promise<boolean> {
  const date = toIsoDate(importDay.date);
  const [existing] = await tx
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.planDayId, day.id), eq(sessions.date, date), eq(sessions.origin, "import")));
  if (existing) return false;

  const minutes = estimateDurationMinutes(
    importDay.lines.map(({ parsed }) => ({
      sets: parsed.sets,
      restSec: parsed.restSec ?? FALLBACK_REST_SEC,
      seconds: parsed.seconds,
    })),
  );
  const sessionId = generateId();
  await tx.insert(sessions).values({ id: sessionId, planDayId: day.id, date, origin: "import", ...buildSessionTimes(importDay.date, minutes) });
  const rows = importDay.lines.flatMap(({ parsed }, index) =>
    buildSetLogRows({ line: parsed, sessionId, exerciseId: exerciseIds[index] ?? "", unit: defaultUnit, createId: generateId }),
  );
  await tx.insert(setLogs).values(rows);
  return true;
}

/**
 * Guarda cada día como plantilla del plan y, si la fecha ya pasó, como sesión hecha.
 * Todo en una transacción: o entra todo o no entra nada.
 */
export async function importDays({ days, defaultUnit, planName, dayName, now }: ImportOptions): Promise<ImportResult> {
  const result = await db.transaction(async (tx) => {
    const plan = await ensurePlan(tx, planName);
    const created = new Map<string, string>();
    const result: ImportResult = { exercises: 0, sessions: 0 };

    for (const importDay of days) {
      const day = await ensureDay(tx, plan, importDay.weekday, dayName(importDay.weekday));
      const context = { tx, day, defaultUnit, created };
      const exerciseIds = await saveTemplate(context, importDay.lines);
      result.exercises += exerciseIds.length;
      if (importDay.date.getTime() <= now.getTime() && (await saveSession({ ...context, importDay, exerciseIds }))) {
        result.sessions += 1;
      }
    }
    return result;
  });
  void syncReminders();
  return result;
}
