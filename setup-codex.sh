
#!/bin/bash

echo "🎨 Setting up Art Souk for Codex Container"
echo "=========================================="

# Set permissions
chmod +x lint.sh
chmod +x setup-codex.sh

# Create necessary directories
mkdir -p dist
mkdir -p tmp
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Environment file created"
fi

# Install dependencies without workspace protocol issues
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create symlinks for workspace packages to avoid workspace:* issues
echo "🔗 Creating package symlinks..."
mkdir -p node_modules/@art-souk

# Link packages directory contents
if [ -d "packages/ui" ]; then
    ln -sf ../../packages/ui node_modules/@art-souk/ui
    echo "✅ Linked @art-souk/ui"
fi

if [ -d "packages/db" ]; then
    ln -sf ../../packages/db node_modules/@art-souk/db
    echo "✅ Linked @art-souk/db"
fi

if [ -d "packages/tsconfig" ]; then
    ln -sf ../../packages/tsconfig node_modules/@art-souk/tsconfig
    echo "✅ Linked @art-souk/tsconfig"
fi

# Create database if needed
echo "🗄️ Setting up database..."
if command -v createdb &> /dev/null; then
    createdb artsouk 2>/dev/null || echo "Database already exists or cannot be created"
fi

# Run initial setup
echo "🚀 Running initial setup..."
npm run db:push 2>/dev/null || echo "Database push skipped"

echo "✅ Codex setup complete!"
echo "Run 'npm run codex:start' to start the application"
