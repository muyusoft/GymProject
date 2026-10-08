import { describe, expect, it } from "vitest";
import { getSemanticColors } from "@/design/tokens";
import { getTabColors, tabBarBottomPadding } from "../tab-bar.utils";

const c = getSemanticColors("dark");

describe("getTabColors", () => {
  it("pinta el icono activo en accentText y su texto en text", () => {
    expect(getTabColors(true, c)).toEqual({
      icon: c.accentText,
      label: c.text,
    });
  });

  it("pinta la tab inactiva en textSecondary", () => {
    expect(getTabColors(false, c)).toEqual({
      icon: c.textSecondary,
      label: c.textSecondary,
    });
  });
});

describe("tabBarBottomPadding", () => {
  it("deja una parte del margen del sistema, no todo", () => {
    expect(tabBarBottomPadding(34)).toBe(20);
  });

  it("sin margen del sistema no añade nada", () => {
    expect(tabBarBottomPadding(0)).toBe(0);
    expect(tabBarBottomPadding(-5)).toBe(0);
  });
});
