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
