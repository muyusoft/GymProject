export const numberUtils = {
  /**
   * Redondea a N decimales
   */
  round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Formatea con separador de miles: 1234567 → "1,234,567" (EN) o "1.234.567" (ES)
   */
  formatWithSeparator(value: number, locale: string = "en-US"): string {
    return value.toLocaleString(locale);
  },

  /**
   * Calcula porcentaje
   */
  percentage(value: number, total: number, decimals: number = 2): number {
    if (total === 0) return 0;
    return this.round((value / total) * 100, decimals);
  },

  /**
   * Clampea un valor entre min y max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Mapea un rango a otro
   */
  map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  },
};
