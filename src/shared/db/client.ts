import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const DATABASE_NAME = "overload.db";

const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
// SQLite las trae apagadas en cada conexión: sin esto no se aplican ni las cascadas ni los "set null".
sqlite.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(sqlite, { schema });
export type Database = typeof db;
/** La transacción síncrona de Drizzle con expo-sqlite: adentro todo usa .run()/.all()/.get(), sin await. */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Corre una transacción síncrona y la entrega como promesa, igual que el resto de las consultas:
 * quien la llama usa await y un fallo llega como rechazo, no como excepción.
 */
export function transact(work: (tx: Transaction) => void): Promise<void> {
  return new Promise((resolve) => {
    db.transaction(work);
    resolve();
  });
}
