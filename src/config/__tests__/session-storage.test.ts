import * as SecureStore from "expo-secure-store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { secureSessionStorage, splitIntoChunks } from "../session-storage";

const stored = new Map<string, string>();

beforeEach(() => {
  stored.clear();
  vi.mocked(SecureStore.getItemAsync).mockImplementation((key) =>
    Promise.resolve(stored.get(key) ?? null),
  );
  vi.mocked(SecureStore.setItemAsync).mockImplementation((key, value) => {
    stored.set(key, value);
    return Promise.resolve();
  });
  vi.mocked(SecureStore.deleteItemAsync).mockImplementation((key) => {
    stored.delete(key);
    return Promise.resolve();
  });
});

describe("splitIntoChunks", () => {
  it("reparte el texto en trozos del tamaño pedido, con el resto al final", () => {
    expect(splitIntoChunks("abcdefg", 3)).toEqual(["abc", "def", "g"]);
  });

  it("un texto vacío no genera trozos", () => {
    expect(splitIntoChunks("", 3)).toEqual([]);
  });
});

describe("secureSessionStorage", () => {
  it("guarda un valor largo en varios trozos y lo devuelve entero", async () => {
    const session = "x".repeat(5000);
    await secureSessionStorage.setItem("sb-token", session);
    expect(stored.get("sb-token.chunks")).toBe("3");
    expect(await secureSessionStorage.getItem("sb-token")).toBe(session);
  });

  it("no deja trozos viejos al guardar un valor más corto", async () => {
    await secureSessionStorage.setItem("sb-token", "x".repeat(5000));
    await secureSessionStorage.setItem("sb-token", "corto");
    expect(await secureSessionStorage.getItem("sb-token")).toBe("corto");
    expect(stored.has("sb-token.1")).toBe(false);
  });

  it("al borrar no queda nada", async () => {
    await secureSessionStorage.setItem("sb-token", "x".repeat(5000));
    await secureSessionStorage.removeItem("sb-token");
    expect(stored.size).toBe(0);
    expect(await secureSessionStorage.getItem("sb-token")).toBeNull();
  });

  it("sin nada guardado, o con un trozo perdido, devuelve null", async () => {
    expect(await secureSessionStorage.getItem("sb-token")).toBeNull();
    await secureSessionStorage.setItem("sb-token", "x".repeat(5000));
    stored.delete("sb-token.1");
    expect(await secureSessionStorage.getItem("sb-token")).toBeNull();
  });
});
