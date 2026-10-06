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

/** Apple y Google necesitan un development build y sus credenciales; llegan después del correo. */
export function signInWithProvider(_provider: SocialProvider): Promise<void> {
  return Promise.reject(new AccountError("unavailable"));
}
