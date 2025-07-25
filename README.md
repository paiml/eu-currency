# EU Currency Converter

A CLI-based currency trend analyzer and predictor built with Deno and TypeScript. Provides historical analysis, trend detection, and future predictions for major world currencies.

## Features

- 📊 **Historical Rate Analysis** - Fetch and analyze up to 90 days of historical exchange rates
- 📈 **Trend Detection** - Identify up, down, or stable trends using moving averages
- 🔮 **Future Predictions** - Forecast exchange rates using linear regression and exponential smoothing
- 📉 **Visual Charts** - ASCII sparkline charts for rate visualization
- 💾 **Smart Caching** - Reduces API calls with intelligent 24-hour cache
- 🌍 **Multi-Currency Support** - Supports EUR, USD, GBP, CHF, SEK, NOK, and more

## Installation

1. Install [Deno](https://deno.land/) (required)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/eu-currency.git
   cd eu-currency
   ```
3. Run setup validation:
   ```bash
   make setup
   ```

## Usage

### Basic Trend Report
```bash
# Default EUR/GBP analysis (30 days history, 7 day prediction)
make currency-trend

# USD to EUR analysis
make currency-trend ARGS="--from USD --to EUR"
```

### Advanced Options
```bash
# 90 days of history with 30-day prediction
make currency-trend ARGS="--from EUR --to CHF --days 90 --predict 30"

# JSON output for programmatic use
make currency-trend ARGS="--from USD --to EUR --format json"
```

### Available Commands
```bash
make help              # Show all available commands
make lint              # Run code linting
make test              # Run tests
make test-coverage     # Run tests with coverage report
make format            # Format code
make all               # Run all validations and tests
```

## Example Output

```
EUR/GBP Currency Trend Report
══════════════════════════════════════════════════

Current Status
  Rate: 0.8700
  Change: +0.12%
  Trend: ▲ UP

Historical Analysis
  Period: 2025-06-25 to 2025-07-24
  Mean: 0.8600
  Median: 0.8600
  Range: 0.8500 - 0.8700
  Volatility: 0.0100

Moving Averages
  7-day: 0.8700
  14-day: 0.8650
  30-day: 0.8600

Rate Chart (Last 30 Days)
  0.85 ▁▁▁▁▂▂▃▃▄▅▅▅▄▄▅▅▆▆▇▇██▇▇▆▆▇▇▇▇ 0.87

Predictions
  Date        Rate      Confidence
  ────────── ──────── ───────────
  2025-07-25  0.8710   95%
  2025-07-26  0.8715   92%
  2025-07-27  0.8720   90%
```

## Supported Currencies

- **EUR** - Euro
- **USD** - US Dollar
- **GBP** - British Pound
- **CHF** - Swiss Franc
- **SEK** - Swedish Krona
- **NOK** - Norwegian Krone
- **DKK** - Danish Krone
- **PLN** - Polish Zloty
- **CZK** - Czech Koruna
- **HUF** - Hungarian Forint
- **RON** - Romanian Leu
- **BGN** - Bulgarian Lev
- **HRK** - Croatian Kuna
- **ISK** - Icelandic Króna

## Technical Details

- **Language**: TypeScript with Deno runtime
- **API**: [Frankfurter API](https://www.frankfurter.app/) for exchange rates
- **Architecture**: Modular design with separate components for data fetching, analysis, and reporting
- **Testing**: BDD-style tests with >65% coverage
- **Code Style**: Strict TypeScript, formatted with deno fmt

## Project Structure

```
eu-currency/
├── scripts/
│   ├── currency/       # Currency-specific tools
│   │   └── trend-report.ts
│   └── lib/           # Shared libraries
│       ├── common.ts
│       ├── logger.ts
│       ├── data-fetcher.ts
│       └── trend-analyzer.ts
├── tests/             # Test files
├── data/cache/        # API response cache
├── Makefile          # Main commands
├── deno.json         # Deno configuration
└── import_map.json   # Import mappings
```

## Development

This project follows the same patterns as [linkedin-rev-stats](https://github.com/yourusername/linkedin-rev-stats):
- Makefile-driven workflow
- Strict TypeScript configuration
- BDD-style testing
- Modular architecture

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`make test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT License - see LICENSE file for details.