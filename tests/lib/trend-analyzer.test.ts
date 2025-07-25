import { assertAlmostEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { TrendAnalyzer } from "@lib/trend-analyzer.ts";
import type { HistoricalRates } from "@lib/data-fetcher.ts";

describe("TrendAnalyzer", () => {
  const analyzer = new TrendAnalyzer();

  const mockHistoricalData: HistoricalRates = {
    base: "EUR",
    target: "GBP",
    rates: [
      { date: "2024-01-01", rate: 0.86 },
      { date: "2024-01-02", rate: 0.87 },
      { date: "2024-01-03", rate: 0.865 },
      { date: "2024-01-04", rate: 0.88 },
      { date: "2024-01-05", rate: 0.875 },
      { date: "2024-01-06", rate: 0.89 },
      { date: "2024-01-07", rate: 0.885 },
      { date: "2024-01-08", rate: 0.90 },
    ],
  };

  describe("calculateMovingAverage", () => {
    it("should calculate correct moving average", () => {
      const rates = [1, 2, 3, 4, 5];
      const ma3 = analyzer.calculateMovingAverage(rates, 3);
      assertEquals(ma3, 4); // (3 + 4 + 5) / 3
    });

    it("should handle period longer than data", () => {
      const rates = [1, 2, 3];
      const ma5 = analyzer.calculateMovingAverage(rates, 5);
      assertEquals(ma5, 2); // (1 + 2 + 3) / 3
    });
  });

  describe("calculateVolatility", () => {
    it("should calculate zero volatility for constant rates", () => {
      const rates = [1, 1, 1, 1];
      const volatility = analyzer.calculateVolatility(rates);
      assertEquals(volatility, 0);
    });

    it("should calculate non-zero volatility for varying rates", () => {
      const rates = [1, 2, 3, 4];
      const volatility = analyzer.calculateVolatility(rates);
      assertAlmostEquals(volatility, 1.118, 0.001);
    });
  });

  describe("analyzeTrend", () => {
    it("should analyze trend metrics correctly", () => {
      const metrics = analyzer.analyzeTrend(mockHistoricalData);

      assertEquals(metrics.current, 0.90);
      assertEquals(metrics.min, 0.86);
      assertEquals(metrics.max, 0.90);
      assertAlmostEquals(metrics.mean, 0.878, 0.01);
      assertEquals(metrics.median, 0.88);
      assertEquals(metrics.trend, "up");
    });

    it("should calculate correct moving averages", () => {
      const metrics = analyzer.analyzeTrend(mockHistoricalData);

      assertAlmostEquals(metrics.movingAverages.ma7, 0.881, 0.01);
    });
  });

  describe("predictLinearTrend", () => {
    it("should generate linear predictions", () => {
      const predictions = analyzer.predictLinearTrend(mockHistoricalData, 3);

      assertEquals(predictions.length, 3);
      assertEquals(predictions[0].method, "linear");
      assertEquals(typeof predictions[0].predicted, "number");
      assertEquals(typeof predictions[0].confidence, "number");
    });

    it("should predict increasing trend for upward data", () => {
      const predictions = analyzer.predictLinearTrend(mockHistoricalData, 3);

      // Check that predictions exist and have reasonable values
      assertEquals(predictions.length, 3);
      predictions.forEach((p) => {
        assertEquals(typeof p.predicted, "number");
        assertEquals(p.predicted > 0, true);
      });
    });
  });

  describe("predictExponentialSmoothing", () => {
    it("should generate exponential smoothing predictions", () => {
      const predictions = analyzer.predictExponentialSmoothing(
        mockHistoricalData,
        3,
      );

      assertEquals(predictions.length, 3);
      assertEquals(predictions[0].method, "exponential");
    });
  });

  describe("getCombinedPredictions", () => {
    it("should average linear and exponential predictions", () => {
      const predictions = analyzer.getCombinedPredictions(
        mockHistoricalData,
        3,
      );

      assertEquals(predictions.length, 3);
      assertEquals(predictions[0].method, "combined");
    });
  });
});
