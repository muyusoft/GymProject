import { eq } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { sessions } from "@/shared/db/schema";
import { reopenedStart } from "../utils/reopen.utils";

/** Vuelve a abrir una sesión terminada para corregirla o seguir; las series hechas se conservan. */
export async function reopenSession(sessionId: string, now: Date): Promise<void> {
  const [session] = await db
    .select({ startedAt: sessions.startedAt, endedAt: sessions.endedAt })
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (!session) throw new Error("Session to reopen not found");
  if (session.endedAt === null) return;
  await db
    .update(sessions)
    .set({
      endedAt: null,
      startedAt: reopenedStart({ startedAt: session.startedAt, endedAt: session.endedAt, now: now.getTime() }),
    })
    .where(eq(sessions.id, sessionId));
}
