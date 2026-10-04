import type { SettingKey } from "@/shared/types/settings.types";
import { db } from "../client";
import { settings } from "../schema";

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function saveSetting(key: SettingKey, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
