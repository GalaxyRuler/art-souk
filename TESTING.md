# Testing Guide

Comprehensive testing guide for Art Souk platform covering unit, integration, end-to-end, and load testing strategies.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Testing Stack](#testing-stack)
- [Coverage Requirements](#coverage-requirements)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)

## 🎯 Testing Philosophy

### Testing Pyramid
```
    /\
   /  \
  /E2E \ <- Few, High-value user journeys
 /------\
/  UNIT  \ <- Many, Fast, Isolated tests
----------
```

### Principles
- **Fast Feedback**: Tests should run quickly in development
- **Reliable**: Tests should be deterministic and stable
- **Maintainable**: Tests should be easy to understand and update
- **Valuable**: Tests should catch real bugs and regressions
- **Automated**: All tests should run automatically in CI/CD

## 🧪 Test Types

### Unit Tests (70%)
- Test individual components and functions
- Fast execution (< 1 second per test)
- Isolated from external dependencies
- High coverage of business logic

### Integration Tests (20%)
- Test API endpoints and database operations
- Test component interactions
- Real database connections
- External service mocking

### End-to-End Tests (10%)
- Test complete user workflows
- Browser automation
- Critical business functionality
- User acceptance scenarios

### Load Tests (As needed)
- Performance under load
- Scalability testing
- Stress testing
- Real-time feature testing

## 🛠️ Testing Stack

### Frontend Testing
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Assertions**: Vitest assertions + jest-dom matchers
- **Mocking**: Vitest mocks
- **Coverage**: c8

### Backend Testing
- **Test Runner**: Vitest
- **HTTP Testing**: Supertest
- **Database Testing**: In-memory SQLite or test database
- **Mocking**: Vitest mocks
- **Coverage**: c8

### E2E Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Chrome Mobile, Safari Mobile
- **Visual Testing**: Playwright screenshots

### Load Testing
- **Framework**: k6
- **Metrics**: Response time, throughput, error rate
- **Scenarios**: Ramp-up, sustained load, spike testing
- **Real-time**: WebSocket connection testing

## 📊 Coverage Requirements

### Overall Coverage Targets
- **Unit Tests**: ≥ 80% line coverage
- **Integration Tests**: ≥ 60% endpoint coverage
- **E2E Tests**: 100% critical user journeys
- **Load Tests**: All real-time features

### Critical Path Coverage
- **Authentication Flow**: 100%
- **Payment Processing**: 100%
- **Auction Bidding**: 100%
- **Data Security**: 100%

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Coverage thresholds in vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

## 🚀 Running Tests

### Local Development
```bash
# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run load tests
npm run test:load

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### CI/CD Environment
```bash
# Run tests in CI mode
npm run test:ci

# Run tests with coverage in CI
npm run test:coverage:ci

# Run E2E tests in CI
npm run test:e2e:ci
```

## ✍️ Writing Tests

### Unit Test Example
```typescript
// Component test
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BidButton } from './BidButton';

describe('BidButton', () => {
  it('renders with correct bid amount', () => {
    render(<BidButton amount={1000} currency="SAR" />);
    expect(screen.getByText('Bid 1,000 SAR')).toBeInTheDocument();
  });

  it('calls onBid when clicked', () => {
    const mockOnBid = vi.fn();
    render(<BidButton amount={1000} onBid={mockOnBid} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnBid).toHaveBeenCalledWith(1000);
  });

  it('disables button when auction is closed', () => {
    render(<BidButton amount={1000} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Test Example
```typescript
// API integration test
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { auctions } from '../src/schema';

describe('Auction API', () => {
  beforeEach(async () => {
    await db.delete(auctions);
  });

  it('creates new auction', async () => {
    const auctionData = {
      title: 'Test Auction',
      startingBid: 1000,
      endTime: new Date(Date.now() + 86400000).toISOString()
    };

    const response = await request(app)
      .post('/api/auctions')
      .send(auctionData)
      .expect(201);

    expect(response.body.title).toBe(auctionData.title);
    expect(response.body.startingBid).toBe(auctionData.startingBid);
  });

  it('returns 400 for invalid auction data', async () => {
    const invalidData = {
      title: '', // Invalid empty title
      startingBid: -100 // Invalid negative bid
    };

    const response = await request(app)
      .post('/api/auctions')
      .send(invalidData)
      .expect(400);

    expect(response.body.error).toBe('Validation failed');
  });
});
```

### E2E Test Example
```typescript
// End-to-end test
import { test, expect } from '@playwright/test';

test.describe('Auction Bidding Flow', () => {
  test('user can place bid on auction', async ({ page }) => {
    // Navigate to auction page
    await page.goto('/auctions/1');

    // Wait for auction to load
    await expect(page.locator('[data-testid="auction-title"]')).toBeVisible();

    // Enter bid amount
    await page.fill('[data-testid="bid-input"]', '2000');

    // Place bid
    await page.click('[data-testid="place-bid-button"]');

    // Verify bid was placed
    await expect(page.locator('[data-testid="bid-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-bid"]')).toContainText('2,000');
  });

  test('real-time bid updates work', async ({ page, context }) => {
    // Open auction in two tabs
    const page1 = page;
    const page2 = await context.newPage();

    await page1.goto('/auctions/1');
    await page2.goto('/auctions/1');

    // Place bid in first tab
    await page1.fill('[data-testid="bid-input"]', '2500');
    await page1.click('[data-testid="place-bid-button"]');

    // Verify update appears in second tab
    await expect(page2.locator('[data-testid="current-bid"]')).toContainText('2,500');
  });
});
```

### Load Test Example
```javascript
// k6 load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],
    http_req_failed: ['rate<0.1']
  }
};

export default function () {
  // Test artwork browsing
  const response = http.get('http://localhost:5000/api/artworks');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100
  });

  sleep(1);
}
```

## 🔧 Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
```

## 🚦 CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Test Environments
- **Development**: Local testing with hot reload
- **Staging**: Full test suite on staging environment
- **Production**: Smoke tests after deployment

## 📈 Performance Testing

### Load Testing Scenarios
```javascript
// Auction load test
export let options = {
  scenarios: {
    auction_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 }
      ]
    },
    real_time_bidding: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m'
    }
  }
};
```

### Performance Metrics
- **Response Time**: p95 < 100ms
- **Throughput**: 1000 requests/second
- **Error Rate**: < 0.1%
- **WebSocket Connections**: 500 concurrent

## 🔒 Security Testing

### Automated Security Tests
```typescript
// Security test example
describe('Security Tests', () => {
  it('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/search')
      .send({ query: maliciousInput });
    
    expect(response.status).not.toBe(500);
    // Verify database integrity
  });

  it('validates CSRF tokens', async () => {
    const response = await request(app)
      .post('/api/auctions')
      .send({ title: 'Test' });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid CSRF token');
  });
});
```

### Manual Security Testing
- **Penetration Testing**: Quarterly security assessments
- **Vulnerability Scanning**: Automated dependency scanning
- **Code Review**: Security-focused code reviews
- **Compliance Testing**: OWASP Top 10 verification

## 🎯 Test Data Management

### Test Data Setup
```typescript
// Test data factory
export const createTestAuction = (overrides = {}) => ({
  title: 'Test Auction',
  description: 'Test auction description',
  startingBid: 1000,
  endTime: new Date(Date.now() + 86400000),
  ...overrides
});

export const createTestUser = (overrides = {}) => ({
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});
```

### Database Seeding
```typescript
// Test database seeding
beforeEach(async () => {
  await db.delete(auctions);
  await db.delete(users);
  
  const user = await db.insert(users).values(createTestUser());
  const auction = await db.insert(auctions).values(createTestAuction());
});
```

## 📊 Test Reporting

### Coverage Reports
- **HTML Report**: Visual coverage overview
- **JSON Report**: Programmatic coverage data
- **Text Report**: Terminal coverage summary
- **XML Report**: CI/CD integration

### Test Reports
- **Unit Test Report**: Jest/Vitest HTML report
- **E2E Test Report**: Playwright HTML report
- **Load Test Report**: k6 HTML report
- **Coverage Report**: c8 HTML report

## 🔄 Continuous Improvement

### Test Metrics
- **Test Execution Time**: Monitor test performance
- **Test Stability**: Track flaky tests
- **Coverage Trends**: Monitor coverage changes
- **Bug Detection**: Measure test effectiveness

### Regular Reviews
- **Monthly**: Test performance review
- **Quarterly**: Test strategy review
- **Annually**: Testing framework evaluation

---

## 📞 Support

For testing questions or issues:
- **Documentation**: Review test examples
- **GitHub Issues**: Report testing problems
- **Team Chat**: Ask in #testing channel
- **Pair Programming**: Schedule testing sessions

Remember: **Good tests are an investment in code quality and developer confidence!**
