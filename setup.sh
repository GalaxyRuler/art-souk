#!/bin/bash

# Art Souk Development Setup Script
# This script sets up the development environment for the Art Souk platform

echo "🎨 Art Souk Development Setup"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

print_success "Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm is installed: $(npm --version)"

# Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    print_info "Creating .env.local file..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
    else
        # Create a basic .env.local file
        cat > .env.local << EOF
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/art_souk

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)

# Replit Configuration (if using Replit)
REPL_ID=
REPLIT_DB_URL=

# Optional Services
SENDGRID_API_KEY=
PERPLEXITY_API_KEY=

# Development Mode
NODE_ENV=development
EOF
        print_success "Created .env.local with default values"
    fi
    
    print_info "Please update DATABASE_URL in .env.local with your PostgreSQL credentials"
else
    print_success ".env.local already exists"
fi

# Check if PostgreSQL is running (basic check)
if command -v psql &> /dev/null; then
    print_info "PostgreSQL appears to be installed"
    print_info "Make sure PostgreSQL is running and accessible"
else
    print_error "PostgreSQL not found. Please install PostgreSQL and ensure it's running"
    print_info "You can still continue, but database operations will fail"
fi

# Database setup prompt
echo ""
print_info "Database Setup:"
echo "1. Ensure PostgreSQL is running"
echo "2. Create a database named 'art_souk' if it doesn't exist:"
echo "   createdb art_souk"
echo "3. Update DATABASE_URL in .env.local"
echo ""
read -p "Press Enter when database is ready, or Ctrl+C to exit..."

# Run database migrations
print_info "Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
    print_success "Database migrations completed"
else
    print_error "Database migrations failed. Please check your database connection"
    print_info "You can run 'npm run db:push' manually later"
fi

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
print_success "Art Souk development environment is ready"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  http://localhost:5000"
echo ""
echo "Default test accounts (after seeding):"
echo "  Artist: artist@test.com / password123"
echo "  Gallery: gallery@test.com / password123"
echo "  Collector: collector@test.com / password123"
echo ""
echo "For more information, see SETUP_GUIDE.md"