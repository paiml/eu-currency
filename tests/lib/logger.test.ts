import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { logger, LogLevel } from "@lib/logger.ts";

describe("Logger", () => {
  describe("log levels", () => {
    it("should log info messages by default", () => {
      const logStub = stub(console, "log");
      try {
        logger.info("Test message");
        assertEquals(logStub.calls.length, 1);
      } finally {
        logStub.restore();
      }
    });

    it("should not log debug messages by default", () => {
      const logStub = stub(console, "log");
      try {
        logger.debug("Debug message");
        assertEquals(logStub.calls.length, 0);
      } finally {
        logStub.restore();
      }
    });

    it("should log debug messages when level is DEBUG", () => {
      const logStub = stub(console, "log");
      try {
        logger.setLevel(LogLevel.DEBUG);
        logger.debug("Debug message");
        assertEquals(logStub.calls.length, 1);
        logger.setLevel(LogLevel.INFO);
      } finally {
        logStub.restore();
      }
    });
  });

  describe("error logging", () => {
    it("should log error messages", () => {
      const errorStub = stub(console, "error");
      try {
        logger.error("Error message");
        assertEquals(errorStub.calls.length, 1);
      } finally {
        errorStub.restore();
      }
    });

    it("should log Error objects with stack trace", () => {
      const errorStub = stub(console, "error");
      try {
        const error = new Error("Test error");
        logger.error(error);
        assertEquals(errorStub.calls.length, 2);
      } finally {
        errorStub.restore();
      }
    });
  });

  describe("currency logging", () => {
    it("should format currency conversion", () => {
      const logStub = stub(console, "log");
      try {
        logger.currency(100, "EUR", "GBP", 85.50);
        assertEquals(logStub.calls.length, 1);
        const output = logStub.calls[0].args[0];
        assertEquals(typeof output, "string");
        assertEquals(output.includes("100.00"), true);
        assertEquals(output.includes("EUR"), true);
        assertEquals(output.includes("85.50"), true);
        assertEquals(output.includes("GBP"), true);
      } finally {
        logStub.restore();
      }
    });
  });
});
