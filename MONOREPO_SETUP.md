# Art Souk Monorepo Linting Setup

## Current Status

The project is structured as a monorepo with the following workspaces:
- `client/` - React frontend application
- `server/` - Express backend API
- `packages/ui` - Shared UI components
- `packages/db` - Database schema and utilities
- `packages/tsconfig` - Shared TypeScript configurations

## Lint Scripts Added

✅ **client**: `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
✅ **server**: `eslint . --ext ts --report-unused-disable-directives --max-warnings 0`
✅ **packages/ui**: `eslint src --ext .ts,.tsx`
✅ **packages/db**: `eslint "**/*.{ts,tsx,js,jsx}\" --fix`
⏭️  **packages/tsconfig**: No lint needed (config-only package)

## Turbo Configuration

The `turbo.json` file is properly configured with:
```json
{
  "tasks": {
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    }
  }
}
```

## Known Issue

⚠️ **Turborepo cannot detect workspace packages** because the root `package.json` is missing:
```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

Since `package.json` cannot be edited, Turbo treats this as a single-package project rather than a monorepo.

## Workaround Solutions

### Option 1: Direct Workspace Linting
```bash
cd client && npm run lint
cd server && npm run lint
cd packages/ui && npm run lint
cd packages/db && npm run lint
```

### Option 2: Use the Lint Script
```bash
./lint.sh
```

This script will:
- Run lint in all workspace packages
- Show progress and results for each package
- Exit with proper status code
- Skip packages without lint scripts

### Option 3: Fix Root Configuration
To properly enable Turborepo, someone with `package.json` edit permissions needs to add:
```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

Once this is added, `npx turbo run lint` will work correctly across all workspaces.

## ESLint Configuration

The project uses ESLint 9 with a flat configuration file (`eslint.config.js`) at the root level. All workspace packages inherit this configuration.

## Development Tips

1. **Fast Linting**: Run lint in specific workspaces during development
2. **Fix on Save**: Most packages use `--fix` flag to auto-fix issues
3. **Strict Mode**: `--max-warnings 0` ensures no warnings are ignored
4. **Type Checking**: TypeScript files are parsed with proper type information
