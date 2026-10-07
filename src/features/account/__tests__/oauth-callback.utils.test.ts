import { describe, expect, it } from "vitest";
import { readOAuthCallback } from "../utils/oauth-callback.utils";

describe("readOAuthCallback", () => {
  it("saca el código de la dirección de vuelta, en Expo Go y en la app instalada", () => {
    expect(
      readOAuthCallback("exp://192.168.1.5:8081/--/auth-callback?code=abc123"),
    ).toEqual({
      kind: "code",
      code: "abc123",
    });
    expect(
      readOAuthCallback("overset://auth-callback?code=xyz&state=1"),
    ).toEqual({ kind: "code", code: "xyz" });
  });

  it("ignora lo que venga después de #", () => {
    expect(readOAuthCallback("overset://auth-callback?code=abc#")).toEqual({
      kind: "code",
      code: "abc",
    });
  });

  it("si la persona no dio permiso, el proveedor devuelve un error", () => {
    expect(
      readOAuthCallback(
        "overset://auth-callback?error=access_denied&error_description=User+denied",
      ),
    ).toEqual({ kind: "denied" });
  });

  it("sin código ni error no hay nada que canjear", () => {
    expect(readOAuthCallback("overset://auth-callback")).toEqual({
      kind: "empty",
    });
    expect(readOAuthCallback("overset://auth-callback?code=")).toEqual({
      kind: "empty",
    });
  });
});
