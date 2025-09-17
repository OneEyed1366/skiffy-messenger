.PHONY: help lint check test design-system-check analyze clean deps gen dev dev-stg dev-prod build build-staging build-prod

# Default target
help:
	@echo "Available commands:"
	@echo "  make lint                 - Run all linting checks"
	@echo "  make check                - Run all checks"
	@echo "  make test                 - Run tests"
	@echo "  make design-system-check  - Check design system compliance"
	@echo "  make analyze              - Run flutter analyze"
	@echo "  make clean                - Clean build artifacts"
	@echo "  make deps                 - Get dependencies"
	@echo "  make gen                  - Generate code"
	@echo "  make dev                  - Run app in development flavor"
	@echo "  make dev-stg              - Run app in staging flavor"
	@echo "  make dev-prod             - Run app in production flavor"
	@echo "  make build                - Build app with development flavor"
	@echo "  make build-staging        - Build app with staging flavor"
	@echo "  make build-prod           - Build app with production flavor"

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
	flutter analyze --no-fatal-infos

# Run tests
test:
	flutter test

# Comprehensive linting (includes design system checks)
lint: design-system-check analyze
	@echo "✅ All linting checks completed"

# Run everything
check: lint test
	@echo "✅ All checks passed!"

# Gen - run all code generation tasks concurrently
gen:
	@echo "🔧 Running code generation..."
	@flutter gen-l10n & \
	flutter pub run build_runner build --delete-conflicting-outputs & \
	flutter_rust_bridge_codegen generate & \
	wait
	@echo "✅ Code generation completed"

# Development commands with flavors
dev:
	@echo "🚀 Running app in development flavor..."
	flutter run --flavor development --target lib/flavors/main_development.dart

dev-stg:
	@echo "🚀 Running app in staging flavor..."
	flutter run --flavor staging --target lib/flavors/main_staging.dart

dev-prod:
	@echo "🚀 Running app in production flavor..."
	flutter run --flavor production --target lib/flavors/main_production.dart

# Build commands with flavors
build:
	@echo "🏗️  Building app with development flavor..."
	flutter build apk --flavor development --target lib/flavors/main_development.dart
	flutter build ios --flavor development --target lib/flavors/main_development.dart --no-codesign

build-staging:
	@echo "🏗️  Building app with staging flavor..."
	flutter build apk --flavor staging --target lib/flavors/main_staging.dart
	flutter build ios --flavor staging --target lib/flavors/main_staging.dart --no-codesign

build-prod:
	@echo "🏗️  Building app with production flavor..."
	flutter build apk --flavor production --target lib/flavors/main_production.dart
	flutter build ios --flavor production --target lib/flavors/main_production.dart --no-codesign