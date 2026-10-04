import { integer, text } from "drizzle-orm/sqlite-core";

export const idColumn = () => text("id").primaryKey();

/** Milisegundos desde epoch; se renueva en cada update para sincronizar después del MVP. */
export const updatedAtColumn = () =>
  integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now());
