import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Prompts Research/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('navigates to taxonomy page', async ({ page }) => {
    // Use role-based selector for better reliability
    await page.getByRole('link', { name: 'Taxonomy' }).first().click();
    await expect(page).toHaveURL(/taxonomy/);
    await expect(page.locator('h1')).toContainText(/Techniques|Taxonomy/i);
  });

  test('navigates to relationships page', async ({ page }) => {
    await page.getByRole('link', { name: 'Relationships' }).first().click();
    await expect(page).toHaveURL(/relationships/);
    await expect(page.locator('[data-testid="graph-container"]')).toBeVisible();
  });

  test('navigates to prompt builder page', async ({ page }) => {
    await page.getByRole('link', { name: 'Prompt Builder' }).first().click();
    await expect(page).toHaveURL(/builder/);
    await expect(page.locator('[data-testid="prompt-builder"]')).toBeVisible();
  });

  test('header logo returns to home', async ({ page }) => {
    await page.getByRole('link', { name: 'Taxonomy' }).first().click();
    // Click the home link or logo
    await page.getByRole('link', { name: 'Home' }).first().click();
    await expect(page).toHaveURL(/mnehmos\.prompts\.research\/?$/);
  });

  test('footer links are functional', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
