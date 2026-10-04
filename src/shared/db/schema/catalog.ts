// Imports relativos: drizzle-kit lee estos archivos fuera de Metro y no resuelve el alias @/.
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  EQUIPMENTS,
  EXERCISE_STATUSES,
  LOAD_TYPES,
  MUSCLE_BASES,
  MUSCLE_GROUPS,
  MUSCLE_ROLES,
  MUSCLE_VIEWS,
  SOURCE_STRENGTHS,
} from "../../types/training.types";
import { idColumn, updatedAtColumn } from "./columns";

export const sources = sqliteTable("sources", {
  id: idColumn(),
  citation: text("citation").notNull(),
  url: text("url").notNull(),
  year: integer("year"),
  strength: text("strength", { enum: SOURCE_STRENGTHS }).notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: idColumn(),
  sourceId: text("source_id"),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  instructionsEs: text("instructions_es"),
  instructionsEn: text("instructions_en"),
  pattern: text("pattern"),
  equipment: text("equipment", { enum: EQUIPMENTS }).notNull(),
  defaultLoadType: text("default_load_type", { enum: LOAD_TYPES }).notNull(),
  aliases: text("aliases").notNull().default("[]"),
  evidenceLevel: text("evidence_level", { enum: SOURCE_STRENGTHS }),
  status: text("status", { enum: EXERCISE_STATUSES })
    .notNull()
    .default("claude_draft"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: integer("reviewed_at"),
  updatedAt: updatedAtColumn(),
});

export const exerciseMuscles = sqliteTable(
  "exercise_muscles",
  {
    id: idColumn(),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    muscleGroup: text("muscle_group", { enum: MUSCLE_GROUPS }).notNull(),
    view: text("view", { enum: MUSCLE_VIEWS }).notNull(),
    role: text("role", { enum: MUSCLE_ROLES }).notNull(),
    basis: text("basis", { enum: MUSCLE_BASES }).notNull(),
    sourceIds: text("source_ids").notNull().default("[]"),
  },
  (table) => [index("exercise_muscles_exercise_idx").on(table.exerciseId)],
);
