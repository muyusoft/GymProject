import i18n from "@/config/i18n";

interface CurrencyFormat {
  symbol: string;
  decimal: string;
  thousands: string;
  precision: number;
}

const CURRENCIES: Record<string, CurrencyFormat> = {
  USD: { symbol: "$", decimal: ".", thousands: ",", precision: 2 },
  EUR: { symbol: "€", decimal: ",", thousands: ".", precision: 2 },
  // Ecuador (USD es la moneda oficial)
};

export const currencyUtils = {
  /**
   * Formatea moneda con símbolo, separador de miles y decimales
   * Ejemplos: $1,234.56 (EN) o 1.234,56 USD (ES)
   */
  format(amount: number, currency: string = "USD", locale?: string): string {
    const lang = locale || i18n.language;
    const curr = CURRENCIES[currency] || CURRENCIES.USD;

    const formatted = amount.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      minimumFractionDigits: curr.precision,
      maximumFractionDigits: curr.precision,
    });

    // En español: "1.234,56 USD", en inglés: "$1,234.56"
    return lang === "es"
      ? `${formatted} ${currency}`
      : `${curr.symbol}${formatted}`;
  },

  /**
   * Solo número formateado (sin símbolo): "1,234.56" (EN) o "1.234,56" (ES)
   */
  formatNumber(amount: number, locale?: string): string {
    const lang = locale || i18n.language;
    return amount.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  /**
   * Parse de string a número
   * "1,234.56" → 1234.56 (EN)
   * "1.234,56" → 1234.56 (ES)
   */
  parse(value: string, locale?: string): number {
    const lang = locale || i18n.language;
    const isES = lang === "es";

    // Remover símbolo de moneda
    let cleaned = value.replace(/[^0-9,.-]/g, "");

    if (isES) {
      // "1.234,56" → "1234.56"
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // "1,234.56" → "1234.56"
      cleaned = cleaned.replace(/,/g, "");
    }

    return parseFloat(cleaned) || 0;
  },

  /**
   * Formatea con precisión variable (útil para precios vs inversiones)
   */
  formatPrecision(
    amount: number,
    precision: number = 2,
    currency: string = "USD",
  ): string {
    const curr = CURRENCIES[currency] || CURRENCIES.USD;
    const lang = i18n.language;

    const formatted = amount.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });

    return lang === "es"
      ? `${formatted} ${currency}`
      : `${curr.symbol}${formatted}`;
  },
};
