#!/bin/bash

# Integration Test Runner for Flavored Flutter App
# This script provides commands to run integration tests with proper flavor configuration

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo -e "${GREEN}Flutter Integration Test Runner${NC}"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  dev       Run integration tests with development flavor"
    echo "  staging   Run integration tests with staging flavor"
    echo "  prod      Run integration tests with production flavor"
    echo "  unit      Run unit tests only (no flavor needed)"
    echo "  syntax    Check syntax only (dart analyze)"
    echo ""
    echo "Options:"
    echo "  -d, --device    Target device (macos, chrome, android, ios)"
    echo "  -f, --file      Specific test file to run"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                                   # Run all integration tests with dev flavor"
    echo "  $0 dev -d chrome                        # Run on Chrome browser"
    echo "  $0 dev -f auth_flow_test.dart           # Run specific test"
    echo "  $0 unit                                  # Run unit tests only"
    echo "  $0 syntax                               # Check syntax"
}

# Function to run integration tests with flavor
run_integration_test() {
    local flavor=$1
    local device=${2:-"macos"}
    local test_file=${3:-""}

    echo -e "${YELLOW}Running integration tests with $flavor flavor on $device...${NC}"

    # Set the test file path
    if [ -z "$test_file" ]; then
        test_path="integration_test/"
    else
        test_path="integration_test/$test_file"
    fi

    # Try flutter test first (modern approach)
    echo -e "${YELLOW}Attempting flutter test command...${NC}"
    if flutter test "$test_path" --flavor "$flavor" -d "$device" 2>/dev/null; then
        echo -e "${GREEN}✅ Integration tests passed!${NC}"
        return 0
    fi

    echo -e "${YELLOW}Flutter test failed, trying flutter drive approach...${NC}"

    # Fallback to flutter drive (older approach)
    local main_file="lib/flavors/main_$flavor.dart"

    if [ ! -f "$main_file" ]; then
        echo -e "${RED}❌ Main file not found: $main_file${NC}"
        return 1
    fi

    # Use flutter drive for integration tests
    flutter drive \
        --target="$main_file" \
        --driver="$test_path" \
        --flavor="$flavor" \
        -d "$device"
}

# Function to run unit tests only
run_unit_tests() {
    echo -e "${YELLOW}Running unit tests...${NC}"
    flutter test test/ -d vm
}

# Function to check syntax
check_syntax() {
    echo -e "${YELLOW}Checking syntax with dart analyze...${NC}"
    dart analyze integration_test/ test/ lib/
    echo -e "${GREEN}✅ Syntax check completed!${NC}"
}

# Parse command line arguments
DEVICE="macos"
TEST_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            COMMAND="dev"
            shift
            ;;
        staging|stg)
            COMMAND="staging"
            shift
            ;;
        prod|production)
            COMMAND="production"
            shift
            ;;
        unit)
            COMMAND="unit"
            shift
            ;;
        syntax)
            COMMAND="syntax"
            shift
            ;;
        -d|--device)
            DEVICE="$2"
            shift 2
            ;;
        -f|--file)
            TEST_FILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Execute based on command
case $COMMAND in
    dev)
        run_integration_test "development" "$DEVICE" "$TEST_FILE"
        ;;
    staging)
        run_integration_test "staging" "$DEVICE" "$TEST_FILE"
        ;;
    production)
        run_integration_test "production" "$DEVICE" "$TEST_FILE"
        ;;
    unit)
        run_unit_tests
        ;;
    syntax)
        check_syntax
        ;;
    *)
        echo -e "${RED}No command specified${NC}"
        usage
        exit 1
        ;;
esac