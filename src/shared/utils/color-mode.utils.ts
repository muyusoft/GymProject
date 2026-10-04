import type { ThemeMode } from "@/design/tokens";

export type ThemePreference = ThemeMode | "auto";

/** Oscuro por defecto: solo pasa a claro si el usuario o el sistema lo piden. */
export function resolveColorMode(
  preference: ThemePreference,
  system: string | null | undefined,
): ThemeMode {
  if (preference !== "auto") return preference;
  return system === "light" ? "light" : "dark";
}
