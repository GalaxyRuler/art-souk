#!/bin/bash

# Art Souk Monorepo Linting Script
# This script runs lint in all workspace packages

echo "🎨 Art Souk Monorepo Linting"
echo "=============================="

# Track overall exit status
EXIT_STATUS=0

# Function to run lint in a directory
run_lint() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ] && grep -q '"lint"' "$dir/package.json"; then
        echo ""
        echo "📦 Linting $name..."
        echo "-------------------"
        cd "$dir"
        npm run lint
        if [ $? -ne 0 ]; then
            EXIT_STATUS=1
            echo "❌ Lint failed in $name"
        else
            echo "✅ Lint passed in $name"
        fi
        cd - > /dev/null
    else
        echo "⏭️  Skipping $name (no lint script)"
    fi
}

# Run lint in all workspace packages
run_lint "client" "@art-souk/client"
run_lint "server" "@art-souk/server"
run_lint "packages/ui" "@art-souk/ui"
run_lint "packages/db" "@art-souk/db"

echo ""
echo "=============================="
if [ $EXIT_STATUS -eq 0 ]; then
    echo "✅ All lint checks passed!"
else
    echo "❌ Some lint checks failed!"
fi

exit $EXIT_STATUS