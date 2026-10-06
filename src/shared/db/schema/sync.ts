import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Registro de filas borradas. Los borrados son definitivos en el teléfono; esta tabla guarda qué se borró
 * para que la sincronización pueda avisar al servidor (sin ella, la fila volvería en la siguiente bajada).
 */
export const deletedRows = sqliteTable(
  "deleted_rows",
  {
    tableName: text("table_name").notNull(),
    rowId: text("row_id").notNull(),
    /** Milisegundos desde epoch. */
    deletedAt: integer("deleted_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tableName, table.rowId] })],
);
