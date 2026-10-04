import tokensJson from "./tokens.json";

export const tokens = tokensJson;

export type TokensType = typeof tokensJson;
export type ThemeMode = "light" | "dark";

/**
 * Colores semánticos de Overload. Los 7 primeros vienen del template;
 * el resto son propios de Overload (acento volt, premio ember, figura muscular, recuperación).
 */
export interface SemanticColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  overlay: string;
  accent: string;
  onAccent: string;
  accentText: string;
  reward: string;
  danger: string;
  info: string;
  musclePrimary: string;
  muscleSecondary: string;
  muscleIdle: string;
  recoveryWorked: string;
  recoveryRecovering: string;
  recoveryReady: string;
}

export type TextStyleName = keyof typeof tokensJson.typography.styles;
export type FontFamilyName = keyof typeof tokensJson.typography.fontFamily;

/**
 * Obtiene un token por ruta: getToken('colors.primary.500')
 */
export const getToken = (path: string): unknown => {
  const tokenObj = tokens as Record<string, unknown>;
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
      tokenObj,
    );
};

/**
 * Obtiene semantic tokens para el modo especificado
 */
export const getSemanticColors = (mode: ThemeMode): SemanticColors => {
  const semantic = tokens.semantic as Record<ThemeMode, SemanticColors>;
  return semantic[mode];
};

/**
 * Obtiene semantic color específico por nombre y modo
 */
export const getSemanticColor = (
  colorName: keyof SemanticColors,
  mode: ThemeMode,
): string => {
  const semantic = tokens.semantic as Record<ThemeMode, SemanticColors>;
  return semantic[mode][colorName];
};

/**
 * Resuelve un estilo de texto de Overload (displayXl, numeric, label...) a un objeto de estilo de React Native.
 */
export const getTextStyle = (name: TextStyleName) => {
  const style = tokens.typography.styles[name];
  const family = tokens.typography.fontFamily[style.fontFamily as FontFamilyName];
  return {
    fontFamily: family,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    ...("letterSpacing" in style ? { letterSpacing: style.letterSpacing } : {}),
    ...("textTransform" in style ? { textTransform: style.textTransform as "uppercase" } : {}),
    ...("tabularNums" in style ? { fontVariant: ["tabular-nums" as const] } : {}),
  };
};
