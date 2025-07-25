#!/usr/bin/env -S deno run --allow-read --allow-write

import { HistoricalRates } from "@lib/data-fetcher.ts";
import { percentageChange, roundCurrency } from "@lib/common.ts";

export interface TrendMetrics {
  current: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  volatility: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
  movingAverages: {
    ma7: number;
    ma14: number;
    ma30: number;
  };
}

export interface PredictionData {
  date: string;
  predicted: number;
  confidence: number;
  method: string;
}

export class TrendAnalyzer {
  calculateMovingAverage(rates: number[], period: number): number {
    if (rates.length < period) {
      return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    }
    const slice = rates.slice(-period);
    return slice.reduce((sum, rate) => sum + rate, 0) / period;
  }

  calculateVolatility(rates: number[]): number {
    if (rates.length < 2) return 0;

    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const variance =
      rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) /
      rates.length;

    return Math.sqrt(variance);
  }

  analyzeTrend(historical: HistoricalRates): TrendMetrics {
    const rates = historical.rates.map((r) => r.rate);

    if (rates.length === 0) {
      throw new Error("No historical data available");
    }

    const current = rates[rates.length - 1];
    const previous = rates[rates.length - 2] || current;
    const changePercent = percentageChange(previous, current);

    const sorted = [...rates].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;

    let trend: "up" | "down" | "stable";
    const ma7 = this.calculateMovingAverage(rates, 7);
    const ma14 = this.calculateMovingAverage(rates, 14);

    if (current > ma7 && ma7 > ma14) {
      trend = "up";
    } else if (current < ma7 && ma7 < ma14) {
      trend = "down";
    } else {
      trend = "stable";
    }

    return {
      current: roundCurrency(current),
      mean: roundCurrency(mean),
      median: roundCurrency(median),
      min: roundCurrency(Math.min(...rates)),
      max: roundCurrency(Math.max(...rates)),
      volatility: roundCurrency(this.calculateVolatility(rates)),
      trend,
      changePercent: roundCurrency(changePercent),
      movingAverages: {
        ma7: roundCurrency(ma7),
        ma14: roundCurrency(ma14),
        ma30: roundCurrency(this.calculateMovingAverage(rates, 30)),
      },
    };
  }

  predictLinearTrend(
    historical: HistoricalRates,
    daysAhead: number,
  ): PredictionData[] {
    const rates = historical.rates.map((r) => r.rate);
    if (rates.length < 2) {
      throw new Error("Not enough data for prediction");
    }

    // Simple linear regression
    const n = rates.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const sumX = indices.reduce((sum, x) => sum + x, 0);
    const sumY = rates.reduce((sum, y) => sum + y, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * rates[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions: PredictionData[] = [];
    const volatility = this.calculateVolatility(rates);
    const lastDate = new Date(
      historical.rates[historical.rates.length - 1].date,
    );

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      const predictedValue = intercept + slope * (n - 1 + i);
      const confidence = Math.max(0, 100 - (volatility * 10) - (i * 2));

      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        predicted: roundCurrency(predictedValue),
        confidence: roundCurrency(confidence),
        method: "linear",
      });
    }

    return predictions;
  }

  predictExponentialSmoothing(
    historical: HistoricalRates,
    daysAhead: number,
    alpha = 0.3,
  ): PredictionData[] {
    const rates = historical.rates.map((r) => r.rate);
    if (rates.length < 2) {
      throw new Error("Not enough data for prediction");
    }

    // Exponential smoothing
    let smoothed = rates[0];
    for (let i = 1; i < rates.length; i++) {
      smoothed = alpha * rates[i] + (1 - alpha) * smoothed;
    }

    const predictions: PredictionData[] = [];
    const volatility = this.calculateVolatility(rates);
    const lastDate = new Date(
      historical.rates[historical.rates.length - 1].date,
    );
    const trend = (rates[rates.length - 1] - rates[rates.length - 2]) * alpha;

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      smoothed = smoothed + trend * (1 - Math.pow(1 - alpha, i));
      const confidence = Math.max(0, 95 - (volatility * 15) - (i * 3));

      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        predicted: roundCurrency(smoothed),
        confidence: roundCurrency(confidence),
        method: "exponential",
      });
    }

    return predictions;
  }

  getCombinedPredictions(
    historical: HistoricalRates,
    daysAhead: number,
  ): PredictionData[] {
    const linear = this.predictLinearTrend(historical, daysAhead);
    const exponential = this.predictExponentialSmoothing(historical, daysAhead);

    return linear.map((l, i) => ({
      date: l.date,
      predicted: roundCurrency((l.predicted + exponential[i].predicted) / 2),
      confidence: roundCurrency((l.confidence + exponential[i].confidence) / 2),
      method: "combined",
    }));
  }
}

export const trendAnalyzer = new TrendAnalyzer();
