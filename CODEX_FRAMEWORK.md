
# Art Souk Codex Framework

This framework enables Art Souk to run seamlessly in Codex containers without dependency resolution issues.

## Quick Start for Codex

```bash
# Setup the environment
./setup-codex.sh

# Start the application  
npm run codex:start
```

The app will be available at http://localhost:5000

## Framework Components

### 1. Dependency Resolution
- **Issue**: `workspace:*` protocol not supported in Codex
- **Solution**: Symlinked packages in `setup-codex.sh`
- **Result**: Clean npm install without workspace protocol errors

### 2. Configuration Files
- **codex-framework.json**: Main configuration for Codex runtime
- **codex.config.js**: Runtime configuration and health checks  
- **setup-codex.sh**: Automated setup script

### 3. File Structure Fixes
- Added trailing newlines to all config files
- Updated workspace references in `pnpm-workspace.yaml`
- Fixed lint script to match current project structure

### 4. Container Compatibility

#### Port Configuration
- Uses `0.0.0.0:5000` for container accessibility
- Health check endpoint at `/health`
- Static file serving configured

#### Environment Variables
```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000
NODE_OPTIONS=--max-old-space-size=8192
```

#### Database Setup
- PostgreSQL 16 support
- Automatic database creation if available
- Drizzle ORM schema push on setup

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run codex:start` | Start development server for Codex |
| `npm run codex:build` | Build for production |
| `npm run codex:test` | Run test suite |
| `npm run codex:lint` | Run linting |
| `npm run codex:setup` | Setup environment |

## Troubleshooting

### Workspace Dependencies
If you see `workspace:*` errors:
```bash
./setup-codex.sh
```

### Port Binding Issues
The framework uses `0.0.0.0:5000` to ensure container accessibility.

### Memory Issues  
The framework sets `NODE_OPTIONS=--max-old-space-size=8192` for memory optimization.

## Development Workflow

1. **Initial Setup**: Run `./setup-codex.sh` once
2. **Development**: Use `npm run codex:start`  
3. **Testing**: Use `npm run codex:test`
4. **Production**: Use `npm run codex:build`

## Container Features

- ✅ No workspace protocol dependencies
- ✅ Proper file endings with newlines  
- ✅ Container-accessible port binding
- ✅ Health check endpoints
- ✅ Static file serving
- ✅ Database integration ready
- ✅ Memory optimization configured
- ✅ Hot reload for development
