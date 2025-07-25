#!/usr/bin/env -S deno run --allow-read --allow-write

import { parse } from "@std/flags";

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
  date: string;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
}

export async function runCommand(
  cmd: string[],
  options?: Deno.CommandOptions,
): Promise<CommandResult> {
  if (!cmd[0]) {
    throw new Error("Command array must not be empty");
  }
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    ...options,
  });

  const { code, stdout, stderr } = await command.output();

  return {
    success: code === 0,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
    code,
  };
}

export function parseArgs<T extends Record<string, unknown>>(
  args: string[],
  defaults?: Partial<T>,
): T {
  const parsed = parse(args, {
    default: defaults || {},
    boolean: ["help", "verbose", "debug", "quiet", "offline"],
    string: ["from", "to", "amount", "date", "format", "output"],
    alias: {
      h: "help",
      v: "verbose",
      d: "debug",
      q: "quiet",
      f: "from",
      t: "to",
      a: "amount",
      o: "output",
    },
  });

  return parsed as T;
}

export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "en-EU",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

export function validateCurrencyCode(code: string): boolean {
  const supportedCurrencies = [
    "EUR",
    "USD",
    "GBP",
    "CHF",
    "SEK",
    "NOK",
    "DKK",
    "PLN",
    "CZK",
    "HUF",
    "RON",
    "BGN",
    "HRK",
    "ISK",
  ];
  return supportedCurrencies.includes(code.toUpperCase());
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
