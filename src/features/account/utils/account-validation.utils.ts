import { validationUtils } from "@/shared/utils";
import {
  AccountError,
  type AccountErrorCode,
  type Credentials,
  type PasswordChecks,
  type SignUpDraft,
} from "../types/account.types";

export const MIN_PASSWORD_LENGTH = 8;
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;
const HAS_DIGIT = /\d/;

export function isEmailValid(email: string): boolean {
  return validationUtils.isValidEmail(email.trim());
}

/** Requisitos de una contraseña nueva, uno por uno, para mostrarlos mientras se escribe. */
export function checkPassword(password: string): PasswordChecks {
  return {
    hasMinLength: password.length >= MIN_PASSWORD_LENGTH,
    hasLetterAndNumber: HAS_LETTER.test(password) && HAS_DIGIT.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const checks = checkPassword(password);
  return checks.hasMinLength && checks.hasLetterAndNumber;
}

/** Para entrar basta un correo válido y alguna contraseña: sus reglas solo aplican al crearla. */
export function canSignIn({ email, password }: Credentials): boolean {
  return isEmailValid(email) && password.length > 0;
}

export function canSignUp(draft: SignUpDraft): boolean {
  return (
    validationUtils.isNotEmpty(draft.name) &&
    isEmailValid(draft.email) &&
    isPasswordValid(draft.password) &&
    draft.hasAcceptedTerms
  );
}

/** El correo solo se marca como inválido cuando ya hay algo escrito. */
export function shouldFlagEmail(email: string): boolean {
  return email.trim().length > 0 && !isEmailValid(email);
}

export function toAccountErrorCode(error: unknown): AccountErrorCode {
  return error instanceof AccountError ? error.code : "unknown";
}
