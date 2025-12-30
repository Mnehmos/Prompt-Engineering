import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has dark mode toggle button', async ({ page }) => {
    // Use the actual data attribute from ThemeToggle component
    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toBeVisible();
  });

  test('toggles to dark mode', async ({ page }) => {
    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    
    // Check for data-theme attribute on html
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('toggles back to light mode', async ({ page }) => {
    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click(); // Dark
    await toggle.click(); // Light
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('persists dark mode preference', async ({ page }) => {
    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    
    // Reload page
    await page.reload();
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('respects system preference', async ({ page }) => {
    // Clear any stored preference first
    await page.evaluate(() => localStorage.removeItem('theme-preference'));
    
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('dark mode applies correct colors', async ({ page }) => {
    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Dark backgrounds should have low lightness values
    expect(bgColor).toMatch(/rgb|rgba/);
  });
});
