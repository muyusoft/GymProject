import { parseISO } from "date-fns";
import { between } from "drizzle-orm";
import type { ScheduleShift } from "@/shared/utils/week-schedule.utils";
import { toIsoDate, weekDates, weekdayIndex } from "@/shared/utils/week.utils";
import { db } from "../client";
import { scheduleShifts } from "../schema";

/** Los días perdidos de la semana que empieza en `weekStart`; las otras semanas no se ven afectadas. */
export async function listWeekShifts(weekStart: Date): Promise<ScheduleShift[]> {
  const from = toIsoDate(weekStart);
  const to = toIsoDate(weekDates(weekStart).at(-1) ?? weekStart);
  const rows = await db
    .select()
    .from(scheduleShifts)
    .where(between(scheduleShifts.date, from, to));
  return rows.map((row) => ({
    missedWeekday: weekdayIndex(parseISO(row.date)),
    targetWeekday:
      row.targetDate === null ? null : weekdayIndex(parseISO(row.targetDate)),
  }));
}

interface ShiftDecision {
  /** Fecha del día perdido, yyyy-MM-dd. */
  date: string;
  /** Fecha en que se hace; null = dejarlo pasar. */
  targetDate: string | null;
}

/** Guarda la decisión sobre un día perdido; una nueva decisión sobre el mismo día reemplaza la anterior. */
export async function saveShift({ date, targetDate }: ShiftDecision): Promise<void> {
  await db
    .insert(scheduleShifts)
    .values({ id: date, date, targetDate })
    .onConflictDoUpdate({
      target: scheduleShifts.id,
      set: { targetDate, updatedAt: Date.now() },
    });
}
