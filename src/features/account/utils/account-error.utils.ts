import type { AccountErrorCode } from "../types/account.types";

/** Lo que interesa de un error de Supabase Auth para explicarlo en pantalla. */
export interface AuthFailure {
  code?: string | undefined;
  name?: string | undefined;
  status?: number | undefined;
}

const CODE_BY_AUTH_CODE: Readonly<Record<string, AccountErrorCode>> = {
  invalid_credentials: "invalid_credentials",
  email_not_confirmed: "email_not_confirmed",
  user_already_exists: "email_taken",
  email_exists: "email_taken",
  weak_password: "weak_password",
  over_email_send_rate_limit: "rate_limited",
  over_request_rate_limit: "rate_limited",
};

/** Supabase usa este nombre cuando la petición no llegó al servidor (sin conexión, tiempo agotado). */
const NETWORK_ERROR_NAME = "AuthRetryableFetchError";
const TOO_MANY_REQUESTS = 429;

export function authFailureCode({
  code,
  name,
  status,
}: AuthFailure): AccountErrorCode {
  if (name === NETWORK_ERROR_NAME) return "network";
  const known = code === undefined ? undefined : CODE_BY_AUTH_CODE[code];
  if (known) return known;
  return status === TOO_MANY_REQUESTS ? "rate_limited" : "unknown";
}
