#!/bin/bash

echo "Running lint in all workspaces..."

echo "Linting apps/web..."
cd apps/web && npm run lint
cd ../..

echo "Linting apps/api..."
cd apps/api && npm run lint
cd ../..

echo "Lint completed!"