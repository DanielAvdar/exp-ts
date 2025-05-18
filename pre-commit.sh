#!/bin/bash

echo "Running pre-commit hooks..."

# Store the current directory
ROOT_DIR=$(git rev-parse --show-toplevel)
cd "$ROOT_DIR"

# Run linting
echo "Running linting checks..."
make lint
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -ne 0 ]; then
    echo "❌ Linting failed! Please fix the issues before committing."
    exit 1
fi

# Run formatting check (don't modify files, just check)
echo "Checking code formatting..."
npx prettier --check . > /dev/null 2>&1
FORMAT_EXIT_CODE=$?

if [ $FORMAT_EXIT_CODE -ne 0 ]; then
    echo "❌ Code formatting issues found! Run 'make format' to fix them."
    exit 1
fi

# Run tests
echo "Running tests..."
make test
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ Tests failed! Please fix the failing tests before committing."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0
