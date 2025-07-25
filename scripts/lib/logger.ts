#!/usr/bin/env -S deno run --allow-read --allow-write

import { blue, bold, gray, green, red, yellow } from "@std/fmt/colors";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(gray(`[DEBUG] ${message}`));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(blue(`[INFO] ${message}`));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(yellow(`[WARN] ${message}`));
    }
  }

  error(message: string | Error): void {
    if (this.level <= LogLevel.ERROR) {
      const msg = message instanceof Error ? message.message : message;
      console.error(red(`[ERROR] ${msg}`));
      if (message instanceof Error && message.stack) {
        console.error(gray(message.stack));
      }
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(green(`✓ ${message}`));
    }
  }

  task(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(bold(blue(`→ ${message}`)));
    }
  }

  result(label: string, value: string | number): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`  ${label}: ${bold(String(value))}`);
    }
  }

  currency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    result: number,
  ): void {
    if (this.level <= LogLevel.INFO) {
      console.log(
        `  ${bold(amount.toFixed(2))} ${fromCurrency} = ${
          bold(result.toFixed(2))
        } ${toCurrency}`,
      );
    }
  }
}

export const logger = new Logger();
