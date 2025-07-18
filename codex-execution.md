# Codex Code Execution Setup - Art Souk

## Quick Setup Commands

```bash
# Install all dependencies
npm install

# Run linting
npm run lint

# Run type checking
npm run check

# Run tests
npm test

# Start development server
npm run dev
```

## Development Environment Setup

### 1. Dependencies Installation
```bash
# Install all project dependencies
npm install

# Install specific development tools if needed
npm install --save-dev @types/node typescript eslint prettier

# Install global tools (optional)
npm install -g turbo
```

### 2. Code Quality Tools

#### ESLint Configuration
```bash
# Run ESLint on all files
npm run lint

# Fix auto-fixable ESLint issues
npm run lint:fix

# Lint specific directories
npx eslint client/src --ext .ts,.tsx
npx eslint server --ext .ts
```

#### TypeScript Type Checking
```bash
# Run TypeScript compiler check
npm run check

# Type check with watch mode
npm run check:watch

# Type check specific files
npx tsc --noEmit client/src/pages/InvoiceManagement.tsx
```

#### Prettier Formatting
```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Format specific files
npx prettier --write "client/src/**/*.{ts,tsx}"
```

### 3. Testing Setup

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- client/src/components/InvoiceDetail.test.tsx
```

#### Integration Tests
```bash
# Run API integration tests
npm run test:integration

# Run database tests
npm run test:db
```

#### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

## Project Structure for Code Execution

```
art-souk/
├── client/                   # Frontend React app
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom hooks
│   └── tests/              # Frontend tests
├── server/                  # Backend Express app
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── tests/              # Backend tests
├── shared/                  # Shared types/schemas
│   └── schema.ts           # Database schema
└── tests/                   # Integration tests
```

## Code Execution Environment

### Environment Variables
```bash
# Create environment file
cat > .env.local << EOF
DATABASE_URL=postgresql://localhost:5432/art_souk
SESSION_SECRET=your-secret-key
NODE_ENV=development
VITE_API_URL=http://localhost:5000
EOF
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## Common Development Tasks

### Adding New Features
```bash
# 1. Create component
touch client/src/components/NewFeature.tsx

# 2. Add tests
touch client/src/components/NewFeature.test.tsx

# 3. Update schema if needed
# Edit shared/schema.ts

# 4. Add API endpoint
# Edit server/routes.ts

# 5. Run checks
npm run check && npm run lint && npm test
```

### Debugging
```bash
# Start with debugging
npm run dev:debug

# Check application health
curl http://localhost:5000/api/health

# View logs
npm run logs

# Database queries
npm run db:studio
```

## CI/CD Integration

### GitHub Actions Setup
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run check
      - run: npm test
      - run: npm run build
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
npm install --save-dev husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run check"
```

## Performance Monitoring

### Development Metrics
```bash
# Bundle size analysis
npm run analyze

# Performance profiling
npm run profile

# Memory usage check
npm run memory-check
```

## Troubleshooting Common Issues

### Memory Issues (Current: 97-98% usage)
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear npm cache
npm cache clean --force

# Restart development server
npm run dev
```

### Database Connection Issues
```bash
# Check database status
npm run db:status

# Reset database connection
npm run db:reset-connection

# Verify database schema
npm run db:verify
```

### TypeScript Errors
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Regenerate type definitions
npm run types:generate

# Check specific file
npx tsc --noEmit --skipLibCheck filename.ts
```

## Code Quality Standards

### ESLint Rules
- No unused variables
- Consistent spacing and formatting
- React hooks rules
- TypeScript strict mode
- Import order consistency

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals/parameters
- Consistent type imports

### Testing Standards
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage
- Mock external dependencies

## Quick Reference Commands

```bash
# Full check before committing
npm run check && npm run lint && npm test && npm run build

# Clean install
rm -rf node_modules && npm ci

# Reset everything
npm run clean && npm install && npm run db:reset && npm run dev

# Production build
npm run build

# Start production server
npm start
```

This setup provides Codex with everything needed to execute code, run tests, and maintain code quality in the Art Souk project.