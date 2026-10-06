/** Una fila tal como viaja entre SQLite y Supabase: nombres de columna en snake_case, iguales en los dos lados. */
export type SyncRow = Record<string, unknown>;

export interface SyncTable {
  /** Tabla en SQLite. */
  local: string;
  /** Tabla en Supabase. */
  remote: string;
  /** Columnas que se copian, además de `id` y `updated_at`. */
  columns: readonly string[];
  /** Columnas que SQLite guarda como 0/1 y Postgres como boolean. */
  booleans?: readonly string[];
  /** Condición SQL que deja solo las filas del usuario cuando la tabla local también guarda otras. */
  localFilter?: string;
}

/** En `exercises` vive también el catálogo, que no se sincroniza: solo los ejercicios que no son del catálogo. */
const CUSTOM_EXERCISE_FILTER =
  "id NOT LIKE 'fedb:%' AND id NOT LIKE 'common:%'";

/**
 * Qué se sincroniza, de padres a hijos: al bajar, una fila llega después de las filas a las que apunta
 * (las claves foráneas de SQLite están encendidas). Los ajustes todavía no se sincronizan.
 */
export const SYNC_TABLES: readonly SyncTable[] = [
  {
    local: "exercises",
    remote: "custom_exercises",
    columns: [
      "name_es",
      "name_en",
      "pattern",
      "equipment",
      "default_load_type",
      "aliases",
    ],
    localFilter: CUSTOM_EXERCISE_FILTER,
  },
  {
    local: "plans",
    remote: "plans",
    columns: ["name", "repeats_weekly"],
    booleans: ["repeats_weekly"],
  },
  {
    local: "plan_days",
    remote: "plan_days",
    columns: [
      "plan_id",
      "weekday",
      "name",
      "sort_order",
      "default_sets",
      "default_reps",
      "default_rest_sec",
    ],
  },
  {
    local: "plan_exercises",
    remote: "plan_exercises",
    columns: [
      "plan_day_id",
      "exercise_id",
      "sort_order",
      "sets",
      "reps",
      "seconds",
      "rest_sec",
      "target_weight",
      "unit",
      "load_type",
      "progression_rule",
    ],
  },
  {
    local: "sessions",
    remote: "sessions",
    columns: ["plan_day_id", "date", "started_at", "ended_at", "origin"],
  },
  {
    local: "set_logs",
    remote: "set_logs",
    columns: [
      "session_id",
      "exercise_id",
      "set_index",
      "weight",
      "unit",
      "load_type",
      "reps",
      "seconds",
      "rpe",
      "completed",
      "is_pr",
    ],
    booleans: ["completed", "is_pr"],
  },
  {
    local: "exercise_swaps",
    remote: "exercise_swaps",
    columns: [
      "date",
      "plan_exercise_id",
      "exercise_id",
      "target_weight",
      "unit",
      "load_type",
    ],
  },
  {
    local: "body_weights",
    remote: "body_weights",
    columns: ["date", "weight", "unit"],
  },
  {
    local: "equipment_increments",
    remote: "equipment_increments",
    columns: ["equipment", "unit", "step"],
  },
];

/** Tablas que dicen si hay datos del usuario (en el teléfono o en la cuenta) antes de enlazarlos. */
export const DATA_PROBE_TABLES = ["plans", "sessions", "body_weights"] as const;
