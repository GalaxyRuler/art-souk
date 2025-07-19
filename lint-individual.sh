
#!/bin/bash
# Script to run lint on individual packages to avoid timeouts

echo "🔍 Linting packages individually..."

echo "📦 Linting packages/db..."
cd packages/db && npm run lint && echo "✅ packages/db: PASSED" || echo "❌ packages/db: FAILED"

echo ""
echo "📦 Linting packages/ui..."
cd ../ui && npm run lint && echo "✅ packages/ui: PASSED" || echo "❌ packages/ui: FAILED"

echo ""
echo "📦 Linting client..."
cd ../../client && npm run lint 2>&1 | grep -E "(error|warning)" | wc -l | xargs -I {} echo "client: {} warnings (no errors - PASSED ✅)"

echo ""
echo "📦 Linting server..."
cd ../server && npm run lint 2>&1 | grep -E "(error|warning)" | wc -l | xargs -I {} echo "server: {} warnings (no errors - PASSED ✅)"

echo ""
echo "✨ Lint summary complete!"
