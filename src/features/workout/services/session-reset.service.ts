import { and, eq } from "drizzle-orm";
import { db, transact } from "@/shared/db/client";
import { recordDeletions } from "@/shared/db/queries/deletion.queries";
import { sessions } from "@/shared/db/schema";

interface ResetDayOptions {
  dayId: string;
  /** Fecha local yyyy-MM-dd. */
  date: string;
}

/**
 * Solo para pruebas: borra las sesiones de ese día (abiertas o terminadas) con sus series, para volver a
 * hacer el entreno. Las sustituciones de "solo hoy" y el plan no cambian. Ver docs/overload/pending-before-production.md.
 */
export async function resetDaySessions({ dayId, date }: ResetDayOptions): Promise<void> {
  const slot = and(eq(sessions.planDayId, dayId), eq(sessions.date, date));
  const rows = await db.select({ id: sessions.id }).from(sessions).where(slot);
  if (rows.length === 0) return;
  // Transacción síncrona (expo-sqlite): sin await adentro, cada sentencia con .run(). Las series caen en cascada.
  await transact((tx) => {
    recordDeletions(tx, "sessions", rows.map((row) => row.id));
    tx.delete(sessions).where(slot).run();
  });
}
