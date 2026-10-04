import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { LOAD_TYPES, WEIGHT_UNITS } from "../../types/training.types";
import { exercises } from "./catalog";
import { idColumn, updatedAtColumn } from "./columns";

export const plans = sqliteTable("plans", {
  id: idColumn(),
  name: text("name").notNull(),
  repeatsWeekly: integer("repeats_weekly", { mode: "boolean" })
    .notNull()
    .default(true),
  updatedAt: updatedAtColumn(),
});

export const planDays = sqliteTable(
  "plan_days",
  {
    id: idColumn(),
    planId: text("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    /** 0 = lunes … 6 = domingo. */
    weekday: integer("weekday").notNull(),
    name: text("name").notNull(),
    order: integer("sort_order").notNull(),
    defaultSets: integer("default_sets").notNull(),
    defaultReps: integer("default_reps").notNull(),
    defaultRestSec: integer("default_rest_sec").notNull(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [index("plan_days_plan_idx").on(table.planId)],
);

export const planExercises = sqliteTable(
  "plan_exercises",
  {
    id: idColumn(),
    planDayId: text("plan_day_id")
      .notNull()
      .references(() => planDays.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id),
    order: integer("sort_order").notNull(),
    sets: integer("sets").notNull(),
    reps: integer("reps"),
    seconds: integer("seconds"),
    restSec: integer("rest_sec").notNull(),
    targetWeight: real("target_weight"),
    unit: text("unit", { enum: WEIGHT_UNITS }).notNull(),
    loadType: text("load_type", { enum: LOAD_TYPES }).notNull(),
    /** JSON: { enabled, sessions }. */
    progressionRule: text("progression_rule"),
    updatedAt: updatedAtColumn(),
  },
  (table) => [index("plan_exercises_day_idx").on(table.planDayId)],
);
