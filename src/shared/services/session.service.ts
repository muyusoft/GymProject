import { supabase } from "@/config/supabase";
import { unlinkUser, wipeLocalData } from "@/shared/services/sync/sync-local";
import { flushSync } from "@/shared/services/sync/sync.service";
import { useSessionStore } from "@/shared/store/session.store";
import { useSettingsStore } from "@/shared/store/settings.store";

/** El nombre viaja en los metadatos de la cuenta, que no tienen forma garantizada. */
function readName(
  metadata: Record<string, unknown> | undefined,
): string | null {
  const name = metadata?.name;
  return typeof name === "string" && name.trim().length > 0
    ? name.trim()
    : null;
}

/**
 * Mantiene el store de sesión al día: la sesión guardada al arrancar, los inicios y cierres de sesión
 * y las renovaciones. Devuelve la función para dejar de escuchar.
 */
export function watchSession(): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    useSessionStore.getState().setUser(
      user
        ? {
            id: user.id,
            email: user.email ?? null,
            name: readName(user.user_metadata),
          }
        : null,
    );
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Deja el teléfono sin datos de ninguna cuenta: borra plan e historial, lo desenlaza y hace que la app
 * vuelva a abrir en la bienvenida. Los ajustes (idioma, unidad, recordatorios) se conservan.
 */
async function clearPhone(): Promise<void> {
  wipeLocalData();
  await unlinkUser();
  const { update } = useSettingsStore.getState();
  // La introducción ya se vio: al volver a entrar se va directo a la bienvenida.
  await update("introSeen", true);
  await update("onboardingDone", false);
}

export type SignOutResult = "signedOut" | "unsyncedChanges";

interface SignOutOptions {
  /** Cerrar aunque queden cambios sin subir; esos cambios se pierden. */
  force?: boolean;
}

/**
 * Cierra la sesión. Los datos pertenecen a la cuenta, así que primero se suben y luego se borran del
 * teléfono. Si no se pueden subir, no cierra nada y devuelve "unsyncedChanges" para que la persona decida.
 */
export async function signOut({
  force = false,
}: SignOutOptions = {}): Promise<SignOutResult> {
  if (!force && !(await flushSync())) return "unsyncedChanges";
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
  await clearPhone();
  return "signedOut";
}

const DELETE_ACCOUNT_FUNCTION = "delete-account";

/**
 * Elimina la cuenta: el servidor la borra junto con su copia en la nube (función `delete-account`), y este
 * teléfono queda sin plan ni historial y sin sesión. Si el servidor falla, no se borra nada del teléfono.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke(DELETE_ACCOUNT_FUNCTION, {
    method: "POST",
  });
  if (error) throw error;
  // La cuenta ya no existe; si el cierre local falla, la sesión guardada caduca sola.
  await supabase.auth.signOut({ scope: "local" });
  await clearPhone();
}
