export const ACCOUNT_ERROR_CODES = [
  "unavailable",
  "invalid_credentials",
  "email_not_confirmed",
  "email_taken",
  "weak_password",
  "rate_limited",
  "network",
  /** La persona cerró la ventana del proveedor: no es un fallo y no se muestra ningún aviso. */
  "cancelled",
  "unknown",
] as const;
export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[number];

/** Fallo de una acción de cuenta con un motivo que la pantalla sabe explicar. */
export class AccountError extends Error {
  constructor(readonly code: AccountErrorCode) {
    super(code);
    this.name = "AccountError";
  }
}

export const SOCIAL_PROVIDERS = ["apple", "google"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

/**
 * Proveedores que la app ofrece hoy. Apple exige una cuenta del Apple Developer Program; cuando exista, se
 * agrega aquí. Antes de publicar en el App Store hará falta: Apple lo exige si se ofrece Google.
 */
export const AVAILABLE_PROVIDERS: readonly SocialProvider[] = ["google"];

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpInput extends Credentials {
  name: string;
}

export interface SignUpDraft extends SignUpInput {
  hasAcceptedTerms: boolean;
}

/** Crear la cuenta deja la sesión iniciada, o pide confirmar el correo antes de poder entrar. */
export type SignUpResult = "signedIn" | "confirmEmail";

export const CHECK_EMAIL_KINDS = ["reset", "confirm"] as const;
export type CheckEmailKind = (typeof CHECK_EMAIL_KINDS)[number];

export interface PasswordChecks {
  hasMinLength: boolean;
  hasLetterAndNumber: boolean;
}
