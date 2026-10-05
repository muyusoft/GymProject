import {
  AccountError,
  type Credentials,
  type SignUpInput,
  type SocialProvider,
} from "../types/account.types";

/**
 * Overset todavía no tiene backend: las pantallas de cuenta existen, pero toda acción se rechaza con
 * "unavailable". Cuando haya servidor, estas cuatro funciones son lo único que cambia.
 */
function rejectUnavailable(): Promise<void> {
  return Promise.reject(new AccountError("unavailable"));
}

export function signIn(_credentials: Credentials): Promise<void> {
  return rejectUnavailable();
}

export function signUp(_input: SignUpInput): Promise<void> {
  return rejectUnavailable();
}

export function signInWithProvider(_provider: SocialProvider): Promise<void> {
  return rejectUnavailable();
}

export function requestPasswordReset(_email: string): Promise<void> {
  return rejectUnavailable();
}
