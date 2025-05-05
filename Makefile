# Makefile for VS Code Extension

.PHONY: all install test lint format check pre-commit-setup clean compile watch help coverage

# Default target
all: compile

# Install dependencies
install:
	npm install

# Compile the extension
compile:
	npm run compile

# Watch for changes
watch:
	npm run watch

# Run tests
test: compile
	npm run test

# Run tests with coverage
coverage: compile
	npm run coverage

# Run linting
lint:
	npm run lint

# Format code
format:
	npm run format || npx prettier --write .

# Run checks (linting and tests)
check: lint test

# Set up git pre-commit hooks
pre-commit-setup:
	@echo "Setting up git pre-commit hooks..."
ifeq ($(OS),Windows_NT)
	@mkdir -p .git\hooks
	@copy pre-commit.bat .git\hooks\pre-commit
	@echo "Git pre-commit hooks installed successfully"
else
	@mkdir -p .git/hooks
	@cp pre-commit.sh .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Git pre-commit hooks installed successfully"
endif

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

# Help
help:
	@echo "Available commands:"
	@echo "  make              - Compile TypeScript code (default)"
	@echo "  make install      - Install dependencies"
	@echo "  make compile      - Compile TypeScript code"
	@echo "  make watch        - Watch for changes and compile automatically"
	@echo "  make test         - Run tests (compiles first)"
	@echo "  make coverage     - Run tests with code coverage reports"
	@echo "  make lint         - Run linting"
	@echo "  make format       - Format code"
	@echo "  make check        - Run linting and tests"
	@echo "  make pre-commit-setup - Set up git pre-commit hooks"
	@echo "  make clean        - Remove generated files"
	@echo "  make help         - Show this help message"