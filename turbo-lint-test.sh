#!/bin/bash
# Test turbo lint with increased memory

echo "🚀 Running turbo lint with 8GB memory allocation..."
export NODE_OPTIONS="--max-old-space-size=8192"

# Run turbo lint with concurrency limit
npx turbo run lint --concurrency=1

echo "✅ Turbo lint completed"