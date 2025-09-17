#!/bin/bash
# Design System Validation Script
# Runs all design system compliance checks

set -e

echo "🎨 Running Design System Validation Checks..."
echo ""

# 1. Check for magic color usage (custom script)
echo "1. Checking for magic color usage..."
dart scripts/check_colors.dart

# 2. Run custom lint rules (if available)
echo ""
echo "2. Running custom lint rules..."
if command -v dart_custom_lint &> /dev/null; then
    dart run custom_lint
else
    echo "   ℹ️  custom_lint not available, using script-based checking"
fi

# 3. Run flutter lint
echo ""
echo "3. Running Flutter analysis..."
flutter analyze

# 4. Run tests
echo ""
echo "4. Running tests..."
flutter test

echo ""
echo "✅ All design system validation checks passed!"