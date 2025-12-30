# Task Map: Astro Migration with TDD

## Overview

This task map defines the work breakdown for migrating mnehmos.prompts.research to Astro using Test-Driven Development (RED → GREEN → BLUE cycles).

## Prerequisites

- [x] ADR-002 approved
- [ ] Current CSS/JS changes committed
- [ ] Astro project initialized

---

## Phase 1: Project Scaffolding

### Task 1.1: Initialize Astro Project
**Mode:** Code  
**Priority:** High  
**Dependencies:** None

```bash
npm create astro@latest -- --template minimal
npm install @astrojs/react @astrojs/tailwind
npm install -D vitest @vitest/ui playwright @playwright/test
npm install -D typescript @types/react @types/react-dom
npm install react react-dom d3 @types/d3
npm install clsx tailwind-merge lucide-react
```

**Acceptance Criteria:**
- [ ] `npm run dev` starts development server
- [ ] `npm run build` generates static site
- [ ] TypeScript configured with strict mode
- [ ] Tailwind configured with design tokens

### Task 1.2: Configure Testing Infrastructure
**Mode:** Code  
**Priority:** High  
**Dependencies:** 1.1

**Files:**
- `vitest.config.ts`
- `playwright.config.ts`
- `tests/setup.ts`

**Acceptance Criteria:**
- [ ] `npm test` runs Vitest unit tests
- [ ] `npm run test:e2e` runs Playwright tests
- [ ] Coverage reporting enabled

---

## Phase 2: RED Phase - Write Failing Tests

### Task 2.1: Technique Utility Tests
**Mode:** red-phase  
**Priority:** High  
**Dependencies:** 1.2

**File:** `tests/unit/lib/techniques.test.ts`

```typescript
// Failing tests to write:
describe('getTechniquesByCategory', () => {
  test('returns empty array for invalid category', () => {...});
  test('returns all techniques for "all" category', () => {...});
  test('filters techniques by specific category', () => {...});
});

describe('searchTechniques', () => {
  test('matches technique names case-insensitively', () => {...});
  test('matches description content', () => {...});
  test('matches aliases', () => {...});
  test('returns empty for no matches', () => {...});
});

describe('getRelatedTechniques', () => {
  test('returns technique objects for valid IDs', () => {...});
  test('filters out invalid related technique IDs', () => {...});
  test('handles techniques with no relations', () => {...});
});
```

**Acceptance Criteria:**
- [ ] All tests fail with meaningful error messages
- [ ] Test coverage target: 80%

### Task 2.2: Relationship Graph Tests
**Mode:** red-phase  
**Priority:** High  
**Dependencies:** 1.2

**File:** `tests/unit/lib/relationships.test.ts`

```typescript
describe('buildGraphData', () => {
  test('creates nodes for all techniques', () => {...});
  test('creates links for related techniques', () => {...});
  test('marks bidirectional links correctly', () => {...});
  test('assigns category colors to nodes', () => {...});
});

describe('filterGraphByCategory', () => {
  test('shows all nodes when category is "all"', () => {...});
  test('hides nodes not in selected category', () => {...});
  test('maintains links between visible nodes', () => {...});
});
```

### Task 2.3: Prompt Builder Tests
**Mode:** red-phase  
**Priority:** High  
**Dependencies:** 1.2

**File:** `tests/unit/lib/builder.test.ts`

```typescript
describe('generatePrompt', () => {
  test('combines role, task, context, output sections', () => {...});
  test('includes technique instructions when selected', () => {...});
  test('applies template correctly', () => {...});
});

describe('savePrompt / loadPrompt', () => {
  test('persists prompt to localStorage', () => {...});
  test('retrieves saved prompts', () => {...});
  test('handles corrupted localStorage gracefully', () => {...});
});
```

### Task 2.4: Component Tests
**Mode:** red-phase  
**Priority:** Medium  
**Dependencies:** 1.2

**Files:**
- `tests/unit/components/TechniqueCard.test.ts`
- `tests/unit/components/CategoryFilter.test.ts`
- `tests/unit/components/SearchInput.test.ts`

### Task 2.5: E2E Tests
**Mode:** red-phase  
**Priority:** Medium  
**Dependencies:** 1.2

**Files:**
- `tests/e2e/taxonomy.spec.ts`
- `tests/e2e/relationships.spec.ts`
- `tests/e2e/builder.spec.ts`

```typescript
// tests/e2e/taxonomy.spec.ts
test('filters techniques when clicking category button', async ({ page }) => {
  await page.goto('/taxonomy');
  await page.click('button:has-text("Reasoning Frameworks")');
  // Expect only reasoning techniques visible
});

// tests/e2e/builder.spec.ts
test('generates prompt from selected techniques', async ({ page }) => {
  await page.goto('/builder');
  await page.click('[data-technique="chain-of-thought"]');
  await page.fill('#roleInput', 'You are an expert problem solver');
  // Expect preview to update
});
```

---

## Phase 3: GREEN Phase - Implementation

### Task 3.1: Base Layout and Components
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 2.1-2.5

**Files:**
- `src/layouts/Layout.astro`
- `src/components/layout/Header.astro`
- `src/components/layout/Footer.astro`
- `src/components/layout/Navigation.astro`
- `src/components/ui/ThemeToggle.astro`

**Acceptance Criteria:**
- [ ] Layout matches vario.automation.website design
- [ ] Dark mode toggle works
- [ ] Navigation responsive on mobile

### Task 3.2: Content Collections Setup
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 3.1

**Files:**
- `src/content/config.ts`
- `src/content/categories/*.yaml`
- `scripts/migrate-techniques.ts` (converts JSON to MDX)

**Acceptance Criteria:**
- [ ] All 182 techniques migrated to MDX files
- [ ] Categories defined with icons and colors
- [ ] Schema validation passes

### Task 3.3: Technique Utilities
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 3.2

**Files:**
- `src/lib/techniques.ts`
- `src/lib/types.ts`

**Acceptance Criteria:**
- [ ] All Task 2.1 tests pass
- [ ] Type-safe technique queries

### Task 3.4: Taxonomy Page
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 3.3

**Files:**
- `src/pages/taxonomy.astro`
- `src/components/technique/TechniqueCard.astro`
- `src/components/technique/TechniqueList.astro`
- `src/components/technique/CategoryFilter.astro`
- `src/components/technique/TechniqueSearch.tsx`
- `src/components/technique/TechniqueModal.astro`

**Acceptance Criteria:**
- [ ] All techniques display in grid/list view
- [ ] Category filtering works
- [ ] Search filters techniques
- [ ] Modal shows full technique details

### Task 3.5: Relationship Graph
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 3.3

**Files:**
- `src/lib/relationships.ts`
- `src/pages/relationships.astro`
- `src/components/visualization/RelationshipGraph.tsx`
- `src/components/visualization/GraphControls.astro`

**Acceptance Criteria:**
- [ ] All Task 2.2 tests pass
- [ ] D3 force graph renders all techniques
- [ ] Category filtering animates smoothly
- [ ] Click on node shows technique details
- [ ] Zoom/pan works

### Task 3.6: Prompt Builder
**Mode:** green-phase  
**Priority:** High  
**Dependencies:** 3.3

**Files:**
- `src/lib/builder.ts`
- `src/pages/builder.astro`
- `src/components/builder/PromptBuilder.tsx`
- `src/components/builder/TechniqueSelector.tsx`
- `src/components/builder/PromptPreview.astro`
- `src/components/builder/TemplateGallery.astro`

**Acceptance Criteria:**
- [ ] All Task 2.3 tests pass
- [ ] Technique selection works
- [ ] Templates apply correctly
- [ ] Prompt preview updates in real-time
- [ ] Save/load prompts works

### Task 3.7: Additional Pages
**Mode:** green-phase  
**Priority:** Medium  
**Dependencies:** 3.4

**Files:**
- `src/pages/index.astro`
- `src/pages/patterns.astro`
- `src/pages/case-studies.astro`
- `src/pages/sources.astro`
- `src/pages/techniques/[...slug].astro`

**Acceptance Criteria:**
- [ ] All pages render without errors
- [ ] Dynamic technique pages work
- [ ] Links between pages work

---

## Phase 4: BLUE Phase - Refactor and Polish

### Task 4.1: Performance Optimization
**Mode:** blue-phase  
**Priority:** High  
**Dependencies:** 3.1-3.7

**Actions:**
- [ ] Lazy load D3 graph component
- [ ] Code split React islands
- [ ] Optimize images
- [ ] Add service worker for offline support
- [ ] Verify Lighthouse score > 90

### Task 4.2: Accessibility Audit
**Mode:** blue-phase  
**Priority:** High  
**Dependencies:** 3.1-3.7

**Actions:**
- [ ] Add skip-to-content link
- [ ] Ensure focus management in modals
- [ ] Add ARIA labels to interactive elements
- [ ] Test with screen reader
- [ ] Fix any contrast issues

### Task 4.3: Animation Polish
**Mode:** blue-phase  
**Priority:** Medium  
**Dependencies:** 4.1

**Actions:**
- [ ] Add reveal animations (CSS + Intersection Observer)
- [ ] Smooth page transitions
- [ ] Hover effects on cards
- [ ] Loading states for async content

### Task 4.4: Documentation
**Mode:** blue-phase  
**Priority:** Medium  
**Dependencies:** 4.1-4.3

**Files:**
- `README.md` update
- `CONTRIBUTING.md` update
- Component documentation

### Task 4.5: Final Integration Testing
**Mode:** blue-phase  
**Priority:** High  
**Dependencies:** 4.1-4.4

**Actions:**
- [ ] All E2E tests pass
- [ ] Manual testing on Chrome, Firefox, Safari
- [ ] Mobile testing
- [ ] Verify GitHub Pages deployment

---

## Phase 5: Deployment

### Task 5.1: CI/CD Setup
**Mode:** Code  
**Priority:** High  
**Dependencies:** 4.5

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Task 5.2: Final Deployment
**Mode:** Code  
**Priority:** High  
**Dependencies:** 5.1

**Actions:**
- [ ] Merge to main
- [ ] Verify deployment at https://mnehmos.github.io/mnehmos.prompts.research/
- [ ] Verify all features work in production

---

## Summary

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| Scaffolding | 2 | 1-2 hours |
| RED Phase | 5 | 2-3 hours |
| GREEN Phase | 7 | 8-12 hours |
| BLUE Phase | 5 | 3-4 hours |
| Deployment | 2 | 1 hour |
| **Total** | **21** | **15-22 hours** |

## Next Steps

1. Commit current changes (favicon, header-footer.js, styles.css)
2. Initialize Astro project structure
3. Begin RED phase with utility tests
