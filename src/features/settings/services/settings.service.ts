import {
  listIncrements,
  updateIncrementStep,
} from "@/shared/db/queries/equipment.queries";
import { findActivePlan, listPlanDays } from "@/shared/db/queries/plan.queries";
import type { EquipmentIncrementRow } from "@/shared/db/types";

export function loadIncrements(): Promise<EquipmentIncrementRow[]> {
  return listIncrements();
}

export function saveIncrementStep(id: string, step: number): Promise<void> {
  return updateIncrementStep(id, step);
}

/** Días de la semana (0 = lunes) con entreno en el plan, en orden. */
export async function loadPlanWeekdays(): Promise<number[]> {
  const plan = await findActivePlan();
  const days = plan ? await listPlanDays(plan.id) : [];
  return days.map((day) => day.weekday).sort((a, b) => a - b);
}
