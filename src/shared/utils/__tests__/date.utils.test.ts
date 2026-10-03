/**
 * Date utility tests
 */
import { dateUtils } from "../date.utils";

describe("Date Utils", () => {
  const testDate = new Date("2025-01-12T14:30:00Z");
  const testDateISO = "2025-01-12T14:30:00Z";
  const pastDate = new Date("2025-01-05T10:00:00Z");

  describe("formatDate", () => {
    it("should format date from Date object", () => {
      const result = dateUtils.formatDate(testDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should format date from ISO string", () => {
      const result = dateUtils.formatDate(testDateISO);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should handle invalid dates", () => {
      const result = dateUtils.formatDate(new Date("invalid"));
      expect(result).toBe("Invalid date");
    });

    it("should format different dates consistently", () => {
      const result1 = dateUtils.formatDate(testDate);
      const result2 = dateUtils.formatDate(pastDate);

      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      expect(result1).not.toBe(result2);
    });
  });

  describe("formatDateTime", () => {
    it("should format date with time", () => {
      const result = dateUtils.formatDateTime(testDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should include time component", () => {
      const result = dateUtils.formatDateTime(testDate);
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe("formatTime", () => {
    it("should format only time", () => {
      const result = dateUtils.formatTime(testDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should be shorter than full date-time", () => {
      const dateTime = dateUtils.formatDateTime(testDate);
      const time = dateUtils.formatTime(testDate);
      expect(time.length).toBeLessThan(dateTime.length);
    });
  });

  describe("formatRelative", () => {
    it("should format relative time", () => {
      const result = dateUtils.formatRelative(testDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("should contain suffix like 'ago' or 'in'", () => {
      const result = dateUtils.formatRelative(testDate);
      const hasAgoOrIn = result.includes("ago") || result.includes("in");
      expect(hasAgoOrIn).toBeTruthy();
    });
  });

  describe("toISO", () => {
    it("should convert to ISO string", () => {
      const result = dateUtils.toISO(testDate);
      expect(result).toContain("T");
      expect(result).toContain("Z");
    });

    it("should be valid ISO format", () => {
      const result = dateUtils.toISO(testDate);
      const parsed = new Date(result);
      expect(parsed.getTime()).toBe(testDate.getTime());
    });
  });

  describe("today", () => {
    it("should return current date", () => {
      const result = dateUtils.today();
      expect(result instanceof Date).toBe(true);
      expect(result.getTime()).toBeCloseTo(Date.now(), -3);
    });
  });
});
