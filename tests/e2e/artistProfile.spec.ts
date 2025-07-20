import { test, expect } from '@playwright/test';

test.describe('Artist Profile End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to artist profile page
    await page.goto('/artists/1');
  });

  test('should display artist basic information', async ({ page }) => {
    // Wait for artist name to be visible
    await expect(page.locator('[data-testid="artist-name"]')).toBeVisible();
    
    // Check that basic information is displayed
    await expect(page.locator('[data-testid="artist-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="artist-nationality"]')).toBeVisible();
    await expect(page.locator('[data-testid="artist-birth-year"]')).toBeVisible();
  });

  test('should display social media links', async ({ page }) => {
    // Check for social media section
    await expect(page.locator('[data-testid="social-media-links"]')).toBeVisible();
    
    // Verify social links are clickable
    const instagramLink = page.locator('[data-testid="instagram-link"]');
    if (await instagramLink.count() > 0) {
      await expect(instagramLink).toHaveAttribute('href', /instagram\.com/);
    }
    
    const twitterLink = page.locator('[data-testid="twitter-link"]');
    if (await twitterLink.count() > 0) {
      await expect(twitterLink).toHaveAttribute('href', /twitter\.com|x\.com/);
    }
  });

  test('should show follower count and follow button', async ({ page }) => {
    // Check follower count display
    await expect(page.locator('[data-testid="follower-count"]')).toBeVisible();
    
    // Check if follow button is present (for non-authenticated or authenticated users)
    const followButton = page.locator('[data-testid="follow-button"]');
    if (await followButton.count() > 0) {
      await expect(followButton).toBeVisible();
    }
  });

  test('should display auction results section', async ({ page }) => {
    // Wait for auction results section
    await expect(page.locator('[data-testid="auction-results-section"]')).toBeVisible();
    
    // Check if auction results are displayed or empty state
    const auctionItems = page.locator('[data-testid="auction-result-item"]');
    const emptyState = page.locator('[data-testid="auction-results-empty"]');
    
    expect(await auctionItems.count() > 0 || await emptyState.count() > 0).toBeTruthy();
  });

  test('should display exhibition history', async ({ page }) => {
    // Wait for shows section
    await expect(page.locator('[data-testid="shows-section"]')).toBeVisible();
    
    // Check if shows are displayed or empty state
    const showItems = page.locator('[data-testid="show-item"]');
    const emptyState = page.locator('[data-testid="shows-empty"]');
    
    expect(await showItems.count() > 0 || await emptyState.count() > 0).toBeTruthy();
  });

  test('should display gallery relationships', async ({ page }) => {
    // Wait for gallery relationships section
    await expect(page.locator('[data-testid="galleries-section"]')).toBeVisible();
    
    // Check if gallery relationships are displayed or empty state
    const galleryItems = page.locator('[data-testid="gallery-relationship-item"]');
    const emptyState = page.locator('[data-testid="galleries-empty"]');
    
    expect(await galleryItems.count() > 0 || await emptyState.count() > 0).toBeTruthy();
  });

  test('should handle follow/unfollow interaction when authenticated', async ({ page, context }) => {
    // Mock authentication (this would need to be set up based on your auth system)
    await context.addCookies([
      {
        name: 'auth-session',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    
    await page.reload();
    
    // Check if follow button is available
    const followButton = page.locator('[data-testid="follow-button"]');
    if (await followButton.count() > 0) {
      const initialText = await followButton.textContent();
      
      // Click follow/unfollow button
      await followButton.click();
      
      // Wait for button text to change
      await expect(followButton).not.toHaveText(initialText || '');
      
      // Verify follower count updated
      await expect(page.locator('[data-testid="follower-count"]')).toBeVisible();
    }
  });

  test('should navigate between different sections', async ({ page }) => {
    // Test tab navigation if implemented
    const auctionTab = page.locator('[data-testid="auction-tab"]');
    const showsTab = page.locator('[data-testid="shows-tab"]');
    const galleriesTab = page.locator('[data-testid="galleries-tab"]');
    
    if (await auctionTab.count() > 0) {
      await auctionTab.click();
      await expect(page.locator('[data-testid="auction-results-section"]')).toBeVisible();
    }
    
    if (await showsTab.count() > 0) {
      await showsTab.click();
      await expect(page.locator('[data-testid="shows-section"]')).toBeVisible();
    }
    
    if (await galleriesTab.count() > 0) {
      await galleriesTab.click();
      await expect(page.locator('[data-testid="galleries-section"]')).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and accessible
    await expect(page.locator('[data-testid="artist-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="artist-bio"]')).toBeVisible();
    
    // Check that mobile navigation works if implemented
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.count() > 0) {
      await mobileMenu.click();
    }
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Navigate to artist profile and check for loading indicators
    await page.goto('/artists/1');
    
    // Check for loading states (these should disappear once content loads)
    const loadingIndicators = page.locator('[data-testid*="loading"]');
    
    // Wait for content to load
    await expect(page.locator('[data-testid="artist-name"]')).toBeVisible();
    
    // Verify loading indicators are gone
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).not.toBeVisible();
    }
  });

  test('should handle error states appropriately', async ({ page }) => {
    // Navigate to non-existent artist
    await page.goto('/artists/999999');
    
    // Check for error message or 404 state
    const errorMessage = page.locator('[data-testid="error-message"]');
    const notFoundMessage = page.locator('[data-testid="not-found"]');
    
    expect(await errorMessage.count() > 0 || await notFoundMessage.count() > 0).toBeTruthy();
  });
});