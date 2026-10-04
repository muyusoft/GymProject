import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  INCREMENT_EQUIPMENTS,
  WEIGHT_UNITS,
} from "../../types/training.types";
import { idColumn, updatedAtColumn } from "./columns";

export const equipmentIncrements = sqliteTable("equipment_increments", {
  id: idColumn(),
  equipment: text("equipment", { enum: INCREMENT_EQUIPMENTS }).notNull(),
  unit: text("unit", { enum: WEIGHT_UNITS }).notNull(),
  step: real("step").notNull(),
  updatedAt: updatedAtColumn(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
