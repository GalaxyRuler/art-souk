
#!/bin/bash

echo "Running lint in all workspaces..."

echo "Linting client..."
cd client && npm run lint
cd ..

echo "Linting server..."
cd server && npm run lint
cd ..

echo "Linting packages/ui..."
cd packages/ui && npm run lint
cd ../..

echo "Linting packages/db..."
cd packages/db && npm run lint
cd ../..

echo "Lint completed!"
