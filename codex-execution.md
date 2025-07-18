# 🎨 Art Souk - Codex Execution Guide

## Runtime Error Fixed ✅

The critical "Invalid time value" error in InvoiceManagement.tsx has been resolved. The application now handles date formatting gracefully without crashing.

## Complete Development Environment Setup

### 🚀 Quick Start Commands

```bash
# Essential commands for Codex
./codex-scripts.sh setup        # Complete project setup
./codex-scripts.sh dev          # Start development server
./codex-scripts.sh full-check   # Run all quality checks
./codex-scripts.sh test         # Run test suite
```

### 📋 All Available Commands

| Command | Purpose | Description |
|---------|---------|-------------|
| `setup` | Initial Setup | Install dependencies, create .env, setup database |
| `dev` | Development | Start development server with hot reload |
| `build` | Production | Build optimized production bundle |
| `lint` | Code Quality | Run ESLint to check code quality |
| `lint-fix` | Auto-fix | Fix auto-fixable ESLint issues |
| `check` | Type Check | Run TypeScript type checking |
| `test` | Testing | Run all tests |
| `test-watch` | Watch Mode | Run tests in watch mode |
| `test-coverage` | Coverage | Run tests with coverage report |
| `format` | Formatting | Format code with Prettier |
| `db-push` | Database | Push database schema changes |
| `db-studio` | Database UI | Open database browser |
| `clean` | Cleanup | Clear cache and build files |
| `health` | Health Check | Check application health |
| `full-check` | All Checks | Run lint, type check, tests, and build |
| `memory-fix` | Memory Fix | Fix memory issues (97-98% usage) |

### 🛠️ Development Tools Configured

#### Testing Framework
- **Vitest** - Modern testing framework
- **React Testing Library** - Component testing
- **Coverage reporting** - HTML and text reports
- **Watch mode** - Automatic test running
- **Mocking system** - UI components and dependencies

#### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Git hooks** - Pre-commit quality checks

#### Development Environment
- **Hot reloading** - Instant code changes
- **Memory optimization** - Handles high memory usage
- **Database tools** - Schema management and browsing
- **Health monitoring** - Application status checking

### 🔧 Configuration Files

#### Core Configuration
- `vitest.config.ts` - Test configuration with coverage
- `.eslintrc.js` - ESLint rules for code quality
- `.prettierrc.js` - Prettier formatting rules
- `tests/setup.ts` - Test setup with mocks

#### Project Files
- `codex-scripts.sh` - Main execution script
- `CODEX_READY.md` - Complete setup guide
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### 🎯 Key Features

#### ZATCA Compliance
- Complete Phase 1 & Phase 2 support
- Saudi tax-compliant invoicing
- QR codes and digital signatures
- Bilingual Arabic/English support

#### Marketplace Platform
- Artist and gallery management
- Artwork browsing and search
- Auction system with real-time bidding
- User authentication and profiles

#### Technical Architecture
- React TypeScript frontend
- Node.js Express backend
- PostgreSQL database
- Bilingual i18n support
- Responsive design

### 📊 Quality Metrics

#### Test Coverage
- Target: 80% minimum coverage
- HTML coverage reports
- Automated test running
- Component and integration tests

#### Code Quality
- ESLint with TypeScript rules
- Prettier formatting
- Type checking
- No console errors in production

#### Performance
- Memory usage optimization
- Build size optimization
- Hot module reloading
- Caching strategies

### 🚨 Common Issues & Solutions

#### Memory Issues (97-98% usage)
```bash
./codex-scripts.sh memory-fix
```

#### Database Connection
```bash
# Check PostgreSQL is running
sudo service postgresql start

# Update schema
./codex-scripts.sh db-push
```

#### Build Errors
```bash
# Check TypeScript
./codex-scripts.sh check

# Fix linting issues
./codex-scripts.sh lint-fix

# Clean and rebuild
./codex-scripts.sh clean
npm run build
```

#### Test Failures
```bash
# Run tests with verbose output
./codex-scripts.sh test-watch

# Check coverage
./codex-scripts.sh test-coverage
```

### 📈 Development Workflow

1. **Start Development**
   ```bash
   ./codex-scripts.sh dev
   ```

2. **Make Changes**
   - Edit code with hot reloading
   - Run tests automatically
   - Check code quality

3. **Quality Check**
   ```bash
   ./codex-scripts.sh full-check
   ```

4. **Deploy Preparation**
   ```bash
   ./codex-scripts.sh build
   ```

### 🎉 Ready for Production

The Art Souk platform is now fully configured with:
- ✅ Runtime error fixes
- ✅ Complete testing framework
- ✅ Code quality tools
- ✅ Development environment
- ✅ ZATCA compliance
- ✅ Bilingual support
- ✅ Performance optimization

### 📞 Support

For issues or questions:
1. Check the logs: `./codex-scripts.sh health`
2. Run full check: `./codex-scripts.sh full-check`
3. Clear cache: `./codex-scripts.sh clean`
4. Review error messages and fix accordingly

The development environment is now complete and ready for intensive development work!