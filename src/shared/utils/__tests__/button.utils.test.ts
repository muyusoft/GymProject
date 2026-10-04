import { describe, expect, it } from "vitest";
import { getSemanticColors } from "@/design/tokens";
import { getButtonColors, isButtonInert } from "../button.utils";

const c = getSemanticColors("dark");

describe("getButtonColors", () => {
  it("usa accent con texto onAccent en primary", () => {
    expect(getButtonColors("primary", c)).toMatchObject({
      background: c.accent,
      foreground: c.onAccent,
    });
  });

  it("pinta danger como contorno, sin relleno", () => {
    const colors = getButtonColors("danger", c);
    expect(colors.foreground).toBe(c.danger);
    expect(colors.border).toBe(c.danger);
    expect(colors.background).not.toBe(c.danger);
  });

  it("deja ghost sin fondo ni borde", () => {
    const colors = getButtonColors("ghost", c);
    expect(colors.background).toBe(colors.border);
  });
});

describe("isButtonInert", () => {
  it("bloquea el toque si está deshabilitado o cargando", () => {
    expect(isButtonInert(true, false)).toBe(true);
    expect(isButtonInert(false, true)).toBe(true);
    expect(isButtonInert(false, false)).toBe(false);
  });
});
