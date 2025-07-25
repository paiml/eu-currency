#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { logger } from "@lib/logger.ts";
import { ensureDir, sleep } from "@lib/common.ts";
import { join } from "@std/path";

export interface RateData {
  date: string;
  base: string;
  rates: Record<string, number>;
}

export interface HistoricalRates {
  base: string;
  target: string;
  rates: Array<{
    date: string;
    rate: number;
  }>;
}

const CACHE_DIR = "./data/cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class CurrencyDataFetcher {
  private baseUrl = "https://api.frankfurter.app";

  constructor() {
    ensureDir(CACHE_DIR);
  }

  private getCacheKey(endpoint: string): string {
    return join(CACHE_DIR, `${endpoint.replace(/\//g, "_")}.json`);
  }

  private async getFromCache(key: string): Promise<unknown | null> {
    try {
      const stat = await Deno.stat(key);
      if (Date.now() - stat.mtime!.getTime() > CACHE_DURATION) {
        return null;
      }
      const data = await Deno.readTextFile(key);
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async saveToCache(key: string, data: unknown): Promise<void> {
    await Deno.writeTextFile(key, JSON.stringify(data, null, 2));
  }

  async fetchLatestRates(base = "EUR"): Promise<RateData> {
    const endpoint = `latest?from=${base}`;
    const cacheKey = this.getCacheKey(endpoint);

    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      logger.debug("Using cached latest rates");
      return cached as RateData;
    }

    logger.debug(`Fetching latest rates for ${base}...`);
    const response = await fetch(`${this.baseUrl}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`);
    }

    const data = await response.json();
    await this.saveToCache(cacheKey, data);

    return data as RateData;
  }

  async fetchHistoricalRates(
    base: string,
    target: string,
    days = 30,
  ): Promise<HistoricalRates> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const endpoint = `${start}..${end}?from=${base}&to=${target}`;
    const cacheKey = this.getCacheKey(endpoint);

    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      logger.debug("Using cached historical rates");
      return this.transformHistoricalData(cached as any, base, target);
    }

    logger.debug(
      `Fetching historical rates ${base}/${target} from ${start} to ${end}...`,
    );

    const response = await fetch(`${this.baseUrl}/${endpoint}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch historical rates: ${response.statusText}`,
      );
    }

    const data = await response.json();
    await this.saveToCache(cacheKey, data);

    return this.transformHistoricalData(data, base, target);
  }

  private transformHistoricalData(
    data: any,
    base: string,
    target: string,
  ): HistoricalRates {
    const rates = Object.entries(data.rates).map((
      [date, rateData]: [string, any],
    ) => ({
      date,
      rate: rateData[target] || 0,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      base,
      target,
      rates,
    };
  }

  async fetchMultipleHistoricalRates(
    base: string,
    targets: string[],
    days = 30,
  ): Promise<Map<string, HistoricalRates>> {
    const results = new Map<string, HistoricalRates>();

    for (const target of targets) {
      try {
        const data = await this.fetchHistoricalRates(base, target, days);
        results.set(target, data);
        await sleep(100); // Rate limiting
      } catch (error) {
        logger.error(`Failed to fetch ${base}/${target}: ${error}`);
      }
    }

    return results;
  }
}

export const dataFetcher = new CurrencyDataFetcher();
