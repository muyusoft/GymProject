import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/config/supabase";
import {
  AccountError,
  type Credentials,
  type SignUpInput,
  type SignUpResult,
  type SocialProvider,
} from "../types/account.types";
import {
  authFailureCode,
  type AuthFailure,
} from "../utils/account-error.utils";
import { readOAuthCallback } from "../utils/oauth-callback.utils";

/** Ruta a la que vuelve el navegador; existe como pantalla (`src/app/auth-callback.tsx`) por si el sistema la abre. */
const OAUTH_CALLBACK_PATH = "auth-callback";

/** Toda acción de cuenta falla con un AccountError, cuyo motivo la pantalla sabe explicar. */
function fail(error: AuthFailure): never {
  throw new AccountError(authFailureCode(error));
}

export async function signIn({ email, password }: Credentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail(error);
}

/**
 * Crea la cuenta. Si el proyecto pide confirmar el correo, todavía no hay sesión: devuelve "confirmEmail"
 * y la pantalla manda a revisar el correo.
 */
export async function signUp({
  name,
  email,
  password,
}: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) fail(error);
  // Con confirmación activa, Supabase no dice que el correo ya existe: devuelve un usuario sin identidades.
  if (data.user?.identities?.length === 0)
    throw new AccountError("email_taken");
  return data.session ? "signedIn" : "confirmEmail";
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) fail(error);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) fail(error);
}

/** Abre el navegador con la página del proveedor y devuelve la dirección con la que volvió a la app. */
async function authorizeInBrowser(provider: SocialProvider): Promise<string> {
  // En Expo Go es exp://…/--/auth-callback; en la app instalada, overset://auth-callback.
  // Supabase rechaza direcciones cuyo host es una IP que no sea local (y manda a su Site URL): en Expo Go
  // hay que arrancar con --tunnel, que da un nombre de host, para probar este flujo.
  const redirectTo = Linking.createURL(OAUTH_CALLBACK_PATH);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) fail(error);
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  // Cerrar la ventana sin terminar no es un error: la pantalla se queda como estaba.
  if (result.type !== "success") throw new AccountError("cancelled");
  return result.url;
}

/**
 * Inicio de sesión con un proveedor por el navegador (OAuth de Supabase con PKCE): la app recibe un código
 * de un solo uso y lo canjea por la sesión. Funciona en Expo Go y en la app instalada.
 */
export async function signInWithProvider(
  provider: SocialProvider,
): Promise<void> {
  const callback = readOAuthCallback(await authorizeInBrowser(provider));
  if (callback.kind === "denied") throw new AccountError("cancelled");
  if (callback.kind === "empty") throw new AccountError("unknown");
  const { error } = await supabase.auth.exchangeCodeForSession(callback.code);
  if (error) fail(error);
}
