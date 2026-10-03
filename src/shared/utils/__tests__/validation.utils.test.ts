/**
 * Validation utility tests
 */
import { validationUtils } from "../validation.utils";

describe("Validation Utils", () => {
  describe("isValidEmail", () => {
    it("should validate correct email", () => {
      expect(validationUtils.isValidEmail("user@example.com")).toBe(true);
    });

    it("should reject email without @", () => {
      expect(validationUtils.isValidEmail("userexample.com")).toBe(false);
    });

    it("should reject email without domain", () => {
      expect(validationUtils.isValidEmail("user@.com")).toBe(false);
    });

    it("should reject email with spaces", () => {
      expect(validationUtils.isValidEmail("user @example.com")).toBe(false);
    });

    it("should validate email with subdomain", () => {
      expect(validationUtils.isValidEmail("user@mail.example.com")).toBe(true);
    });
  });

  describe("isValidPhone", () => {
    it("should validate Ecuador phone with +593", () => {
      expect(validationUtils.isValidPhone("+593 999 123 456")).toBe(true);
    });

    it("should validate Ecuador phone with 0", () => {
      expect(validationUtils.isValidPhone("0999123456")).toBe(true);
    });

    it("should reject invalid phone", () => {
      expect(validationUtils.isValidPhone("123456")).toBe(false);
    });

    it("should handle phone with hyphens", () => {
      expect(validationUtils.isValidPhone("+593-999-123-456")).toBe(true);
    });
  });

  describe("isValidURL", () => {
    it("should validate http URL", () => {
      expect(validationUtils.isValidURL("http://example.com")).toBe(true);
    });

    it("should validate https URL", () => {
      expect(validationUtils.isValidURL("https://example.com")).toBe(true);
    });

    it("should reject invalid URL", () => {
      expect(validationUtils.isValidURL("not a url")).toBe(false);
    });

    it("should validate URL with path", () => {
      expect(validationUtils.isValidURL("https://example.com/path")).toBe(true);
    });
  });

  describe("isNotEmpty", () => {
    it("should validate non-empty string", () => {
      expect(validationUtils.isNotEmpty("hello")).toBe(true);
    });

    it("should reject empty string", () => {
      expect(validationUtils.isNotEmpty("")).toBe(false);
    });

    it("should reject whitespace only", () => {
      expect(validationUtils.isNotEmpty("   ")).toBe(false);
    });

    it("should trim whitespace", () => {
      expect(validationUtils.isNotEmpty("  hello  ")).toBe(true);
    });
  });

  describe("minLength", () => {
    it("should validate string meeting minimum length", () => {
      expect(validationUtils.minLength("hello", 3)).toBe(true);
    });

    it("should reject string below minimum length", () => {
      expect(validationUtils.minLength("hi", 3)).toBe(false);
    });

    it("should accept exact minimum length", () => {
      expect(validationUtils.minLength("hello", 5)).toBe(true);
    });
  });

  describe("maxLength", () => {
    it("should validate string within maximum length", () => {
      expect(validationUtils.maxLength("hello", 10)).toBe(true);
    });

    it("should reject string exceeding maximum length", () => {
      expect(validationUtils.maxLength("hello world", 5)).toBe(false);
    });

    it("should accept exact maximum length", () => {
      expect(validationUtils.maxLength("hello", 5)).toBe(true);
    });
  });

  describe("isNumber", () => {
    it("should validate number", () => {
      expect(validationUtils.isNumber(123)).toBe(true);
    });

    it("should validate string number", () => {
      expect(validationUtils.isNumber("123")).toBe(true);
    });

    it("should reject non-number string", () => {
      expect(validationUtils.isNumber("abc")).toBe(false);
    });

    it("should reject null", () => {
      expect(validationUtils.isNumber(null)).toBe(false);
    });

    it("should handle decimal numbers", () => {
      expect(validationUtils.isNumber(123.45)).toBe(true);
    });
  });
});
