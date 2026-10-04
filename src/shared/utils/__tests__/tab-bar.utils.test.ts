import { describe, expect, it } from "vitest";
import { getSemanticColors } from "@/design/tokens";
import { getTabColors } from "../tab-bar.utils";

const c = getSemanticColors("dark");

describe("getTabColors", () => {
  it("pinta el icono activo en accentText y su texto en text", () => {
    expect(getTabColors(true, c)).toEqual({ icon: c.accentText, label: c.text });
  });

  it("pinta la tab inactiva en textSecondary", () => {
    expect(getTabColors(false, c)).toEqual({
      icon: c.textSecondary,
      label: c.textSecondary,
    });
  });
});
