import type { SemanticColors } from "@/design/tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonColors {
  background: string;
  foreground: string;
  border: string;
}

const TRANSPARENT = "transparent";

export function getButtonColors(
  variant: ButtonVariant,
  c: SemanticColors,
): ButtonColors {
  switch (variant) {
    case "primary":
      return { background: c.accent, foreground: c.onAccent, border: c.accent };
    case "secondary":
      return { background: c.surfaceAlt, foreground: c.text, border: c.border };
    case "ghost":
      return { background: TRANSPARENT, foreground: c.text, border: TRANSPARENT };
    case "danger":
      return { background: TRANSPARENT, foreground: c.danger, border: c.danger };
  }
}

/** Un botón cargando o deshabilitado no responde al toque. */
export function isButtonInert(isDisabled: boolean, isLoading: boolean): boolean {
  return isDisabled || isLoading;
}
