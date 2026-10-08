import type { SemanticColors } from "@/design/tokens";

export interface TabColors {
  icon: string;
  label: string;
}

export function getTabColors(isFocused: boolean, c: SemanticColors): TabColors {
  if (isFocused) return { icon: c.accentText, label: c.text };
  return { icon: c.textSecondary, label: c.textSecondary };
}

/**
 * Qué parte del margen inferior del sistema deja la barra bajo sus pestañas. En iPhone ese margen (34) es
 * bastante más alto que la línea de inicio, que ocupa solo su tercio inferior: con todo el margen las
 * pestañas quedan flotando lejos del borde; con esta fracción bajan sin llegar a tocar la línea.
 */
const BOTTOM_INSET_SHARE = 0.6;

export function tabBarBottomPadding(bottomInset: number): number {
  return Math.round(Math.max(bottomInset, 0) * BOTTOM_INSET_SHARE);
}
