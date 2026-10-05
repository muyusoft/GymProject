import { asc, eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { bodyWeights } from "@/shared/db/schema";
import type { WeightUnit } from "@/shared/types/training.types";
import { generateId } from "@/shared/utils/id.utils";
import type { BodyWeightEntry } from "../types/body.types";

const entryColumns = {
  id: bodyWeights.id,
  date: bodyWeights.date,
  weight: bodyWeights.weight,
  unit: bodyWeights.unit,
};

/** Todos los registros, del más viejo al más nuevo. */
export async function listBodyWeights(): Promise<BodyWeightEntry[]> {
  return db.select(entryColumns).from(bodyWeights).orderBy(asc(bodyWeights.date));
}

interface SaveBodyWeightOptions {
  date: string;
  weight: number;
  unit: WeightUnit;
}

/** Un registro por día: volver a guardar el mismo día corrige el anterior. */
export async function saveBodyWeight({ date, weight, unit }: SaveBodyWeightOptions): Promise<void> {
  await db
    .insert(bodyWeights)
    .values({ id: generateId(), date, weight, unit })
    .onConflictDoUpdate({ target: bodyWeights.date, set: { weight, unit } });
}

export async function deleteBodyWeight(id: string): Promise<void> {
  await db.delete(bodyWeights).where(eq(bodyWeights.id, id));
}
