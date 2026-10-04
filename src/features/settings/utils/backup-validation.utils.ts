import {
  EQUIPMENTS,
  INCREMENT_EQUIPMENTS,
  LOAD_TYPES,
  SESSION_ORIGINS,
  WEIGHT_UNITS,
} from "@/shared/types/training.types";
import { isOneOf } from "@/shared/utils/guard.utils";
import type { BackupData } from "../types/backup.types";

type FieldCheck = (value: unknown) => boolean;
type RowSpec = Readonly<Record<string, FieldCheck>>;

const text: FieldCheck = (value) => typeof value === "string";
const finite: FieldCheck = (value) => typeof value === "number" && Number.isFinite(value);
const flag: FieldCheck = (value) => typeof value === "boolean";
const nullable =
  (check: FieldCheck): FieldCheck =>
  (value) =>
    value === null || check(value);
const oneOf =
  (values: readonly string[]): FieldCheck =>
  (value) =>
    typeof value === "string" && isOneOf(values, value);

const SPECS = {
  equipmentIncrements: { id: text, equipment: oneOf(INCREMENT_EQUIPMENTS), unit: oneOf(WEIGHT_UNITS), step: finite, updatedAt: finite },
  exercises: {
    id: text,
    sourceId: nullable(text),
    nameEs: text,
    nameEn: text,
    pattern: nullable(text),
    equipment: oneOf(EQUIPMENTS),
    defaultLoadType: oneOf(LOAD_TYPES),
  },
  plans: { id: text, name: text, repeatsWeekly: flag, updatedAt: finite },
  planDays: {
    id: text,
    planId: text,
    weekday: finite,
    name: text,
    order: finite,
    defaultSets: finite,
    defaultReps: finite,
    defaultRestSec: finite,
    updatedAt: finite,
  },
  planExercises: {
    id: text,
    planDayId: text,
    exerciseId: text,
    order: finite,
    sets: finite,
    reps: nullable(finite),
    seconds: nullable(finite),
    restSec: finite,
    targetWeight: nullable(finite),
    unit: oneOf(WEIGHT_UNITS),
    loadType: oneOf(LOAD_TYPES),
    progressionRule: nullable(text),
    updatedAt: finite,
  },
  sessions: {
    id: text,
    planDayId: nullable(text),
    date: text,
    startedAt: finite,
    endedAt: nullable(finite),
    origin: oneOf(SESSION_ORIGINS),
    updatedAt: finite,
  },
  setLogs: {
    id: text,
    sessionId: text,
    exerciseId: text,
    setIndex: finite,
    weight: nullable(finite),
    unit: oneOf(WEIGHT_UNITS),
    loadType: oneOf(LOAD_TYPES),
    reps: nullable(finite),
    seconds: nullable(finite),
    rpe: nullable(finite),
    completed: flag,
    isPR: flag,
    updatedAt: finite,
  },
} as const satisfies Record<string, RowSpec>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rowsMatch(rows: unknown, spec: RowSpec): rows is Record<string, unknown>[] {
  return (
    Array.isArray(rows) &&
    rows.every((row) => isRecord(row) && Object.entries(spec).every(([field, check]) => check(row[field])))
  );
}

function idsOf(rows: readonly Record<string, unknown>[]): Set<string> {
  return new Set(rows.map((row) => String(row.id)));
}

function isStringMap(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

/** Cada referencia apunta a algo que existe en el mismo archivo: así restaurar nunca viola una clave foránea. */
function referencesHold(data: Record<string, Record<string, unknown>[]>): boolean {
  const plans = idsOf(data.plans ?? []);
  const days = idsOf(data.planDays ?? []);
  const exercises = idsOf(data.exercises ?? []);
  const sessions = idsOf(data.sessions ?? []);
  return (
    (data.planDays ?? []).every((row) => plans.has(String(row.planId))) &&
    (data.planExercises ?? []).every((row) => days.has(String(row.planDayId)) && exercises.has(String(row.exerciseId))) &&
    (data.sessions ?? []).every((row) => row.planDayId === null || days.has(String(row.planDayId))) &&
    (data.setLogs ?? []).every((row) => sessions.has(String(row.sessionId)) && exercises.has(String(row.exerciseId)))
  );
}

/** El contenido de un respaldo es válido: tablas completas con sus tipos y referencias consistentes. */
export function isBackupData(value: unknown): value is BackupData {
  if (!isRecord(value) || !isStringMap(value.settings)) return false;
  const tables = Object.keys(SPECS) as (keyof typeof SPECS)[];
  if (!tables.every((table) => rowsMatch(value[table], SPECS[table]))) return false;
  return referencesHold(value as Record<string, Record<string, unknown>[]>);
}
