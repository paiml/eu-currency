#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { logger } from "@lib/logger.ts";
import {
  formatPercentage,
  parseArgs,
  percentageChange,
  validateCurrencyCode,
} from "@lib/common.ts";
import { dataFetcher } from "@lib/data-fetcher.ts";
import { trendAnalyzer } from "@lib/trend-analyzer.ts";
import { blue, bold, gray, green, red, yellow } from "@std/fmt/colors";

interface Options {
  help?: boolean;
  from?: string;
  to?: string;
  days?: number;
  predict?: number;
  format?: "text" | "json";
  [key: string]: unknown;
}

function printHelp(): void {
  console.log(`
${bold("EU Currency Trend Report")}

${bold("Usage:")} trend-report.ts [OPTIONS]

${bold("Options:")}
  -h, --help              Show this help message
  -f, --from <currency>   Base currency (default: EUR)
  -t, --to <currency>     Target currency (default: GBP)
  -d, --days <number>     Days of historical data (default: 30)
  -p, --predict <number>  Days to predict ahead (default: 7)
  --format <text|json>    Output format (default: text)

${bold("Examples:")}
  # Show EUR/GBP trend for last 30 days with 7-day prediction
  deno run trend-report.ts

  # Show EUR/CHF trend for last 60 days with 14-day prediction
  deno run trend-report.ts --from EUR --to CHF --days 60 --predict 14

  # Output as JSON
  deno run trend-report.ts --format json
`);
}

function drawSparkline(values: number[], width = 20): string {
  if (values.length === 0) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return "─".repeat(width);

  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const step = values.length / width;

  let sparkline = "";
  for (let i = 0; i < width; i++) {
    const index = Math.floor(i * step);
    const value = values[index];
    const normalized = (value - min) / range;
    const charIndex = Math.floor(normalized * (chars.length - 1));
    sparkline += chars[charIndex];
  }

  return sparkline;
}

function formatTrendReport(
  base: string,
  target: string,
  historical: any,
  metrics: any,
  predictions: any[],
): void {
  console.log("\n" + bold(blue(`${base}/${target} Currency Trend Report`)));
  console.log("═".repeat(50));

  // Current Status
  console.log("\n" + bold("Current Status"));
  console.log(`  Rate: ${bold(metrics.current.toFixed(4))}`);
  console.log(
    `  Change: ${
      metrics.changePercent >= 0
        ? green(formatPercentage(metrics.changePercent))
        : red(formatPercentage(metrics.changePercent))
    }`,
  );
  console.log(
    `  Trend: ${
      metrics.trend === "up"
        ? green("▲ UP")
        : metrics.trend === "down"
        ? red("▼ DOWN")
        : yellow("→ STABLE")
    }`,
  );

  // Historical Analysis
  console.log("\n" + bold("Historical Analysis"));
  console.log(
    `  Period: ${historical.rates[0].date} to ${
      historical.rates[historical.rates.length - 1].date
    }`,
  );
  console.log(`  Mean: ${metrics.mean.toFixed(4)}`);
  console.log(`  Median: ${metrics.median.toFixed(4)}`);
  console.log(`  Range: ${metrics.min.toFixed(4)} - ${metrics.max.toFixed(4)}`);
  console.log(`  Volatility: ${metrics.volatility.toFixed(4)}`);

  // Moving Averages
  console.log("\n" + bold("Moving Averages"));
  console.log(`  7-day: ${metrics.movingAverages.ma7.toFixed(4)}`);
  console.log(`  14-day: ${metrics.movingAverages.ma14.toFixed(4)}`);
  console.log(`  30-day: ${metrics.movingAverages.ma30.toFixed(4)}`);

  // Rate Chart
  console.log("\n" + bold("Rate Chart (Last 30 Days)"));
  const rates = historical.rates.slice(-30).map((r: any) => r.rate);
  const sparkline = drawSparkline(rates, 40);
  console.log(
    `  ${gray(metrics.min.toFixed(2))} ${sparkline} ${
      gray(metrics.max.toFixed(2))
    }`,
  );

  // Predictions
  if (predictions.length > 0) {
    console.log("\n" + bold("Predictions"));
    console.log(gray("  Date        Rate      Confidence"));
    console.log(gray("  ────────── ──────── ───────────"));

    predictions.forEach((p) => {
      const confidence = p.confidence >= 70
        ? green(`${p.confidence.toFixed(0)}%`)
        : p.confidence >= 50
        ? yellow(`${p.confidence.toFixed(0)}%`)
        : red(`${p.confidence.toFixed(0)}%`);

      console.log(`  ${p.date}  ${p.predicted.toFixed(4)}   ${confidence}`);
    });

    const avgPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0) /
      predictions.length;
    const predictedChange = percentageChange(metrics.current, avgPredicted);

    console.log(
      `\n  ${bold("Expected Change:")} ${
        predictedChange >= 0
          ? green(formatPercentage(predictedChange))
          : red(formatPercentage(predictedChange))
      }`,
    );
  }

  console.log("\n" + "═".repeat(50) + "\n");
}

export async function generateTrendReport(options: Options): Promise<void> {
  const {
    from = "EUR",
    to = "GBP",
    days = 30,
    predict = 7,
    format = "text",
  } = options;

  // Validate currencies
  if (!validateCurrencyCode(from)) {
    throw new Error(`Invalid base currency: ${from}`);
  }
  if (!validateCurrencyCode(to)) {
    throw new Error(`Invalid target currency: ${to}`);
  }

  // Suppress logs for JSON output
  const showLogs = format !== "json";

  // Fetch historical data
  if (showLogs) logger.task("Fetching historical rates...");
  const historical = await dataFetcher.fetchHistoricalRates(
    from.toUpperCase(),
    to.toUpperCase(),
    days,
  );

  // Analyze trends
  if (showLogs) logger.task("Analyzing trends...");
  const metrics = trendAnalyzer.analyzeTrend(historical);

  // Generate predictions
  if (showLogs) logger.task("Generating predictions...");
  const predictions = predict > 0
    ? trendAnalyzer.getCombinedPredictions(historical, predict)
    : [];

  // Output results
  if (format === "json") {
    const output = {
      base: from.toUpperCase(),
      target: to.toUpperCase(),
      period: {
        start: historical.rates[0].date,
        end: historical.rates[historical.rates.length - 1].date,
        days: historical.rates.length,
      },
      metrics,
      predictions,
      historical: historical.rates,
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    formatTrendReport(
      from.toUpperCase(),
      to.toUpperCase(),
      historical,
      metrics,
      predictions,
    );
  }
}

if (import.meta.main) {
  const args = parseArgs<Options>(Deno.args);

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  try {
    await generateTrendReport(args);
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)));
    Deno.exit(1);
  }
}
