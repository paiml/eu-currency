import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  formatCurrency,
  formatPercentage,
  percentageChange,
  roundCurrency,
  validateCurrencyCode,
} from "@lib/common.ts";

describe("Common utilities", () => {
  describe("formatCurrency", () => {
    it("should format EUR currency correctly", () => {
      const result = formatCurrency(1234.56, "EUR");
      assertEquals(result, "€1,234.56");
    });

    it("should format GBP currency correctly", () => {
      const result = formatCurrency(999.99, "GBP");
      assertEquals(result, "£999.99");
    });
  });

  describe("percentageChange", () => {
    it("should calculate positive percentage change", () => {
      const result = percentageChange(100, 150);
      assertEquals(result, 50);
    });

    it("should calculate negative percentage change", () => {
      const result = percentageChange(100, 75);
      assertEquals(result, -25);
    });

    it("should handle zero old value", () => {
      const result = percentageChange(0, 100);
      assertEquals(result, 100);
    });
  });

  describe("formatPercentage", () => {
    it("should format positive percentage with + sign", () => {
      const result = formatPercentage(12.345);
      assertEquals(result, "+12.35%");
    });

    it("should format negative percentage", () => {
      const result = formatPercentage(-8.765);
      assertEquals(result, "-8.77%");
    });
  });

  describe("validateCurrencyCode", () => {
    it("should validate EUR", () => {
      assertEquals(validateCurrencyCode("EUR"), true);
    });

    it("should validate GBP", () => {
      assertEquals(validateCurrencyCode("GBP"), true);
    });

    it("should validate USD", () => {
      assertEquals(validateCurrencyCode("USD"), true);
    });

    it("should validate lowercase currency code", () => {
      assertEquals(validateCurrencyCode("eur"), true);
    });

    it("should reject invalid currency code", () => {
      assertEquals(validateCurrencyCode("JPY"), false);
    });
  });

  describe("roundCurrency", () => {
    it("should round to 2 decimal places", () => {
      assertEquals(roundCurrency(10.126), 10.13);
      assertEquals(roundCurrency(10.124), 10.12);
      assertEquals(roundCurrency(10.125), 10.13);
    });
  });
});
