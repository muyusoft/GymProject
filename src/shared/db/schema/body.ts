import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { WEIGHT_UNITS } from "../../types/training.types";
import { idColumn, updatedAtColumn } from "./columns";

export const bodyWeights = sqliteTable("body_weights", {
  id: idColumn(),
  /** Fecha local en formato yyyy-MM-dd; un solo registro por día. */
  date: text("date").notNull().unique(),
  weight: real("weight").notNull(),
  unit: text("unit", { enum: WEIGHT_UNITS }).notNull(),
  updatedAt: updatedAtColumn(),
});
