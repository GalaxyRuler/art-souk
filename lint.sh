#!/bin/bash

echo "🔍 Running Art Souk Code Quality Checks..."

echo "📝 Checking TypeScript types..."
npm run check

echo "🎨 Checking code formatting..."
npx prettier --check client/src server shared --ignore-unknown

echo "✅ Code quality checks complete!"