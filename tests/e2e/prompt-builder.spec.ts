import { test, expect } from '@playwright/test';

test.describe('Prompt Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder');
  });

  test('displays prompt builder interface', async ({ page }) => {
    const builder = page.locator('[data-testid="prompt-builder"]');
    await expect(builder).toBeVisible();
  });

  test('shows technique selection panel', async ({ page }) => {
    const techniquePanel = page.locator('[data-testid="technique-panel"]');
    await expect(techniquePanel).toBeVisible();
  });

  test('shows prompt editor panel', async ({ page }) => {
    const editorPanel = page.locator('[data-testid="prompt-editor"]');
    await expect(editorPanel).toBeVisible();
  });

  test('shows preview panel', async ({ page }) => {
    const previewPanel = page.locator('[data-testid="prompt-preview"]');
    await expect(previewPanel).toBeVisible();
  });

  test('can fill in role field', async ({ page }) => {
    const roleInput = page.locator('[data-testid="role-input"]');
    await roleInput.fill('You are an expert analyst.');
    await expect(roleInput).toHaveValue('You are an expert analyst.');
  });

  test('can fill in task field', async ({ page }) => {
    const taskInput = page.locator('[data-testid="task-input"]');
    await taskInput.fill('Analyze the following data.');
    await expect(taskInput).toHaveValue('Analyze the following data.');
  });

  test('preview updates with input', async ({ page }) => {
    const taskInput = page.locator('[data-testid="task-input"]');
    await taskInput.fill('Test task content');
    
    const preview = page.locator('[data-testid="prompt-preview"]');
    await expect(preview).toContainText('Test task content');
  });

  test('can select a technique', async ({ page }) => {
    const techniqueCard = page.locator('[data-testid="technique-select-card"]').first();
    await techniqueCard.click();
    
    await expect(techniqueCard).toHaveClass(/selected|active/);
    
    // Check it appears in selected list
    const selectedList = page.locator('[data-testid="selected-techniques"]');
    const selectedCount = await selectedList.locator('[data-testid="selected-technique-tag"]').count();
    expect(selectedCount).toBeGreaterThan(0);
  });

  test('can deselect a technique', async ({ page }) => {
    const techniqueCard = page.locator('[data-testid="technique-select-card"]').first();
    await techniqueCard.click(); // Select
    await techniqueCard.click(); // Deselect
    
    await expect(techniqueCard).not.toHaveClass(/selected|active/);
  });

  test('shows quality score', async ({ page }) => {
    const qualityScore = page.locator('[data-testid="quality-score"]');
    await expect(qualityScore).toBeVisible();
  });

  test('quality score updates with content', async ({ page }) => {
    const initialScore = await page.locator('[data-testid="quality-score"]').textContent();
    
    await page.locator('[data-testid="role-input"]').fill('Expert software engineer with 10 years experience.');
    await page.locator('[data-testid="task-input"]').fill('Review this code for bugs and suggest improvements.');
    
    await page.waitForTimeout(300);
    
    const newScore = await page.locator('[data-testid="quality-score"]').textContent();
    expect(newScore).not.toBe(initialScore);
  });

  test('copy button copies prompt to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await page.locator('[data-testid="task-input"]').fill('Test task');
    await page.locator('[data-testid="copy-button"]').click();
    
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Test task');
  });

  test('loads template', async ({ page }) => {
    const templateButton = page.locator('[data-testid="template-card"]').first();
    await templateButton.click();
    
    // Fields should be populated
    const roleInput = page.locator('[data-testid="role-input"]');
    const roleValue = await roleInput.inputValue();
    expect(roleValue.length).toBeGreaterThan(0);
  });

  test('clear button resets all fields', async ({ page }) => {
    await page.locator('[data-testid="task-input"]').fill('Test');
    await page.locator('[data-testid="clear-button"]').click();
    
    // Accept confirmation if present
    page.on('dialog', dialog => dialog.accept());
    
    const taskInput = page.locator('[data-testid="task-input"]');
    await expect(taskInput).toHaveValue('');
  });
});
