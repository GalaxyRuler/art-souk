# 🎨 Art Souk - Codex Ready Setup

## Quick Start for Codex

### One-Line Setup
```bash
git clone https://github.com/GalaxyRuler/art-souk.git && cd art-souk && ./codex-scripts.sh setup
```

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Create environment
echo "DATABASE_URL=postgresql://localhost:5432/art_souk" > .env.local

# 3. Start development
npm run dev
```

## Essential Commands

### Core Development
```bash
./codex-scripts.sh dev          # Start development server
./codex-scripts.sh build        # Build for production
./codex-scripts.sh full-check   # Run all checks (recommended)
```

### Code Quality
```bash
./codex-scripts.sh lint         # Check code quality
./codex-scripts.sh lint-fix     # Fix auto-fixable issues
./codex-scripts.sh format       # Format code
./codex-scripts.sh check        # TypeScript checking
```

### Testing
```bash
./codex-scripts.sh test         # Run tests
./codex-scripts.sh test-watch   # Run tests in watch mode
./codex-scripts.sh test-coverage # Run with coverage
```

### Database
```bash
./codex-scripts.sh db-push      # Update database schema
./codex-scripts.sh db-studio    # Open database browser
```

### Troubleshooting
```bash
./codex-scripts.sh clean        # Clear cache
./codex-scripts.sh memory-fix   # Fix memory issues
./codex-scripts.sh health       # Check app health
```

## Project Structure

```
art-souk/
├── client/src/           # React frontend
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   └── lib/             # Utils, i18n, configs
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Database operations
├── shared/              # Shared types
│   └── schema.ts        # Database schema
└── tests/               # Test files
```

## Key Features

### 🌍 Bilingual Platform
- English & Arabic support
- RTL layout for Arabic
- Toggle in top-right corner

### 🎨 Art Marketplace
- Artist profiles & portfolios
- Gallery management
- Artwork browsing & search
- Auction system with real-time bidding

### 📊 ZATCA Compliance
- Saudi tax-compliant invoicing
- Phase 1 & 2 compliance
- QR codes, digital signatures
- Bilingual invoice descriptions

### 🚚 Shipping Management
- Order tracking
- Saudi National Address support
- Multiple carrier integration

## Available Scripts

All scripts are in `codex-scripts.sh`:

| Command | Description |
|---------|-------------|
| `setup` | Complete project setup |
| `dev` | Start development server |
| `build` | Production build |
| `lint` | ESLint checking |
| `lint-fix` | Fix ESLint issues |
| `check` | TypeScript checking |
| `test` | Run tests |
| `test-watch` | Tests in watch mode |
| `test-coverage` | Tests with coverage |
| `format` | Format with Prettier |
| `db-push` | Update database |
| `db-studio` | Database browser |
| `clean` | Clear cache |
| `full-check` | All checks |
| `memory-fix` | Fix memory issues |
| `health` | App health check |

## Development Workflow

### 1. Start Development
```bash
./codex-scripts.sh dev
```
App runs on http://localhost:5000

### 2. Before Committing
```bash
./codex-scripts.sh full-check
```
This runs: TypeScript check → ESLint → Tests → Build

### 3. Adding New Feature
```bash
# 1. Create component
touch client/src/components/NewFeature.tsx

# 2. Add tests
touch client/src/components/NewFeature.test.tsx

# 3. Update routes (if needed)
# Edit client/src/App.tsx

# 4. Run checks
./codex-scripts.sh full-check
```

## Configuration Files

### Testing
- `vitest.config.ts` - Test configuration
- `tests/setup.ts` - Test setup & mocks
- `client/src/components/*.test.tsx` - Test files

### Code Quality
- `.eslintrc.js` - ESLint rules
- `.prettierrc.js` - Prettier formatting
- `tsconfig.json` - TypeScript config

### Environment
- `.env.local` - Environment variables
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session security

## Common Issues & Solutions

### Memory Issues (97-98% usage)
```bash
./codex-scripts.sh memory-fix
```

### Database Connection
```bash
# Check PostgreSQL is running
sudo service postgresql start

# Create database
createdb art_souk

# Update schema
./codex-scripts.sh db-push
```

### TypeScript Errors
```bash
./codex-scripts.sh check
```

### Lint Errors
```bash
./codex-scripts.sh lint-fix
```

## Testing Strategy

### Unit Tests
- Component testing with Vitest
- Mocked dependencies
- UI interaction testing

### Integration Tests
- API endpoint testing
- Database integration
- Authentication flows

### Coverage
- Minimum 80% coverage target
- HTML coverage reports
- Exclude config files

## Performance Optimization

### Current Issues
- High memory usage (97-98%)
- Large dependency tree
- Database query optimization needed

### Solutions Applied
- Increased Node.js memory limit
- Cache clearing utilities
- Performance monitoring

## Ready for Production

### ✅ Completed Features
- Complete ZATCA invoice system
- Bilingual marketplace
- Authentication system
- Database schema
- Testing framework
- Code quality tools

### 🔄 Development Ready
- Hot module reloading
- Type checking
- Automated testing
- Database migrations
- Error handling

### 🚀 Deployment Ready
- Production builds
- Environment configuration
- Health checks
- Performance monitoring

## Get Started Now

```bash
# Clone and start
git clone https://github.com/GalaxyRuler/art-souk.git
cd art-souk
./codex-scripts.sh setup

# Development is ready!
./codex-scripts.sh dev
```

Visit http://localhost:5000 to see the Art Souk platform in action!
