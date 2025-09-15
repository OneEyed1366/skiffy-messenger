.PHONY: help lint test design-system-check analyze clean deps gen

# Default target
help:
	@echo "Available commands:"
	@echo "  make lint                 - Run all linting checks"
	@echo "  make test                 - Run tests"
	@echo "  make design-system-check  - Check design system compliance"
	@echo "  make analyze              - Run flutter analyze"
	@echo "  make clean                - Clean build artifacts"
	@echo "  make deps                 - Get dependencies"
	@echo "  make gen                  - Generate code"

# Install dependencies
deps:
	flutter pub get

# Clean build artifacts
clean:
	flutter clean
	flutter pub get

# Design system compliance check
design-system-check:
	@echo "🎨 Checking design system compliance..."
	dart scripts/check_colors.dart

# Run flutter analyze
analyze:
	flutter analyze

# Run tests
test:
	flutter test

# Comprehensive linting (includes design system checks)
lint: design-system-check analyze
	@echo "✅ All linting checks completed"

# Run everything
check-all: lint test
	@echo "✅ All checks passed!"

# Gen
gen:
	flutter gen-l10n
	flutter pub run build_runner build --delete-conflicting-outputs
	flutter_rust_bridge_codegen generate