import { useColorScheme } from "react-native";
import {
  getSemanticColors,
  type SemanticColors,
  type ThemeMode,
} from "@/design/tokens";
import { useThemeStore } from "@/shared/store";
import { resolveColorMode } from "@/shared/utils/color-mode.utils";

/** Modo efectivo (preferencia del usuario o sistema, oscuro por defecto) y sus colores semánticos. */
export function useOverloadTheme(): { mode: ThemeMode; c: SemanticColors } {
  const preference = useThemeStore((state) => state.theme);
  const mode = resolveColorMode(preference, useColorScheme());
  return { mode, c: getSemanticColors(mode) };
}
