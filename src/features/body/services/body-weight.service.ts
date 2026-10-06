import { asc, eq } from "drizzle-orm";
import { db, transact } from "@/shared/db/client";
import {
  clearDeletion,
  recordDeletions,
} from "@/shared/db/queries/deletion.queries";
import { bodyWeights } from "@/shared/db/schema";
import type { WeightUnit } from "@/shared/types/training.types";
import { bodyWeightId } from "@/shared/utils/stable-id.utils";
import type { BodyWeightEntry } from "../types/body.types";

const entryColumns = {
  id: bodyWeights.id,
  date: bodyWeights.date,
  weight: bodyWeights.weight,
  unit: bodyWeights.unit,
};

/** Todos los registros, del más viejo al más nuevo. */
export async function listBodyWeights(): Promise<BodyWeightEntry[]> {
  return db
    .select(entryColumns)
    .from(bodyWeights)
    .orderBy(asc(bodyWeights.date));
}

interface SaveBodyWeightOptions {
  date: string;
  weight: number;
  unit: WeightUnit;
}

/** Un registro por día: volver a guardar el mismo día corrige el anterior. */
export function saveBodyWeight({
  date,
  weight,
  unit,
}: SaveBodyWeightOptions): Promise<void> {
  const id = bodyWeightId(date);
  return transact((tx) => {
    clearDeletion(tx, "body_weights", id);
    tx.insert(bodyWeights)
      .values({ id, date, weight, unit })
      .onConflictDoUpdate({ target: bodyWeights.date, set: { weight, unit } })
      .run();
  });
}

export function deleteBodyWeight(id: string): Promise<void> {
  return transact((tx) => {
    recordDeletions(tx, "body_weights", [id]);
    tx.delete(bodyWeights).where(eq(bodyWeights.id, id)).run();
  });
}
