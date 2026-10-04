import { and, eq, inArray } from "drizzle-orm";
import { Directory, File } from "expo-file-system";
import { db } from "@/shared/db/client";
import { getAllSettings } from "@/shared/db/queries/settings.queries";
import {
  equipmentIncrements,
  exercises,
  planDays,
  planExercises,
  plans,
  sessions,
  setLogs,
  settings,
} from "@/shared/db/schema";
import { syncReminders } from "@/shared/services/reminders.service";
import { useSettingsStore } from "@/shared/store";
import { SETTING_KEYS } from "@/shared/types/settings.types";
import { chunk } from "@/shared/utils/chunk.utils";
import { isOneOf } from "@/shared/utils/guard.utils";
import type { BackupData, BackupExercise, BackupFile, BackupSummary } from "../types/backup.types";
import {
  backupFileName,
  buildBackup,
  parseBackup,
  pickUserSettings,
  resolveExercises,
  summarizeBackup,
} from "../utils/backup.utils";

const BATCH_SIZE = 50;
const ID_BATCH_SIZE = 500;
const KNOWN_SETTING_KEYS = Object.values(SETTING_KEYS).filter((key) => key !== SETTING_KEYS.seeded);

const exerciseColumns = {
  id: exercises.id,
  sourceId: exercises.sourceId,
  nameEs: exercises.nameEs,
  nameEn: exercises.nameEn,
  pattern: exercises.pattern,
  equipment: exercises.equipment,
  defaultLoadType: exercises.defaultLoadType,
};

/** Solo los ejercicios a los que apunta el plan o el historial; el resto del catálogo se siembra solo. */
async function loadReferencedExercises(ids: readonly string[]): Promise<BackupExercise[]> {
  const found: BackupExercise[] = [];
  for (const part of chunk(ids, ID_BATCH_SIZE)) {
    found.push(...(await db.select(exerciseColumns).from(exercises).where(inArray(exercises.id, part))));
  }
  return found;
}

export async function collectBackupData(): Promise<BackupData> {
  const [allSettings, increments, planRows, dayRows, planExerciseRows, sessionRows, logRows] = await Promise.all([
    getAllSettings(),
    db.select().from(equipmentIncrements),
    db.select().from(plans),
    db.select().from(planDays),
    db.select().from(planExercises),
    db.select().from(sessions),
    db.select().from(setLogs),
  ]);
  const referenced = new Set([...planExerciseRows, ...logRows].map((row) => row.exerciseId));
  return {
    settings: pickUserSettings(allSettings),
    equipmentIncrements: increments,
    exercises: await loadReferencedExercises([...referenced]),
    plans: planRows,
    planDays: dayRows,
    planExercises: planExerciseRows,
    sessions: sessionRows,
    setLogs: logRows,
  };
}

/** El selector de carpeta del sistema rechaza la promesa si la persona cancela. */
function isCancellation(error: unknown): boolean {
  return error instanceof Error && /cancel/i.test(error.message);
}

export interface ExportResult {
  fileName: string;
  summary: BackupSummary;
}

/** Guarda un JSON con todo el plan y el historial en la carpeta que elija la persona; null si cancela. */
export async function exportBackup(now: Date): Promise<ExportResult | null> {
  try {
    const directory = await Directory.pickDirectoryAsync();
    const file = buildBackup(await collectBackupData(), now);
    const fileName = backupFileName(now);
    await directory.createFile(fileName, "application/json").write(JSON.stringify(file));
    return { fileName, summary: summarizeBackup(file) };
  } catch (error) {
    if (isCancellation(error)) return null;
    throw error;
  }
}

/** Abre el selector de archivos y valida el respaldo; null si cancela, BackupError si no sirve. */
export async function pickBackup(): Promise<BackupFile | null> {
  try {
    const picked = await File.pickFileAsync({ mimeTypes: "*/*" });
    if (picked.canceled) return null;
    return parseBackup(await picked.result.text());
  } catch (error) {
    if (isCancellation(error)) return null;
    throw error;
  }
}

async function insertInBatches<Row>(rows: readonly Row[], insert: (part: Row[]) => Promise<unknown>): Promise<void> {
  for (const part of chunk(rows, BATCH_SIZE)) await insert(part);
}

/**
 * Reemplaza el plan y el historial por los del respaldo, en una transacción: o entra todo o no cambia nada.
 * Los ejercicios del catálogo se vinculan por su id de origen o por nombre; los que no existen se crean.
 */
export async function restoreBackup(file: BackupFile): Promise<BackupSummary> {
  const { data } = file;
  await db.transaction(async (tx) => {
    const known = await tx
      .select({ id: exercises.id, sourceId: exercises.sourceId, nameEs: exercises.nameEs, nameEn: exercises.nameEn })
      .from(exercises);
    const { idMap, toCreate } = resolveExercises(data.exercises, known);
    const remap = (id: string) => idMap.get(id) ?? id;

    await insertInBatches(toCreate, (part) =>
      tx.insert(exercises).values(part.map((item) => ({ ...item, status: "claude_draft" as const }))),
    );
    for (const table of [setLogs, sessions, planExercises, planDays, plans]) await tx.delete(table);
    await insertInBatches(data.plans, (part) => tx.insert(plans).values(part));
    await insertInBatches(data.planDays, (part) => tx.insert(planDays).values(part));
    await insertInBatches(data.planExercises, (part) =>
      tx.insert(planExercises).values(part.map((row) => ({ ...row, exerciseId: remap(row.exerciseId) }))),
    );
    await insertInBatches(data.sessions, (part) => tx.insert(sessions).values(part));
    await insertInBatches(data.setLogs, (part) =>
      tx.insert(setLogs).values(part.map((row) => ({ ...row, exerciseId: remap(row.exerciseId) }))),
    );

    for (const { equipment, unit, step } of data.equipmentIncrements) {
      await tx
        .update(equipmentIncrements)
        .set({ step })
        .where(and(eq(equipmentIncrements.equipment, equipment), eq(equipmentIncrements.unit, unit)));
    }
    for (const [key, value] of Object.entries(data.settings)) {
      if (!isOneOf(KNOWN_SETTING_KEYS, key)) continue;
      await tx.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
    }
  });

  await useSettingsStore.getState().hydrate();
  void syncReminders();
  return summarizeBackup(file);
}
