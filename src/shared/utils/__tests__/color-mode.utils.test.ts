import { describe, expect, it } from "vitest";
import { resolveColorMode } from "../color-mode.utils";

describe("resolveColorMode", () => {
  it("respeta una preferencia explícita aunque el sistema diga otra cosa", () => {
    expect(resolveColorMode("light", "dark")).toBe("light");
    expect(resolveColorMode("dark", "light")).toBe("dark");
  });

  it("sigue al sistema en auto cuando es claro", () => {
    expect(resolveColorMode("auto", "light")).toBe("light");
  });

  it("usa oscuro en auto si el sistema no informa esquema", () => {
    expect(resolveColorMode("auto", null)).toBe("dark");
    expect(resolveColorMode("auto", undefined)).toBe("dark");
    expect(resolveColorMode("auto", "unspecified")).toBe("dark");
  });
});
