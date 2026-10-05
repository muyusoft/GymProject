import { describe, expect, it } from "vitest";
import { AccountError } from "../types/account.types";
import {
  canSignIn,
  canSignUp,
  checkPassword,
  isEmailValid,
  isPasswordValid,
  shouldFlagEmail,
  toAccountErrorCode,
} from "../utils/account-validation.utils";

const VALID_DRAFT = { name: "Matheo", email: "matheo@example.com", password: "overset1", hasAcceptedTerms: true };

describe("isEmailValid", () => {
  it("acepta un correo normal, con espacios alrededor", () => {
    expect(isEmailValid("matheo@example.com")).toBe(true);
    expect(isEmailValid("  matheo@example.com ")).toBe(true);
  });

  it("rechaza vacío y correos incompletos", () => {
    expect(isEmailValid("")).toBe(false);
    expect(isEmailValid("matheo@")).toBe(false);
    expect(isEmailValid("matheo.example.com")).toBe(false);
  });
});

describe("checkPassword", () => {
  it("marca cada requisito por separado", () => {
    expect(checkPassword("")).toEqual({ hasMinLength: false, hasLetterAndNumber: false });
    expect(checkPassword("overload")).toEqual({ hasMinLength: true, hasLetterAndNumber: false });
    expect(checkPassword("abc1")).toEqual({ hasMinLength: false, hasLetterAndNumber: true });
    expect(checkPassword("12345678")).toEqual({ hasMinLength: true, hasLetterAndNumber: false });
  });

  it("es válida solo con los dos requisitos", () => {
    expect(isPasswordValid("overset1")).toBe(true);
    expect(isPasswordValid("overset")).toBe(false);
  });
});

describe("canSignIn", () => {
  it("pide correo válido y alguna contraseña", () => {
    expect(canSignIn({ email: "matheo@example.com", password: "x" })).toBe(true);
    expect(canSignIn({ email: "matheo@example.com", password: "" })).toBe(false);
    expect(canSignIn({ email: "matheo", password: "overset1" })).toBe(false);
  });
});

describe("canSignUp", () => {
  it("acepta el formulario completo", () => {
    expect(canSignUp(VALID_DRAFT)).toBe(true);
  });

  it("rechaza si falta el nombre, el correo, la contraseña o los términos", () => {
    expect(canSignUp({ ...VALID_DRAFT, name: "   " })).toBe(false);
    expect(canSignUp({ ...VALID_DRAFT, email: "matheo@" })).toBe(false);
    expect(canSignUp({ ...VALID_DRAFT, password: "corta1" })).toBe(false);
    expect(canSignUp({ ...VALID_DRAFT, hasAcceptedTerms: false })).toBe(false);
  });
});

describe("shouldFlagEmail", () => {
  it("no marca el campo vacío", () => {
    expect(shouldFlagEmail("")).toBe(false);
    expect(shouldFlagEmail("   ")).toBe(false);
  });

  it("marca lo que ya está escrito y no es un correo", () => {
    expect(shouldFlagEmail("matheo@")).toBe(true);
    expect(shouldFlagEmail("matheo@example.com")).toBe(false);
  });
});

describe("toAccountErrorCode", () => {
  it("conserva el motivo de un AccountError", () => {
    expect(toAccountErrorCode(new AccountError("unavailable"))).toBe("unavailable");
    expect(toAccountErrorCode(new AccountError("invalid_credentials"))).toBe("invalid_credentials");
  });

  it("cualquier otro error es desconocido", () => {
    expect(toAccountErrorCode(new Error("boom"))).toBe("unknown");
    expect(toAccountErrorCode("boom")).toBe("unknown");
  });
});
