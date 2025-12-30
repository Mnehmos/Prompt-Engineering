import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage passes accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('taxonomy page passes accessibility audit', async ({ page }) => {
    await page.goto('/taxonomy');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('prompt builder passes accessibility audit', async ({ page }) => {
    await page.goto('/builder');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
    
    // Can reach main content
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('skip link functionality', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[data-testid="skip-link"]');
    
    if (await skipLink.isVisible()) {
      await page.keyboard.press('Enter');
      const main = page.locator('main');
      await expect(main).toBeFocused();
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/builder');
    
    const inputs = page.locator('input:not([type="hidden"]), textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      // Must have one of: associated label, aria-label, or aria-labelledby
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      
      expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ runOnly: ['color-contrast'] })
      .analyze();
    
    expect(results.violations).toEqual([]);
  });
});
