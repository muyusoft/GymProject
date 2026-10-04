import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const DATABASE_NAME = "overload.db";

const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
export type Database = typeof db;
