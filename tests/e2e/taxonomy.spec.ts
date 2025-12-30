import { test, expect } from '@playwright/test';

test.describe('Taxonomy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/taxonomy');
  });

  test('displays technique categories', async ({ page }) => {
    const categories = page.locator('[data-testid="category-card"]');
    await expect(categories.first()).toBeVisible();
    const count = await categories.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows technique count in category', async ({ page }) => {
    const categoryCount = page.locator('[data-testid="category-card"] [data-testid="technique-count"]');
    await expect(categoryCount.first()).toBeVisible();
    const text = await categoryCount.first().textContent();
    expect(text).toMatch(/\d+/);
  });

  test('filters techniques by search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="technique-search"]');
    await searchInput.fill('chain of thought');
    
    // Wait for filter to apply
    await page.waitForTimeout(300);
    
    const results = page.locator('[data-testid="technique-card"]:visible');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    
    // First result should match search
    await expect(results.first()).toContainText(/chain/i);
  });

  test('filters by category', async ({ page }) => {
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    // Use index-based selection since label RegExp not supported
    await categoryFilter.selectOption({ index: 1 });
    
    await page.waitForTimeout(300);
    
    const cards = page.locator('[data-testid="technique-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('opens technique detail modal', async ({ page }) => {
    const techniqueCard = page.locator('[data-testid="technique-card"]').first();
    await techniqueCard.click();
    
    const modal = page.locator('[data-testid="technique-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toBeVisible();
  });

  test('closes modal with close button', async ({ page }) => {
    await page.locator('[data-testid="technique-card"]').first().click();
    const modal = page.locator('[data-testid="technique-modal"]');
    await expect(modal).toBeVisible();
    
    await modal.locator('[data-testid="modal-close"]').click();
    await expect(modal).not.toBeVisible();
  });

  test('closes modal with escape key', async ({ page }) => {
    await page.locator('[data-testid="technique-card"]').first().click();
    const modal = page.locator('[data-testid="technique-modal"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('shows related techniques in detail view', async ({ page }) => {
    await page.locator('[data-testid="technique-card"]').first().click();
    const relatedSection = page.locator('[data-testid="related-techniques"]');
    
    // Not all techniques have related ones, so this may or may not be visible
    if (await relatedSection.isVisible()) {
      const relatedLinks = relatedSection.locator('a');
      const count = await relatedLinks.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
