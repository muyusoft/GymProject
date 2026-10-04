import type { WeightUnit } from "@/shared/types/training.types";

export const KG_PER_LB = 0.45359237;
const MAX_FRACTION_DIGITS = 1;

/** Convierte solo para mostrar o comparar; lo guardado conserva su unidad. */
export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) return value;
  return from === "lb" ? value * KG_PER_LB : value / KG_PER_LB;
}

/** Redondea al múltiplo más cercano del salto disponible del equipo. */
export function roundToIncrement(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: MAX_FRACTION_DIGITS,
  }).format(value);
}

interface FormatWeightOptions {
  value: number;
  unit: WeightUnit;
  locale: string;
}

export function formatWeight({
  value,
  unit,
  locale,
}: FormatWeightOptions): string {
  return `${formatNumber(value, locale)} ${unit}`;
}
