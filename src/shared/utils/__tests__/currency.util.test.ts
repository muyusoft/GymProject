/**
 * Currency utility tests
 */
import { currencyUtils } from "../currency.utils";

describe("Currency Utils", () => {
  describe("format", () => {
    it("should format USD with default locale", () => {
      const result = currencyUtils.format(1234.56, "USD", "en");
      expect(result).toContain("$");
    });

    it("should format EUR", () => {
      const result = currencyUtils.format(1000, "EUR", "en");
      expect(result).toContain("€");
    });

    it("should handle zero amount", () => {
      const result = currencyUtils.format(0, "USD", "en");
      expect(result).toContain("$");
      expect(result).toContain("0");
    });

    it("should handle negative amounts", () => {
      const result = currencyUtils.format(-500, "USD", "en");
      expect(result).toBeDefined();
    });
  });

  describe("formatNumber", () => {
    it("should format number without currency symbol", () => {
      const result = currencyUtils.formatNumber(1234.56, "en");
      expect(result).toBeDefined();
    });
  });

  describe("parse", () => {
    it("should parse currency string to number", () => {
      const result = currencyUtils.parse("$1,234.56", "en");
      expect(result).toBe(1234.56);
    });

    it("should handle ES format", () => {
      const result = currencyUtils.parse("1.234,56", "es");
      expect(result).toBe(1234.56);
    });
  });

  describe("formatPrecision", () => {
    it("should format with custom precision", () => {
      const result = currencyUtils.formatPrecision(1234.56789, 3, "USD", "en");
      expect(result).toBeDefined();
      expect(result).toContain("$");
    });

    it("should handle zero decimal places", () => {
      const result = currencyUtils.formatPrecision(1234.56, 0, "USD", "en");
      expect(result).toBeDefined();
      expect(result).toContain("$");
    });

    it("should handle high precision (5 decimals)", () => {
      const result = currencyUtils.formatPrecision(1234.56789, 5, "USD", "en");
      expect(result).toBeDefined();
    });

    it("should handle ES locale with precision", () => {
      const result = currencyUtils.formatPrecision(1234.56789, 2, "USD", "es");
      expect(result).toBeDefined();
    });
  });

  describe("formatNumber", () => {
    it("should format with default locale", () => {
      const result = currencyUtils.formatNumber(1234.56);
      expect(result).toBeDefined();
      expect(result).toContain("1");
    });

    it("should format with ES locale", () => {
      const result = currencyUtils.formatNumber(1234.56, "es");
      expect(result).toBeDefined();
    });

    it("should handle zero", () => {
      const result = currencyUtils.formatNumber(0);
      expect(result).toContain("0");
    });

    it("should handle negative numbers", () => {
      const result = currencyUtils.formatNumber(-999.99);
      expect(result).toBeDefined();
      expect(result).toContain("-");
    });
  });

  describe("parse", () => {
    it("should handle USD format with spaces", () => {
      const result = currencyUtils.parse("$ 1,234.56", "en");
      expect(result).toBe(1234.56);
    });

    it("should handle empty string", () => {
      const result = currencyUtils.parse("", "en");
      expect(result).toBe(0);
    });

    it("should handle string with only currency symbol", () => {
      const result = currencyUtils.parse("$", "en");
      expect(result).toBe(0);
    });

    it("should handle ES format with multiple dots", () => {
      const result = currencyUtils.parse("1.234.567,89 EUR", "es");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle decimal-only strings", () => {
      const result = currencyUtils.parse("0.99", "en");
      expect(result).toBe(0.99);
    });
  });
});
