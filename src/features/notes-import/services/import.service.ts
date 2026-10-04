import { and, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { exercises, planDays, planExercises, plans, sessions, setLogs } from "@/shared/db/schema";
import type { PlanDayRow, PlanRow } from "@/shared/db/types";
import { syncReminders } from "@/shared/services/reminders.service";
import type { WeightUnit } from "@/shared/types/training.types";
import { estimateDurationMinutes } from "@/shared/utils/duration.utils";
import { chunk } from "@/shared/utils/chunk.utils";
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

const INSERT_BATCH_SIZE = 50;

// La transacción de Drizzle con expo-sqlite es síncrona: todo lo de adentro usa .run()/.get()/.all(), sin await.

function ensurePlan(tx: Tx, name: string): PlanRow {
  const existing = tx.select().from(plans).limit(1).get();
  if (existing) return existing;
  const created = tx.insert(plans).values({ id: generateId(), name, repeatsWeekly: true }).returning().get();
  if (!created) throw new Error("Plan was not created");
  return created;
}

function ensureDay(tx: Tx, plan: PlanRow, weekday: number, name: string): PlanDayRow {
  const existing = tx
    .select()
    .from(planDays)
    .where(and(eq(planDays.planId, plan.id), eq(planDays.weekday, weekday)))
    .get();
  if (existing) return existing;
  const created = tx
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
    .returning()
    .get();
  if (!created) throw new Error("Plan day was not created");
  return created;
}

/** Vincula al catálogo o crea el ejercicio nuevo una sola vez por nombre dentro de la importación. */
function resolveExerciseId(tx: Tx, line: ImportLine, created: Map<string, string>): string {
  if (line.exerciseId) return line.exerciseId;
  const key = normalizeName(line.parsed.name);
  const known = created.get(key);
  if (known) return known;
  const id = generateId();
  tx.insert(exercises).values(buildCustomExerciseRow(line.parsed, id)).run();
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
function saveTemplate({ tx, day, defaultUnit, created }: DayContext, lines: readonly ImportLine[]): string[] {
  const existing = tx.select().from(planExercises).where(eq(planExercises.planDayId, day.id)).all();
  let nextOrder = existing.reduce((max, row) => Math.max(max, row.order + 1), 0);
  const exerciseIds: string[] = [];

  for (const line of lines) {
    const exerciseId = resolveExerciseId(tx, line, created);
    exerciseIds.push(exerciseId);
    const current = existing.find((row) => row.exerciseId === exerciseId);
    const row = buildPlanExerciseRow({
      line: line.parsed,
      planDayId: day.id,
      exerciseId,
      order: current?.order ?? nextOrder,
      unit: defaultUnit,
    });
    if (current) {
      tx.update(planExercises).set(row).where(eq(planExercises.id, current.id)).run();
    } else {
      tx.insert(planExercises).values({ id: generateId(), ...row }).run();
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
function saveSession({ tx, day, defaultUnit, importDay, exerciseIds }: SessionContext): boolean {
  const date = toIsoDate(importDay.date);
  const existing = tx
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.planDayId, day.id), eq(sessions.date, date), eq(sessions.origin, "import")))
    .get();
  if (existing) return false;

  const minutes = estimateDurationMinutes(
    importDay.lines.map(({ parsed }) => ({
      sets: parsed.sets,
      restSec: parsed.restSec ?? FALLBACK_REST_SEC,
      seconds: parsed.seconds,
    })),
  );
  const sessionId = generateId();
  tx.insert(sessions)
    .values({ id: sessionId, planDayId: day.id, date, origin: "import", ...buildSessionTimes(importDay.date, minutes) })
    .run();
  const rows = importDay.lines.flatMap(({ parsed }, index) =>
    buildSetLogRows({ line: parsed, sessionId, exerciseId: exerciseIds[index] ?? "", unit: defaultUnit, createId: generateId }),
  );
  for (const part of chunk(rows, INSERT_BATCH_SIZE)) tx.insert(setLogs).values(part).run();
  return true;
}

/**
 * Guarda cada día como plantilla del plan y, si la fecha ya pasó, como sesión hecha.
 * Todo en una transacción: o entra todo o no entra nada.
 */
export async function importDays({ days, defaultUnit, planName, dayName, now }: ImportOptions): Promise<ImportResult> {
  const result = db.transaction((tx) => {
    const plan = ensurePlan(tx, planName);
    const created = new Map<string, string>();
    const totals: ImportResult = { exercises: 0, sessions: 0 };

    for (const importDay of days) {
      const day = ensureDay(tx, plan, importDay.weekday, dayName(importDay.weekday));
      const context = { tx, day, defaultUnit, created };
      const exerciseIds = saveTemplate(context, importDay.lines);
      totals.exercises += exerciseIds.length;
      if (importDay.date.getTime() <= now.getTime() && saveSession({ ...context, importDay, exerciseIds })) {
        totals.sessions += 1;
      }
    }
    return totals;
  });
  void syncReminders();
  return result;
}
