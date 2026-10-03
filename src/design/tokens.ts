import tokensJson from "./tokens.json";

export const tokens = tokensJson;

export type TokensType = typeof tokensJson;
export type ThemeMode = "light" | "dark";

export interface SemanticColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  overlay: string;
}

/**
 * Obtiene un token por ruta: getToken('colors.primary.500')
 */
export const getToken = (path: string): any => {
  const tokenObj = tokens as Record<string, any>;
  return path.split(".").reduce((acc, part) => acc?.[part], tokenObj);
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
