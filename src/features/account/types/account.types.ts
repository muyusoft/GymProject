export const ACCOUNT_ERROR_CODES = ["unavailable", "invalid_credentials", "unknown"] as const;
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

export interface PasswordChecks {
  hasMinLength: boolean;
  hasLetterAndNumber: boolean;
}
