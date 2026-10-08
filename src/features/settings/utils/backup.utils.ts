import { SETTING_KEYS } from "@/shared/types/settings.types";
import { generateId } from "@/shared/utils/id.utils";
import { normalizeText } from "@/shared/utils/search.utils";
import {
  BACKUP_APP,
  BACKUP_VERSION,
  BackupError,
  type BackupData,
  type BackupExercise,
  type BackupFile,
  type BackupSummary,
} from "../types/backup.types";
import { isBackupData } from "./backup-validation.utils";

const EXCLUDED_SETTINGS: ReadonlySet<string> = new Set([
  SETTING_KEYS.seeded,
  SETTING_KEYS.syncPrep,
  SETTING_KEYS.syncUserId,
  SETTING_KEYS.syncPushedAt,
  SETTING_KEYS.syncPulledAt,
]);

/** El catálogo sembrado y las marcas de instalación ("seeded", "syncPrep") no se respaldan: se vuelven a crear solos en cada instalación. */
export function pickUserSettings(
  all: Readonly<Record<string, string>>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(all).filter(([key]) => !EXCLUDED_SETTINGS.has(key)),
  );
}

export function buildBackup(data: BackupData, now: Date): BackupFile {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
}

/** Texto → respaldo válido, o un BackupError con el motivo (no es JSON, no es de Overload, versión nueva, datos dañados). */
export function parseBackup(raw: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupError("not_json");
  }
  if (typeof parsed !== "object" || parsed === null)
    throw new BackupError("wrong_app");
  const file = parsed as Record<string, unknown>;
  if (file.app !== BACKUP_APP) throw new BackupError("wrong_app");
  if (file.version !== BACKUP_VERSION)
    throw new BackupError("unsupported_version");
  if (typeof file.exportedAt !== "string" || !isBackupData(file.data))
    throw new BackupError("invalid_data");
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: file.exportedAt,
    data: file.data,
  };
}

export function summarizeBackup({ data }: BackupFile): BackupSummary {
  return {
    plans: data.plans.length,
    days: data.planDays.length,
    exercises: data.exercises.length,
    sessions: data.sessions.length,
    sets: data.setLogs.length,
  };
}

interface KnownExercise {
  id: string;
  sourceId: string | null;
  nameEs: string;
  nameEn: string;
}

export interface ExerciseResolution {
  /** id del respaldo → id que tiene el ejercicio en esta instalación. */
  idMap: Map<string, string>;
  /** Los que no existen aquí (ejercicios propios o importados de notas) y hay que crear. */
  toCreate: BackupExercise[];
}

const nameKey = (exercise: Pick<KnownExercise, "nameEs" | "nameEn">) =>
  `${normalizeText(exercise.nameEs)}|${normalizeText(exercise.nameEn)}`;

/**
 * Los ids del catálogo sembrado cambian entre instalaciones, así que cada ejercicio del respaldo se busca
 * por su id de free-exercise-db y, si no lo tiene, por nombre. Si no está, se crea (conserva su id si está libre).
 */
export function resolveExercises(
  backed: readonly BackupExercise[],
  known: readonly KnownExercise[],
  createId: () => string = generateId,
): ExerciseResolution {
  const bySource = new Map(
    known.flatMap((item) =>
      item.sourceId ? [[item.sourceId, item.id] as const] : [],
    ),
  );
  const byName = new Map(
    known.map((item) => [nameKey(item), item.id] as const),
  );
  const takenIds = new Set(known.map((item) => item.id));
  const idMap = new Map<string, string>();
  const toCreate: BackupExercise[] = [];

  for (const exercise of backed) {
    const existing =
      (exercise.sourceId ? bySource.get(exercise.sourceId) : undefined) ??
      byName.get(nameKey(exercise));
    if (existing) {
      idMap.set(exercise.id, existing);
      continue;
    }
    const id = takenIds.has(exercise.id) ? createId() : exercise.id;
    takenIds.add(id);
    byName.set(nameKey(exercise), id);
    idMap.set(exercise.id, id);
    toCreate.push({ ...exercise, id });
  }
  return { idMap, toCreate };
}

export function backupFileName(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `overload-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}
