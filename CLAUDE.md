# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Currency Trend Analyzer - A Deno TypeScript CLI application for analyzing currency exchange rates, detecting trends, and predicting future rates. Supports major world currencies including USD, EUR, GBP, and others. Follows the same code style and workflow patterns as the linkedin-rev-stats project.

## Project Structure

```
eu-currency/
├── Makefile                # Main orchestrator
├── Makefile.currency      # Currency-specific commands
├── Makefile.dev          # Development commands
├── scripts/              # TypeScript implementations
│   ├── currency/        # Currency conversion scripts
│   └── lib/            # Common libraries (logger, config, utilities)
├── tests/               # Test files mirroring scripts/
├── deno.json           # Deno configuration with strict TypeScript
├── import_map.json     # Import mappings
├── deps.ts             # Centralized dependencies
└── data/               # Currency exchange rate data
```

## Development Commands

```bash
# Setup and validation
make setup              # Check development environment
make validate          # Run all checks (format, lint, type-check)
make all              # Run validation and tests

# Development
make format           # Format code
make format-check    # Check formatting
make lint            # Lint code
make type-check      # Type check TypeScript
make test            # Run tests
make test-coverage   # Generate coverage report
make watch           # Watch mode for tests

# Currency Operations
make currency-convert        # Convert between currencies
make currency-rates         # Display current exchange rates
make currency-update        # Update exchange rate data
make currency-history       # Show historical rates

# Dependencies
make deps            # Cache dependencies
make deps-update     # Update dependencies
```

## Code Style Guidelines

- **TypeScript**: Strict mode with all checks enabled
- **Formatting**: 80-char lines, 2-space indent, double quotes
- **Testing**: BDD-style with describe/it blocks
- **Scripts**: Always include help text and proper arg parsing
- **Exports**: Export main functions for testability
- **Error Handling**: Structured with logger.error() and exit codes

## Common Patterns

### Script Template

```typescript
#!/usr/bin/env -S deno run --allow-read --allow-write

import { logger } from "@lib/logger.ts";
import { parseArgs } from "@lib/common.ts";

interface Options {
  // Define options
}

export async function mainFunction(options: Options): Promise<void> {
  // Implementation
}

if (import.meta.main) {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(`Usage: script.ts [OPTIONS]...`);
    Deno.exit(0);
  }
  try {
    await mainFunction(args);
  } catch (error) {
    logger.error(error);
    Deno.exit(1);
  }
}
```

## Testing

- Run `make test` before committing
- Aim for 80%+ coverage
- Tests mirror source structure in `tests/`
- Use mocks for external dependencies

## Key Considerations

- Handle currency data updates gracefully
- Support offline mode with cached rates
- Validate currency codes against ISO 4217
- Maintain precision for financial calculations