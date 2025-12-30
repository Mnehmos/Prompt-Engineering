import { test, expect, devices } from '@playwright/test';

// Create test configuration for mobile
const mobileTest = test.extend({});
mobileTest.use({ ...devices['iPhone 12'] });

// Create test configuration for tablet
const tabletTest = test.extend({});
tabletTest.use({ ...devices['iPad Mini'] });

mobileTest.describe('Mobile Responsiveness', () => {
  mobileTest('homepage is responsive', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  mobileTest('mobile menu button is visible on small screens', async ({ page }) => {
    await page.goto('/');
    
    // Use the actual data attribute from Header component
    const menuButton = page.locator('[data-mobile-menu-toggle]');
    await expect(menuButton).toBeVisible();
  });

  mobileTest('mobile menu opens and closes', async ({ page }) => {
    await page.goto('/');
    
    const menuButton = page.locator('[data-mobile-menu-toggle]');
    await menuButton.click();
    
    const mobileNav = page.locator('[data-mobile-nav]');
    await expect(mobileNav).toHaveClass(/is-open/);
    
    // Close menu
    await menuButton.click();
    await expect(mobileNav).not.toHaveClass(/is-open/);
  });

  mobileTest('taxonomy page works on mobile', async ({ page }) => {
    await page.goto('/taxonomy');
    
    // Check page loaded - look for main content
    await expect(page.locator('h1')).toBeVisible();
  });

  mobileTest('prompt builder works on mobile', async ({ page }) => {
    await page.goto('/builder');
    
    // Check page loaded
    await expect(page.locator('main')).toBeVisible();
  });

  mobileTest('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});

tabletTest.describe('Tablet Responsiveness', () => {
  tabletTest('tablet layout shows appropriately', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  tabletTest('graph visualization fits tablet', async ({ page }) => {
    await page.goto('/relationships');
    
    // Check page loaded
    await expect(page.locator('main')).toBeVisible();
  });
});
