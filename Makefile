# Makefile for VS Code Extension

.PHONY: all install test test-unit test-intg lint format check pre-commit-setup clean compile watch help coverage coverage-unit coverage-intg clean-test-output

# Default target
all: install-and-compile

# Install dependencies and compile (new default target)
install-and-compile: install compile

# Install dependencies
install:
	npm install

# Compile the extension
compile:
	npm run compile
	pre-commit install

# Watch for changes
watch: install
	npm run watch

# Run unit tests only (no VS Code window)
test: test-unit

cov: coverage-unit
# Run unit tests only (no VS Code window)
test-unit: compile
	npm run test:unit

# Run integration tests with VS Code window (clean build first to avoid unit test conflicts)
test-intg: clean-test-output compile
	npm run test:integration

# Run unit tests with coverage
coverage-unit: compile
	npm run test:unit:coverage

# Run integration tests with coverage (full tests including VS Code window)
coverage-intg: compile
	npm run test:integration:coverage

# Run all tests with coverage
coverage: coverage-unit

# Run linting
lint:
	npm run lint

# Format code
format:
	npm run format || npx prettier --write .

# Check for CI (run unit tests without VS Code window)
ci-check: test-unit lint

# Run checks (linting and tests)
check:
	pre-commit run --all-files

# Clean up generated files
clean:
ifeq ($(OS),Windows_NT)
	if exist out rmdir /s /q out
	if exist node_modules rmdir /s /q node_modules
	if exist coverage rmdir /s /q coverage
	if exist .nyc_output rmdir /s /q .nyc_output
else
	rm -rf out
	rm -rf node_modules
	rm -rf coverage
	rm -rf .nyc_output
endif

# Clean all test output files
clean-test-output:
ifeq ($(OS),Windows_NT)
	if exist out\tests rmdir /s /q out\tests
	mkdir out\tests\suite
else
	rm -rf out/tests
	mkdir -p out/tests/suite
endif

# Help
help:
	@echo "Available commands:"
	@echo "  make              - Compile TypeScript code (default)"
	@echo "  make install      - Install dependencies"
	@echo "  make install-and-compile - Install dependencies and compile TypeScript code"
	@echo "  make compile      - Compile TypeScript code"
	@echo "  make watch        - Watch for changes and compile automatically"
	@echo "  make test         - Run unit tests (no VS Code window) [alias for test-unit]"
	@echo "  make test-unit    - Run unit tests (no VS Code window)"
	@echo "  make test-intg    - Run integration tests with VS Code window"
	@echo "  make coverage     - Run unit tests with coverage reports [alias for coverage-unit]"
	@echo "  make coverage-unit - Run unit tests with coverage reports"
	@echo "  make coverage-intg - Run integration tests with coverage reports"
	@echo "  make ci-check     - Run checks for CI (unit tests and lint)"
	@echo "  make lint         - Run linting"
	@echo "  make format       - Format code"
	@echo "  make check        - Run linting and tests"
	@echo "  make clean        - Remove generated files"
	@echo "  make help         - Show this help message"
