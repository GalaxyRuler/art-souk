#!/bin/bash

# Art Souk - Codex Execution Scripts
# This script provides all the commands needed for development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🎨 Art Souk - $1${NC}"
    echo "================================"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Show usage
show_usage() {
    echo "Usage: ./codex-scripts.sh <command>"
    echo ""
    echo "Available commands:"
    echo "  setup          - Initial project setup"
    echo "  install        - Install dependencies"
    echo "  dev            - Start development server"
    echo "  build          - Build for production"
    echo "  lint           - Run ESLint"
    echo "  lint-fix       - Fix ESLint issues"
    echo "  check          - TypeScript type checking"
    echo "  test           - Run tests"
    echo "  test-watch     - Run tests in watch mode"
    echo "  test-coverage  - Run tests with coverage"
    echo "  db-push        - Push database schema"
    echo "  db-studio      - Open database studio"
    echo "  format         - Format code with Prettier"
    echo "  clean          - Clean cache and build files"
    echo "  health         - Check application health"
    echo "  full-check     - Run all checks (lint, type, test)"
    echo "  memory-fix     - Fix memory issues"
    echo ""
}

# Setup project
setup() {
    print_header "Project Setup"

    # Install dependencies
    print_info "Installing dependencies..."
    npm install

    # Create environment file
    if [ ! -f .env.local ]; then
        echo "DATABASE_URL=postgresql://localhost:5432/art_souk" > .env.local
        echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env.local
        echo "NODE_ENV=development" >> .env.local
        print_success "Created .env.local"
    fi

    # Setup database
    print_info "Setting up database..."
    npm run db:push

    print_success "Setup complete!"
}

# Install dependencies
install() {
    print_header "Installing Dependencies"
    npm install
    print_success "Dependencies installed"
}

# Development server
dev() {
    print_header "Starting Development Server"
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm run dev
}

# Build for production
build() {
    print_header "Building for Production"
    npm run build
    print_success "Build complete"
}

# Lint code
lint() {
    print_header "Running ESLint"
    npx eslint . --ext .ts,.tsx --max-warnings 0
    if [ $? -eq 0 ]; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
    fi
}

# Fix lint issues
lint_fix() {
    print_header "Fixing ESLint Issues"
    npx eslint . --ext .ts,.tsx --fix
    print_success "ESLint fixes applied"
}

# TypeScript check
check() {
    print_header "TypeScript Type Checking"
    npx tsc --noEmit
    if [ $? -eq 0 ]; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
    fi
}

# Run tests
test() {
    print_header "Running Tests"
    npx vitest run
    if [ $? -eq 0 ]; then
        print_success "Tests passed"
    else
        print_error "Tests failed"
    fi
}

# Run tests in watch mode
test_watch() {
    print_header "Running Tests in Watch Mode"
    npx vitest
}

# Run tests with coverage
test_coverage() {
    print_header "Running Tests with Coverage"
    npx vitest run --coverage
}

# Database operations
db_push() {
    print_header "Pushing Database Schema"
    npm run db:push
    print_success "Database schema updated"
}

db_studio() {
    print_header "Opening Database Studio"
    npx drizzle-kit studio
}

# Format code
format() {
    print_header "Formatting Code"
    npx prettier --write .
    print_success "Code formatted"
}

# Clean cache and build files
clean() {
    print_header "Cleaning Cache and Build Files"
    rm -rf node_modules/.cache dist .turbo coverage
    npm cache clean --force
    print_success "Cache and build files cleaned"
}

# Check application health
health() {
    print_header "Checking Application Health"
    curl -s http://localhost:5000/api/health || echo "Application not running"
}

# Full check (lint, type, test)
full_check() {
    print_header "Running Full Check"

    print_info "1. Running TypeScript check..."
    npx tsc --noEmit
    if [ $? -ne 0 ]; then
        print_error "TypeScript check failed"
        return 1
    fi

    print_info "2. Running ESLint..."
    npx eslint . --ext .ts,.tsx --max-warnings 0
    if [ $? -ne 0 ]; then
        print_error "ESLint check failed"
        return 1
    fi

    print_info "3. Running tests..."
    npx vitest run
    if [ $? -ne 0 ]; then
        print_error "Tests failed"
        return 1
    fi

    print_info "4. Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Build failed"
        return 1
    fi

    print_success "All checks passed!"
}

# Fix memory issues
memory_fix() {
    print_header "Fixing Memory Issues"
    export NODE_OPTIONS="--max-old-space-size=4096"

    # Clear caches
    npm cache clean --force
    rm -rf node_modules/.cache

    # Restart with memory fix
    print_info "Restarting with increased memory limit..."
    npm run dev
}

# Main script logic
case "$1" in
    setup)
        setup
        ;;
    install)
        install
        ;;
    dev)
        dev
        ;;
    build)
        build
        ;;
    lint)
        lint
        ;;
    lint-fix)
        lint_fix
        ;;
    check)
        check
        ;;
    test)
        test
        ;;
    test-watch)
        test_watch
        ;;
    test-coverage)
        test_coverage
        ;;
    db-push)
        db_push
        ;;
    db-studio)
        db_studio
        ;;
    format)
        format
        ;;
    clean)
        clean
        ;;
    health)
        health
        ;;
    full-check)
        full_check
        ;;
    memory-fix)
        memory_fix
        ;;
    *)
        show_usage
        ;;
esac