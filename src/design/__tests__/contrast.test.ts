import { describe, expect, it } from "vitest";
import { MIN_GRAPHIC_CONTRAST, MIN_TEXT_CONTRAST, contrastRatio } from "@/shared/utils/contrast.utils";
import { getSemanticColors, type SemanticColors, type ThemeMode } from "../tokens";

const MODES: readonly ThemeMode[] = ["dark", "light"];

/** Texto sobre el fondo en que realmente se dibuja en las pantallas. */
const TEXT_PAIRS: readonly (readonly [keyof SemanticColors, keyof SemanticColors])[] = [
  ["text", "background"],
  ["text", "surface"],
  ["text", "surfaceAlt"],
  ["textSecondary", "background"],
  ["textSecondary", "surface"],
  ["textSecondary", "surfaceAlt"],
  ["accentText", "background"],
  ["accentText", "surface"],
  ["accentText", "surfaceAlt"],
  ["onAccent", "accent"],
  ["surface", "reward"],
  ["reward", "surface"],
  ["reward", "background"],
  ["danger", "surface"],
  ["danger", "background"],
  ["info", "surface"],
  ["info", "surfaceAlt"],
];

/**
 * Barras, puntos, celdas y la figura muscular: basta 3:1 (WCAG 1.4.11). El volt puro (accent) solo se usa
 * como relleno con texto o icono oscuro encima; para marcas sueltas se usa accentText, que en claro es verde oscuro.
 */
const GRAPHIC_PAIRS: readonly (readonly [keyof SemanticColors, keyof SemanticColors])[] = [
  ["accentText", "background"],
  ["accentText", "surfaceAlt"],
  ["onAccent", "info"],
  ["info", "surface"],
  ["musclePrimary", "background"],
  ["recoveryWorked", "background"],
  ["recoveryRecovering", "background"],
  ["recoveryReady", "background"],
];

describe.each(MODES)("contraste del tema %s", (mode) => {
  const colors = getSemanticColors(mode);

  it.each(TEXT_PAIRS)("%s sobre %s cumple 4.5:1 para texto", (foreground, background) => {
    expect(contrastRatio(colors[foreground], colors[background])).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it.each(GRAPHIC_PAIRS)("%s sobre %s cumple 3:1 para iconos y bordes", (foreground, background) => {
    expect(contrastRatio(colors[foreground], colors[background])).toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
  });
});

describe("contrastRatio", () => {
  it("vale 21 entre negro y blanco y 1 entre colores iguales", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1);
  });

  it("no depende del orden de los colores", () => {
    expect(contrastRatio("#0e0f0c", "#c6ff3d")).toBeCloseTo(contrastRatio("#c6ff3d", "#0e0f0c"));
  });
});
