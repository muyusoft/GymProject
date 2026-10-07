import { beforeEach, describe, expect, it, vi } from "vitest";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/config/supabase";
import {
  requestPasswordReset,
  resendConfirmation,
  signIn,
  signInWithProvider,
  signUp,
} from "../services/account.service";
import { authFailureCode } from "../utils/account-error.utils";

vi.mock("expo-linking", () => ({
  createURL: (route: string) => `overset://${route}`,
}));
vi.mock("expo-web-browser", () => ({ openAuthSessionAsync: vi.fn() }));

vi.mock("@/config/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
  },
}));

const auth = vi.mocked(supabase.auth);
const CREDENTIALS = { email: "matheo@example.com", password: "overset1" };
const ok = { data: {}, error: null } as never;
const failure = (code: string) =>
  ({ data: {}, error: { code, name: "AuthApiError", status: 400 } }) as never;

beforeEach(() => vi.clearAllMocks());

describe("signIn", () => {
  it("entra con correo y contraseña", async () => {
    auth.signInWithPassword.mockResolvedValue(ok);
    await expect(signIn(CREDENTIALS)).resolves.toBeUndefined();
    expect(auth.signInWithPassword).toHaveBeenCalledWith(CREDENTIALS);
  });

  it("explica el fallo con un motivo conocido", async () => {
    auth.signInWithPassword.mockResolvedValue(failure("invalid_credentials"));
    await expect(signIn(CREDENTIALS)).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });
});

describe("signUp", () => {
  const input = { ...CREDENTIALS, name: "Matheo" };

  it("con sesión inmediata la cuenta queda iniciada", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { identities: [{}] }, session: {} },
      error: null,
    } as never);
    await expect(signUp(input)).resolves.toBe("signedIn");
  });

  it("sin sesión toca confirmar el correo", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { identities: [{}] }, session: null },
      error: null,
    } as never);
    await expect(signUp(input)).resolves.toBe("confirmEmail");
  });

  it("un usuario sin identidades es un correo ya registrado", async () => {
    auth.signUp.mockResolvedValue({
      data: { user: { identities: [] }, session: null },
      error: null,
    } as never);
    await expect(signUp(input)).rejects.toMatchObject({ code: "email_taken" });
  });

  it("propaga el motivo del servidor", async () => {
    auth.signUp.mockResolvedValue(failure("weak_password"));
    await expect(signUp(input)).rejects.toMatchObject({
      code: "weak_password",
    });
  });
});

describe("correos", () => {
  it("pide el enlace de recuperación y reenvía la confirmación", async () => {
    auth.resetPasswordForEmail.mockResolvedValue(ok);
    auth.resend.mockResolvedValue(ok);
    await requestPasswordReset(CREDENTIALS.email);
    await resendConfirmation(CREDENTIALS.email);
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(CREDENTIALS.email);
    expect(auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: CREDENTIALS.email,
    });
  });

  it("avisa cuando se piden demasiados correos", async () => {
    auth.resetPasswordForEmail.mockResolvedValue(
      failure("over_email_send_rate_limit"),
    );
    await expect(requestPasswordReset(CREDENTIALS.email)).rejects.toMatchObject(
      { code: "rate_limited" },
    );
  });
});

describe("signInWithProvider", () => {
  const openBrowser = vi.mocked(WebBrowser.openAuthSessionAsync);
  const authorized = {
    data: { url: "https://accounts.example/authorize" },
    error: null,
  } as never;

  it("abre el navegador y canjea el código de vuelta por la sesión", async () => {
    auth.signInWithOAuth.mockResolvedValue(authorized);
    openBrowser.mockResolvedValue({
      type: "success",
      url: "overset://auth-callback?code=abc",
    });
    auth.exchangeCodeForSession.mockResolvedValue(ok);

    await expect(signInWithProvider("google")).resolves.toBeUndefined();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "overset://auth-callback",
        skipBrowserRedirect: true,
      },
    });
    expect(openBrowser).toHaveBeenCalledWith(
      "https://accounts.example/authorize",
      "overset://auth-callback",
    );
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("cerrar la ventana o negar el permiso cuenta como cancelado, sin canjear nada", async () => {
    auth.signInWithOAuth.mockResolvedValue(authorized);
    openBrowser.mockResolvedValue({ type: "cancel" } as never);
    await expect(signInWithProvider("google")).rejects.toMatchObject({
      code: "cancelled",
    });

    openBrowser.mockResolvedValue({
      type: "success",
      url: "overset://auth-callback?error=access_denied",
    });
    await expect(signInWithProvider("google")).rejects.toMatchObject({
      code: "cancelled",
    });
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("propaga el fallo si el código no se puede canjear", async () => {
    auth.signInWithOAuth.mockResolvedValue(authorized);
    openBrowser.mockResolvedValue({
      type: "success",
      url: "overset://auth-callback?code=abc",
    });
    auth.exchangeCodeForSession.mockResolvedValue(
      failure("invalid_credentials"),
    );
    await expect(signInWithProvider("google")).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });
});

describe("authFailureCode", () => {
  it("reconoce la falta de conexión por el nombre del error", () => {
    expect(
      authFailureCode({ name: "AuthRetryableFetchError", status: 0 }),
    ).toBe("network");
  });

  it("traduce los códigos de Supabase", () => {
    expect(authFailureCode({ code: "email_not_confirmed" })).toBe(
      "email_not_confirmed",
    );
    expect(authFailureCode({ code: "user_already_exists" })).toBe(
      "email_taken",
    );
    expect(authFailureCode({ code: "email_exists" })).toBe("email_taken");
  });

  it("un 429 sin código es un límite de peticiones; lo demás es desconocido", () => {
    expect(authFailureCode({ status: 429 })).toBe("rate_limited");
    expect(authFailureCode({ code: "something_new", status: 400 })).toBe(
      "unknown",
    );
    expect(authFailureCode({})).toBe("unknown");
  });
});
