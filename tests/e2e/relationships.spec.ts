import { test, expect } from '@playwright/test';

test.describe('Relationship Graph', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/relationships');
  });

  test('renders graph container', async ({ page }) => {
    const graphContainer = page.locator('[data-testid="graph-container"]');
    await expect(graphContainer).toBeVisible();
  });

  test('displays SVG visualization', async ({ page }) => {
    const svg = page.locator('[data-testid="graph-container"] svg');
    await expect(svg).toBeVisible();
  });

  test('shows graph nodes', async ({ page }) => {
    // Wait for D3 to render
    await page.waitForTimeout(1000);
    
    const nodes = page.locator('[data-testid="graph-container"] svg .node, [data-testid="graph-container"] svg circle');
    const count = await nodes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows graph links/edges', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const links = page.locator('[data-testid="graph-container"] svg .link, [data-testid="graph-container"] svg line, [data-testid="graph-container"] svg path');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('highlights node on hover', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    const node = page.locator('[data-testid="graph-container"] svg .node, [data-testid="graph-container"] svg circle').first();
    await node.hover();
    
    // Check for tooltip or highlight class
    const tooltip = page.locator('[data-testid="graph-tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
  });

  test('filters graph by category', async ({ page }) => {
    const categoryFilter = page.locator('[data-testid="graph-category-filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      
      // Graph should update
      const nodes = page.locator('[data-testid="graph-container"] svg .node, [data-testid="graph-container"] svg circle');
      const count = await nodes.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('shows legend', async ({ page }) => {
    const legend = page.locator('[data-testid="graph-legend"]');
    await expect(legend).toBeVisible();
  });

  test('displays statistics', async ({ page }) => {
    const stats = page.locator('[data-testid="graph-stats"]');
    await expect(stats).toBeVisible();
    await expect(stats).toContainText(/node|technique/i);
  });
});
