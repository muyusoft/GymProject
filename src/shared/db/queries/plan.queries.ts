import { asc, eq } from "drizzle-orm";
import { generateId } from "@/shared/utils/id.utils";
import { db } from "../client";
import { planDays, plans } from "../schema";
import type { NewPlanDay, PlanDayPatch, PlanDayRow, PlanRow } from "../types";

export async function findActivePlan(): Promise<PlanRow | null> {
  const rows = await db.select().from(plans).orderBy(asc(plans.updatedAt)).limit(1);
  return rows[0] ?? null;
}

export async function insertPlan(name: string): Promise<PlanRow> {
  const row = { id: generateId(), name, repeatsWeekly: true };
  const [created] = await db.insert(plans).values(row).returning();
  if (!created) throw new Error("Plan was not created");
  return created;
}

export async function updatePlan(
  id: string,
  patch: { name?: string; repeatsWeekly?: boolean },
): Promise<void> {
  await db.update(plans).set(patch).where(eq(plans.id, id));
}

export async function listPlanDays(planId: string): Promise<PlanDayRow[]> {
  return db
    .select()
    .from(planDays)
    .where(eq(planDays.planId, planId))
    .orderBy(asc(planDays.weekday));
}

export async function findPlanDay(id: string): Promise<PlanDayRow | null> {
  const rows = await db.select().from(planDays).where(eq(planDays.id, id));
  return rows[0] ?? null;
}

export async function insertPlanDay(values: NewPlanDay): Promise<PlanDayRow> {
  const [created] = await db
    .insert(planDays)
    .values({ id: generateId(), ...values })
    .returning();
  if (!created) throw new Error("Plan day was not created");
  return created;
}

export async function updatePlanDay(id: string, patch: PlanDayPatch): Promise<void> {
  await db.update(planDays).set(patch).where(eq(planDays.id, id));
}

export async function deletePlanDay(id: string): Promise<void> {
  await db.delete(planDays).where(eq(planDays.id, id));
}
