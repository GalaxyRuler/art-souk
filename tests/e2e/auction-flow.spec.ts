import { test, expect } from '@playwright/test';

test.describe('Auction Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
  });

  test('complete auction bidding flow', async ({ page }) => {
    // Test signup → role select → artwork upload → live bid flow
    
    // 1. Navigate to login/signup
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*login/);

    // 2. Sign up with test credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signup-button"]');

    // 3. Role selection should appear for new users
    await expect(page.locator('[data-testid="role-selection"]')).toBeVisible();
    
    // Select artist and collector roles
    await page.click('[data-testid="role-collector"]');
    await page.click('[data-testid="role-artist"]');
    await page.click('[data-testid="complete-role-setup"]');

    // 4. Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. Upload artwork as artist
    await page.click('[data-testid="upload-artwork"]');
    await page.fill('[data-testid="artwork-title"]', 'Test Artwork');
    await page.fill('[data-testid="artwork-description"]', 'A beautiful test piece');
    await page.fill('[data-testid="artwork-price"]', '5000');
    
    // Upload image
    await page.setInputFiles('[data-testid="artwork-image"]', 'tests/fixtures/test-artwork.jpg');
    await page.click('[data-testid="submit-artwork"]');

    // 6. Navigate to auctions
    await page.click('[data-testid="nav-auctions"]');
    await expect(page).toHaveURL(/.*auctions/);

    // 7. Click on a live auction
    await page.click('[data-testid="auction-item"]:first-child');
    
    // 8. Wait for real-time connection
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');

    // 9. Place a bid
    const currentBid = await page.locator('[data-testid="current-bid"]').textContent();
    const bidAmount = parseInt(currentBid?.replace(/[^\d]/g, '') || '0') + 500;
    
    await page.fill('[data-testid="bid-input"]', bidAmount.toString());
    await page.click('[data-testid="place-bid"]');

    // 10. Verify bid was placed
    await expect(page.locator('[data-testid="bid-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-bid"]')).toContainText(bidAmount.toString());
  });

  test('real-time bid updates', async ({ page, context }) => {
    // Open auction in two browser tabs to test real-time updates
    const page2 = await context.newPage();
    
    // Both users navigate to the same auction
    await page.goto('/auctions/1');
    await page2.goto('/auctions/1');

    // Wait for connection
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    await expect(page2.locator('[data-testid="connection-status"]')).toContainText('Connected');

    // User 1 places a bid
    await page.fill('[data-testid="bid-input"]', '6000');
    await page.click('[data-testid="place-bid"]');

    // User 2 should see the update in real-time
    await expect(page2.locator('[data-testid="current-bid"]')).toContainText('6000');
    await expect(page2.locator('[data-testid="bid-notification"]')).toBeVisible();
  });

  test('auction countdown timer', async ({ page }) => {
    await page.goto('/auctions/1');
    
    // Check that countdown timer is visible and updating
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible();
    
    const initialTime = await timer.textContent();
    
    // Wait 2 seconds and check that time has decreased
    await page.waitForTimeout(2000);
    const updatedTime = await timer.textContent();
    
    expect(initialTime).not.toBe(updatedTime);
  });

  test('mobile responsive auction interface', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auctions/1');

    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-bid-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-auction-info"]')).toBeVisible();
    
    // Test mobile bidding
    await page.click('[data-testid="mobile-bid-button"]');
    await expect(page.locator('[data-testid="mobile-bid-modal"]')).toBeVisible();
  });
});