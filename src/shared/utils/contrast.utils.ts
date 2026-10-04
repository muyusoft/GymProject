const HEX_PAIR_LENGTH = 2;
const CHANNEL_MAX = 255;
const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const FLARE = 0.05;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;

/** Mínimos de WCAG 2.1 AA: texto normal 4.5:1 y elementos gráficos o texto grande 3:1. */
export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_GRAPHIC_CONTRAST = 3;

function linearChannel(channel: number): number {
  const value = channel / CHANNEL_MAX;
  return value <= LINEAR_THRESHOLD
    ? value / LINEAR_DIVISOR
    : ((value + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
}

/** Luminancia relativa de un color "#rrggbb" (WCAG). */
export function relativeLuminance(hex: string): number {
  const digits = hex.replace("#", "");
  const [red, green, blue] = [0, 2, 4].map((start) =>
    linearChannel(Number.parseInt(digits.slice(start, start + HEX_PAIR_LENGTH), 16)),
  );
  return RED_WEIGHT * (red ?? 0) + GREEN_WEIGHT * (green ?? 0) + BLUE_WEIGHT * (blue ?? 0);
}

/** Relación de contraste entre dos colores, de 1 (iguales) a 21 (negro sobre blanco). */
export function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + FLARE) / ((darker ?? 0) + FLARE);
}
