# Main Makefile for EU Currency Converter
# Includes category-specific makefiles for modular organization

# Terminal colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
RESET := \033[0m

# Default target
.DEFAULT_GOAL := help

# Include category-specific makefiles
-include Makefile.currency
-include Makefile.dev

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)EU Currency Converter$(RESET)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(RESET)"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}' | \
		sort

.PHONY: validate
validate: ## Run all validation checks (format, lint, type-check)
	@echo "$(BLUE)Running validation checks...$(RESET)"
	@$(MAKE) format-check
	@$(MAKE) lint
	@$(MAKE) type-check
	@echo "$(GREEN)✓ All validation checks passed$(RESET)"

.PHONY: test
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(RESET)"
	@deno test --allow-all --coverage=coverage_tmp
	@echo "$(GREEN)✓ All tests passed$(RESET)"

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Running tests with coverage...$(RESET)"
	@rm -rf coverage_tmp coverage
	@deno test --allow-all --coverage=coverage_tmp
	@deno coverage coverage_tmp --lcov > coverage.lcov
	@deno coverage coverage_tmp
	@echo "$(GREEN)✓ Coverage report generated$(RESET)"

.PHONY: all
all: validate test ## Run all validation checks and tests
	@echo "$(GREEN)✓ All checks passed$(RESET)"

.PHONY: setup
setup: ## Check development environment
	@echo "$(BLUE)Checking development environment...$(RESET)"
	@command -v deno >/dev/null 2>&1 || { echo "$(RED)✗ Deno is not installed$(RESET)"; exit 1; }
	@echo "$(GREEN)✓ Deno is installed$(RESET)"
	@deno --version
	@echo ""
	@echo "$(GREEN)✓ Development environment is ready$(RESET)"

.PHONY: clean
clean: ## Clean generated files
	@echo "$(BLUE)Cleaning generated files...$(RESET)"
	@rm -rf coverage coverage_tmp coverage.lcov
	@echo "$(GREEN)✓ Clean complete$(RESET)"