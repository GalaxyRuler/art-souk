# Contributing to Art Souk

Thank you for your interest in contributing to Art Souk! This guide will help you get started with our development process and coding standards.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## 🤝 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read and follow our community guidelines to ensure a welcoming environment for all participants.

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL 15+
- Redis 7+
- Git

### Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/art-souk.git
   cd art-souk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your local database, Redis, and API keys
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
art-souk/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Application pages
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── lib/         # Utility functions
│   │   └── package.json
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── middleware/  # Express middleware
│       │   ├── routes/      # API routes
│       │   ├── queues/      # Background job queues
│       │   └── socket.ts    # Real-time WebSocket server
│       └── package.json
├── packages/
│   ├── db/                  # Database schema and migrations
│   ├── ui/                  # Shared UI component library
│   └── tsconfig/            # Shared TypeScript configurations
├── tests/                   # Testing files
├── docs/                    # Documentation
└── turbo.json               # Turborepo configuration
```

## 🔄 Development Workflow

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test improvements
- `chore/description` - Maintenance tasks

### Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Run tests locally**
   ```bash
   npm run test:unit
   npm run test:integration
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type usage
- Use strict TypeScript configuration

### React Components
- Use functional components with hooks
- Implement proper prop typing
- Use React.memo for performance optimization
- Follow component composition patterns

### API Development
- Use RESTful API conventions
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Document API endpoints with OpenAPI

### Database
- Use Drizzle ORM for database operations
- Define proper relationships and constraints
- Use migrations for schema changes
- Implement proper indexing strategies

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### File Organization
```typescript
// Component example
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Component logic here
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
};
```

## 🧪 Testing Guidelines

### Unit Tests
- Test individual components and functions
- Use Vitest for unit testing
- Aim for 80%+ code coverage
- Mock external dependencies

```typescript
// Example unit test
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders title correctly', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Integration Tests
- Test API endpoints with Supertest
- Test database operations
- Test middleware functionality

```typescript
// Example integration test
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('API Endpoints', () => {
  it('GET /api/artworks returns artworks', async () => {
    const response = await request(app).get('/api/artworks');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('artworks');
  });
});
```

### E2E Tests
- Test complete user workflows
- Use Playwright for browser automation
- Test critical business functionality

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can browse artworks', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="browse-artworks"]');
  await expect(page).toHaveURL(/.*artworks/);
});
```

## 💬 Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat: add real-time bidding system
fix: resolve auction countdown timer issue
docs: update API documentation
refactor: optimize database queries
test: add unit tests for auth middleware
chore: update dependencies
```

## 🔍 Pull Request Process

### PR Checklist
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description explains changes
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests pass
```

### Review Process
1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one approval required
3. **Testing**: All tests must pass
4. **Documentation**: Must be updated for new features

## 🚀 Release Process

### Version Bumping
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release PR
4. Tag release after merge
5. Deploy to production

## 📚 Additional Resources

### Documentation
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Testing Guidelines](TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)

### Tools
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

### Community
- [GitHub Discussions](https://github.com/your-org/art-souk/discussions)
- [Discord Server](https://discord.gg/art-souk)
- [Issue Tracker](https://github.com/your-org/art-souk/issues)

## ❓ Questions?

If you have questions about contributing, please:
1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to Art Souk! 🎨
