import type { bodyWeights, sessions, setLogs } from "@/shared/db/schema";
import type {
  EquipmentIncrementRow,
  PlanDayRow,
  PlanExerciseRow,
  PlanRow,
} from "@/shared/db/types";
import type { Equipment, LoadType } from "@/shared/types/training.types";

export type SessionRecord = typeof sessions.$inferSelect;
export type SetLogRecord = typeof setLogs.$inferSelect;
export type BodyWeightRecord = typeof bodyWeights.$inferSelect;

/** Un ejercicio al que apunta el plan o el historial; se identifica por `sourceId` o por nombre al restaurar. */
export interface BackupExercise {
  id: string;
  sourceId: string | null;
  nameEs: string;
  nameEn: string;
  pattern: string | null;
  equipment: Equipment;
  defaultLoadType: LoadType;
}

export interface BackupData {
  /** Solo los ajustes del usuario (idioma, unidad, tema, interruptores, recordatorio). */
  settings: Record<string, string>;
  equipmentIncrements: EquipmentIncrementRow[];
  exercises: BackupExercise[];
  plans: PlanRow[];
  planDays: PlanDayRow[];
  planExercises: PlanExerciseRow[];
  sessions: SessionRecord[];
  setLogs: SetLogRecord[];
  /** Falta en los respaldos anteriores al peso corporal; al restaurar uno de esos, los registros actuales se conservan. */
  bodyWeights?: BodyWeightRecord[];
}

export const BACKUP_APP = "overload";
export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  /** ISO 8601. */
  exportedAt: string;
  data: BackupData;
}

export type BackupErrorCode = "not_json" | "wrong_app" | "unsupported_version" | "invalid_data";

export class BackupError extends Error {
  constructor(readonly code: BackupErrorCode) {
    super(code);
    this.name = "BackupError";
  }
}

export interface BackupSummary {
  plans: number;
  days: number;
  exercises: number;
  sessions: number;
  sets: number;
}
