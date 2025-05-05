@echo off
setlocal enabledelayedexpansion

echo Running pre-commit hooks...

REM Store the current directory
for /f "tokens=*" %%a in ('git rev-parse --show-toplevel') do set "ROOT_DIR=%%a"
cd /d "%ROOT_DIR%"

REM Run linting
echo Running linting checks...
call make lint
set LINT_EXIT_CODE=%ERRORLEVEL%

if %LINT_EXIT_CODE% neq 0 (
    echo ❌ Linting failed! Please fix the issues before committing.
    exit /b 1
)

REM Run formatting check (don't modify files, just check)
echo Checking code formatting...
call npx prettier --check .
set FORMAT_EXIT_CODE=%ERRORLEVEL%

if %FORMAT_EXIT_CODE% neq 0 (
    echo ❌ Code formatting issues found! Run 'make format' to fix them.
    exit /b 1
)

REM Run tests
echo Running tests...
call make test
set TEST_EXIT_CODE=%ERRORLEVEL%

if %TEST_EXIT_CODE% neq 0 (
    echo ❌ Tests failed! Please fix the failing tests before committing.
    exit /b 1
)

echo ✅ All pre-commit checks passed!
exit /b 0
