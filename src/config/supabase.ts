import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import env from "./env";
import { secureSessionStorage } from "./session-storage";

/**
 * Cliente de Supabase: cuentas y, más adelante, sincronización. La app sigue leyendo y escribiendo en
 * SQLite; nada de lo que se ve en pantalla espera a este cliente.
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: secureSessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      // En una app nativa no hay URL de la que leer la sesión.
      detectSessionInUrl: false,
      // Con Google la app recibe un código de un solo uso y lo canjea: el token nunca viaja en la dirección.
      flowType: "pkce",
    },
  },
);

// La sesión solo se renueva con la app en primer plano; en segundo plano el temporizador no es fiable.
AppState.addEventListener("change", (state) => {
  if (state === "active") void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();
});
