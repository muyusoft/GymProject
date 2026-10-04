import { and, asc, eq } from "drizzle-orm";
import type {
  IncrementEquipment,
  WeightUnit,
} from "@/shared/types/training.types";
import { db } from "../client";
import { equipmentIncrements } from "../schema";
import type { EquipmentIncrementRow } from "../types";

export async function listIncrements(): Promise<EquipmentIncrementRow[]> {
  return db
    .select()
    .from(equipmentIncrements)
    .orderBy(asc(equipmentIncrements.equipment), asc(equipmentIncrements.unit));
}

export async function updateIncrementStep(id: string, step: number): Promise<void> {
  await db.update(equipmentIncrements).set({ step }).where(eq(equipmentIncrements.id, id));
}

interface IncrementKey {
  equipment: IncrementEquipment;
  unit: WeightUnit;
}

export async function findIncrementStep({
  equipment,
  unit,
}: IncrementKey): Promise<number | null> {
  const rows = await db
    .select({ step: equipmentIncrements.step })
    .from(equipmentIncrements)
    .where(
      and(eq(equipmentIncrements.equipment, equipment), eq(equipmentIncrements.unit, unit)),
    );
  return rows[0]?.step ?? null;
}
