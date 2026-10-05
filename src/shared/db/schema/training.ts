import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import {
  LOAD_TYPES,
  SESSION_ORIGINS,
  WEIGHT_UNITS,
} from "../../types/training.types";
import { exercises } from "./catalog";
import { idColumn, updatedAtColumn } from "./columns";
import { planDays, planExercises } from "./plan";

/** Sustitución de un ejercicio del plan solo para una fecha; el plan no cambia. */
export const exerciseSwaps = sqliteTable(
  "exercise_swaps",
  {
    id: idColumn(),
    /** Fecha local en formato yyyy-MM-dd. */
    date: text("date").notNull(),
    planExerciseId: text("plan_exercise_id")
      .notNull()
      .references(() => planExercises.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    /** Peso, unidad y tipo de carga con que arranca el sustituto (de su último registro, si lo tiene). */
    targetWeight: real("target_weight"),
    unit: text("unit", { enum: WEIGHT_UNITS }).notNull(),
    loadType: text("load_type", { enum: LOAD_TYPES }).notNull(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [uniqueIndex("exercise_swaps_slot_idx").on(table.date, table.planExerciseId)],
);

export const sessions = sqliteTable("sessions", {
  id: idColumn(),
  planDayId: text("plan_day_id").references(() => planDays.id, {
    onDelete: "set null",
  }),
  /** Fecha local en formato yyyy-MM-dd. */
  date: text("date").notNull(),
  startedAt: integer("started_at").notNull(),
  endedAt: integer("ended_at"),
  origin: text("origin", { enum: SESSION_ORIGINS }).notNull().default("app"),
  updatedAt: updatedAtColumn(),
});

export const setLogs = sqliteTable(
  "set_logs",
  {
    id: idColumn(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    setIndex: integer("set_index").notNull(),
    weight: real("weight"),
    unit: text("unit", { enum: WEIGHT_UNITS }).notNull(),
    loadType: text("load_type", { enum: LOAD_TYPES }).notNull(),
    reps: integer("reps"),
    seconds: integer("seconds"),
    rpe: real("rpe"),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    isPR: integer("is_pr", { mode: "boolean" }).notNull().default(false),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("set_logs_session_idx").on(table.sessionId),
    index("set_logs_exercise_idx").on(table.exerciseId),
  ],
);
