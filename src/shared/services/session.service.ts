import { supabase } from "@/config/supabase";
import { useSessionStore } from "@/shared/store/session.store";

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
    useSessionStore
      .getState()
      .setUser(
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

/** Cierra la sesión en este teléfono. Los datos locales no se tocan. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
