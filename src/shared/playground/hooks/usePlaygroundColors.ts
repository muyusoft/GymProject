import { useMemo } from "react";
import { useThemeStore } from "@/shared/store";
import { tokens } from "@/design/tokens";
import type { PlaygroundColors } from "../types/playground.types";

export function usePlaygroundColors(): PlaygroundColors {
  const { theme } = useThemeStore();

  return useMemo(() => {
    const isDark = theme === "dark";
    return {
      bgColor: isDark ? tokens.colors.neutral[950] : tokens.colors.neutral[50],
      textColor: isDark
        ? tokens.colors.neutral[50]
        : tokens.colors.neutral[950],
      accentColor: isDark
        ? tokens.colors.primary[400]
        : tokens.colors.primary[600],
      sectionBg: isDark
        ? tokens.colors.neutral[900]
        : tokens.colors.neutral[100],
      borderColor: isDark
        ? tokens.colors.neutral[800]
        : tokens.colors.neutral[200],
    };
  }, [theme]);
}
