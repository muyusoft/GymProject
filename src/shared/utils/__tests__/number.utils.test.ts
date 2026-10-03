/**
 * Number utility tests
 */
import { numberUtils } from "../number.utils";

describe("Number Utils", () => {
  describe("round", () => {
    it("should round to 2 decimal places by default", () => {
      const result = numberUtils.round(1.234567);
      expect(result).toBe(1.23);
    });

    it("should round to specified decimal places", () => {
      const result = numberUtils.round(1.234567, 3);
      expect(result).toBe(1.235);
    });

    it("should round to 0 decimals", () => {
      const result = numberUtils.round(1.5, 0);
      expect(result).toBe(2);
    });

    it("should handle negative numbers", () => {
      const result = numberUtils.round(-1.567, 2);
      expect(result).toBe(-1.57);
    });
  });

  describe("formatWithSeparator", () => {
    it("should format with US locale", () => {
      const result = numberUtils.formatWithSeparator(1234567, "en-US");
      expect(result).toContain(",");
    });

    it("should format with ES locale", () => {
      const result = numberUtils.formatWithSeparator(1234567, "es-ES");
      expect(result).toBeTruthy();
    });

    it("should format small numbers", () => {
      const result = numberUtils.formatWithSeparator(123);
      expect(result).toBe("123");
    });
  });

  describe("percentage", () => {
    it("should calculate percentage", () => {
      const result = numberUtils.percentage(25, 100);
      expect(result).toBe(25);
    });

    it("should calculate partial percentage", () => {
      const result = numberUtils.percentage(1, 3);
      expect(result).toBe(33.33);
    });

    it("should handle zero total", () => {
      const result = numberUtils.percentage(25, 0);
      expect(result).toBe(0);
    });

    it("should respect decimal places", () => {
      const result = numberUtils.percentage(1, 3, 1);
      expect(result).toBe(33.3);
    });
  });

  describe("clamp", () => {
    it("should return value within range", () => {
      const result = numberUtils.clamp(5, 0, 10);
      expect(result).toBe(5);
    });

    it("should clamp to min", () => {
      const result = numberUtils.clamp(-5, 0, 10);
      expect(result).toBe(0);
    });

    it("should clamp to max", () => {
      const result = numberUtils.clamp(15, 0, 10);
      expect(result).toBe(10);
    });
  });

  describe("map", () => {
    it("should map value from one range to another", () => {
      const result = numberUtils.map(5, 0, 10, 0, 100);
      expect(result).toBe(50);
    });

    it("should map min value", () => {
      const result = numberUtils.map(0, 0, 10, 0, 100);
      expect(result).toBe(0);
    });

    it("should map max value", () => {
      const result = numberUtils.map(10, 0, 10, 0, 100);
      expect(result).toBe(100);
    });

    it("should handle inverted ranges", () => {
      const result = numberUtils.map(5, 0, 10, 100, 0);
      expect(result).toBe(50);
    });
  });
});
