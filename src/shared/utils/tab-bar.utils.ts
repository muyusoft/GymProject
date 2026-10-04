import type { SemanticColors } from "@/design/tokens";

export interface TabColors {
  icon: string;
  label: string;
}

export function getTabColors(isFocused: boolean, c: SemanticColors): TabColors {
  if (isFocused) return { icon: c.accentText, label: c.text };
  return { icon: c.textSecondary, label: c.textSecondary };
}
