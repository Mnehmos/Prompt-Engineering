# Orchestrator Prompt: Astro Migration with TDD

## Mission

Migrate `mnehmos.prompts.research` from static HTML to Astro 4.x using Test-Driven Development (RED → GREEN → BLUE). The site should match the mnehmos ecosystem design system while reimagining each feature with modern UX patterns. The site is also to be enahnced with learnings from all the projects in the ecosystem to bring grounding and first person experience to the site information.

---

## Context Files

**Reference these before starting each phase:**
- [`design/ADR-002-ASTRO-MIGRATION.md`](ADR-002-ASTRO-MIGRATION.md) - Architecture decisions
- [`design/TASKMAP-ASTRO-MIGRATION.md`](TASKMAP-ASTRO-MIGRATION.md) - Task breakdown
- [`design/DESIGN-SYSTEM-CONTRACT.md`](DESIGN-SYSTEM-CONTRACT.md) - Visual language

**Reference Sites:**
- `F:\Github\mnehmos.multi-agent.framework\website\` - Header logo animations, layout patterns
- `F:\Github\vario.automation.website\` - Corporate styling, stone/copper palette
- `F:\Github\mnehmos.index-foundry.mcp\projects\mnehmos-ecosystem` - RAG access for my projects

**RAG Index:**
- Project ID: `prompts-research-analysis` (1,184 chunks indexed)
- Query for existing content insights during implementation

---

## Phase 1: Scaffolding

### Task 1.1: Initialize Astro Project

**Mode:** Code

```bash
cd F:/Github/mnehmos.prompts.research

# Create new Astro project in temp location
npm create astro@latest -- --template minimal astro-new

# Move contents and clean up
# (preserve existing data/ folder)
```

**Install dependencies:**
```bash
npm install @astrojs/react @astrojs/tailwind react react-dom
npm install d3 @types/d3 clsx tailwind-merge lucide-react
npm install -D vitest @vitest/ui @testing-library/react jsdom
npm install -D playwright @playwright/test
npm install -D typescript @types/react @types/react-dom
```

**Acceptance:**
- [ ] `npm run dev` starts at localhost:4321
- [ ] `npm run build` succeeds
- [ ] TypeScript strict mode enabled

### Task 1.2: Configure Testing

**Mode:** Code

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

Create `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Phase 2: RED Phase - Write Failing Tests

### Task 2.1: Technique Utility Tests

**Mode:** red-phase

**File:** `tests/unit/lib/techniques.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { 
  getTechniquesByCategory, 
  searchTechniques, 
  getRelatedTechniques,
  getTechniqueById 
} from '../../../src/lib/techniques';

describe('getTechniquesByCategory', () => {
  test('returns empty array for invalid category', () => {
    const result = getTechniquesByCategory('nonexistent');
    expect(result).toEqual([]);
  });

  test('returns all techniques when category is "all"', () => {
    const result = getTechniquesByCategory('all');
    expect(result.length).toBeGreaterThan(100);
  });

  test('filters techniques by specific category', () => {
    const result = getTechniquesByCategory('reasoning-frameworks');
    expect(result.every(t => t.category === 'reasoning-frameworks')).toBe(true);
  });
});

describe('searchTechniques', () => {
  test('matches technique names case-insensitively', () => {
    const result = searchTechniques('chain of thought');
    expect(result.some(t => t.id === 'chain-of-thought')).toBe(true);
  });

  test('matches description content', () => {
    const result = searchTechniques('reasoning step by step');
    expect(result.length).toBeGreaterThan(0);
  });

  test('matches aliases when provided', () => {
    const result = searchTechniques('CoT');
    expect(result.some(t => t.id === 'chain-of-thought')).toBe(true);
  });

  test('returns empty array for no matches', () => {
    const result = searchTechniques('xyznonexistent123');
    expect(result).toEqual([]);
  });
});

describe('getRelatedTechniques', () => {
  test('returns technique objects for valid related IDs', () => {
    const result = getRelatedTechniques('chain-of-thought');
    expect(result.every(t => typeof t.name === 'string')).toBe(true);
  });

  test('filters out invalid related technique IDs', () => {
    // If a technique has a bad relatedTechnique ID, it shouldn't crash
    const result = getRelatedTechniques('some-technique-with-bad-relations');
    expect(Array.isArray(result)).toBe(true);
  });
});
```

### Task 2.2: Relationship Graph Tests

**Mode:** red-phase

**File:** `tests/unit/lib/relationships.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { buildGraphData, filterGraphByCategory } from '../../../src/lib/relationships';

describe('buildGraphData', () => {
  test('creates nodes for all techniques', () => {
    const { nodes } = buildGraphData();
    expect(nodes.length).toBeGreaterThan(100);
  });

  test('creates links for related techniques', () => {
    const { links } = buildGraphData();
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveProperty('source');
    expect(links[0]).toHaveProperty('target');
  });

  test('marks bidirectional links correctly', () => {
    const { links } = buildGraphData();
    const bidirectional = links.filter(l => l.bidirectional);
    expect(bidirectional.length).toBeGreaterThan(0);
  });

  test('assigns category colors to nodes', () => {
    const { nodes } = buildGraphData();
    expect(nodes.every(n => typeof n.color === 'string')).toBe(true);
  });
});

describe('filterGraphByCategory', () => {
  test('shows all nodes when category is "all"', () => {
    const full = buildGraphData();
    const filtered = filterGraphByCategory(full, 'all');
    expect(filtered.nodes.length).toBe(full.nodes.length);
  });

  test('hides nodes not in selected category', () => {
    const full = buildGraphData();
    const filtered = filterGraphByCategory(full, 'reasoning-frameworks');
    expect(filtered.nodes.length).toBeLessThan(full.nodes.length);
    expect(filtered.nodes.every(n => n.category === 'reasoning-frameworks')).toBe(true);
  });
});
```

### Task 2.3: Prompt Builder Tests

**Mode:** red-phase

**File:** `tests/unit/lib/builder.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { 
  generatePrompt, 
  savePrompt, 
  loadPrompts, 
  applyTemplate 
} from '../../../src/lib/builder';

describe('generatePrompt', () => {
  test('combines role, task, context, output sections', () => {
    const prompt = generatePrompt({
      role: 'You are an expert analyst.',
      task: 'Analyze the data.',
      context: 'The data comes from 2024.',
      output: 'Provide a summary.',
      techniques: [],
    });
    expect(prompt).toContain('You are an expert analyst');
    expect(prompt).toContain('Analyze the data');
    expect(prompt).toContain('2024');
    expect(prompt).toContain('summary');
  });

  test('includes technique instructions when selected', () => {
    const prompt = generatePrompt({
      role: 'Assistant',
      task: 'Solve this problem',
      context: '',
      output: '',
      techniques: ['chain-of-thought'],
    });
    expect(prompt).toContain('step by step');
  });

  test('applies template correctly', () => {
    const prompt = applyTemplate('problem-solving', {
      task: 'Fix the bug',
    });
    expect(prompt).toContain('problem solver');
    expect(prompt).toContain('Fix the bug');
  });
});

describe('savePrompt / loadPrompts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('persists prompt to localStorage', () => {
    savePrompt({ name: 'Test', content: 'Hello' });
    const prompts = loadPrompts();
    expect(prompts.some(p => p.name === 'Test')).toBe(true);
  });

  test('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('promptBuilder_saved', 'not-valid-json');
    const prompts = loadPrompts();
    expect(Array.isArray(prompts)).toBe(true);
  });
});
```

### Task 2.4: E2E Tests

**Mode:** red-phase

**File:** `tests/e2e/taxonomy.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Taxonomy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/taxonomy');
  });

  test('displays technique count', async ({ page }) => {
    const count = page.locator('[data-testid="technique-count"]');
    await expect(count).toContainText(/\d+ techniques/i);
  });

  test('filters by category when clicking filter button', async ({ page }) => {
    await page.click('button:has-text("Reasoning Frameworks")');
    const cards = page.locator('[data-testid="technique-card"]');
    // Should show only reasoning techniques
    await expect(cards.first()).toBeVisible();
  });

  test('search filters techniques', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'chain of thought');
    const cards = page.locator('[data-testid="technique-card"]');
    await expect(cards).toHaveCount(1);
  });

  test('clicking technique opens modal', async ({ page }) => {
    await page.click('[data-testid="technique-card"]:first-child');
    const modal = page.locator('[data-testid="technique-modal"]');
    await expect(modal).toBeVisible();
  });
});
```

---

## Phase 3: GREEN Phase - Implementation

### Feature Design Specifications

#### 3.1 Taxonomy Browser - Modern Card Grid

**Design Vision:**
- Masonry-style grid with variable card heights
- Category pills at top with count badges
- Instant search with highlighting
- View toggle: Grid / List / Compact
- Card hover: subtle lift + border glow
- Dark mode: slate-800 cards with indigo accent

**Component Structure:**
```
TaxonomyPage.astro
├── Hero (title, description, count)
├── SearchBar (instant filter)
├── CategoryFilter (pills with counts)
├── ViewToggle (grid/list/compact)
└── TechniqueGrid
    └── TechniqueCard.astro (x182)
        ├── Category badge
        ├── Name + Description
        ├── Source count
        └── Related count
```

#### 3.2 Relationship Visualization - Interactive Galaxy

**Design Vision:**
- Dark canvas with constellation aesthetic
- Nodes as glowing orbs with category colors
- Links as faint lines, brighten on hover
- Zoom controls + minimap
- Click node → slide-in details panel
- Category filter as legend toggles

**Technical Approach:**
```typescript
// RelationshipGraph.tsx (React + D3)
- Use WebGL via @react-three/fiber for 1000+ nodes
- Or stick with D3 SVG with virtual scrolling
- Smooth animations with d3-transition
- Touch-friendly: pinch zoom, drag pan
```

#### 3.3 Prompt Builder - Workspace Experience

**Design Vision:**
- Split layout: left = technique picker, right = prompt canvas
- Drag-and-drop technique badges onto sections
- Live preview with syntax highlighting
- Template drawer (slide from right)
- Save/Load as modal with nice cards
- Copy button with format options (raw, markdown, JSON)

**Component Structure:**
```
BuilderPage.astro
├── TechniquePanel (left sidebar)
│   ├── SearchInput
│   ├── CategoryTabs
│   └── TechniqueList (draggable items)
├── PromptCanvas (main area)
│   ├── SectionEditor (role/task/context/output)
│   ├── TechniqueDropZone
│   └── PreviewPane
└── ActionBar
    ├── TemplateButton
    ├── SaveButton
    ├── CopyButton
    └── ClearButton
```

#### 3.4 Landing Page - Hero + Feature Cards

**Design Vision:**
- Full-bleed hero with gradient background
- Animated logo (same as header)
- Three feature cards with icons
- Stats section with animated counters
- Quick-start CTA buttons
- Footer with ecosystem links

---

## Phase 4: BLUE Phase - Polish

### Task 4.1: Performance Optimization

**Mode:** blue-phase

- [ ] Lazy load D3 graph with `client:visible`
- [ ] Code split React islands
- [ ] Preload critical fonts
- [ ] Add service worker for offline
- [ ] Lighthouse score > 90

### Task 4.2: Accessibility Audit

**Mode:** blue-phase

- [ ] Skip-to-content link
- [ ] Focus management in modals
- [ ] ARIA labels on all controls
- [ ] Keyboard navigation in graph
- [ ] Screen reader testing

### Task 4.3: Animation Polish

**Mode:** blue-phase

- [ ] Reveal animations (Intersection Observer)
- [ ] Page transitions (View Transitions API)
- [ ] Card hover effects
- [ ] Loading skeletons
- [ ] Reduced motion support

---

## Orchestrator Commands

### Start RED Phase
```
Switch to red-phase mode and implement Task 2.1 (technique utility tests).
Run `npm test` to confirm tests fail with meaningful errors.
```

### Start GREEN Phase
```
Switch to green-phase mode and implement Task 3.3 (technique utilities).
Run `npm test` to confirm all Task 2.1 tests pass.
```

### Start BLUE Phase
```
Switch to blue-phase mode and refactor Task 3.3 for performance.
Ensure all tests still pass after refactoring.
```

### Deploy
```
Switch to code mode and implement Task 5.1 (CI/CD).
Push to main and verify GitHub Pages deployment.
```

---

## Success Criteria

1. **All tests pass** (unit + e2e)
2. **Lighthouse score > 90** (performance, accessibility, SEO)
3. **Design matches ecosystem** (copper accents, glassmorphism, animations)
4. **Mobile responsive** (works on 375px screens)
5. **Dark mode works** (all components)
6. **Content preserved** (182 techniques, all relationships)
7. **RAG Agent functional** (chat interface answers technique questions)

---

## Phase 5: RAG Agent Integration

### Task 5.1: Deploy RAG Search Endpoint

**Mode:** Code

Use Index Foundry to serve the prompts-research-analysis project:

```typescript
// Use existing project or rebuild with hierarchical chunking
await mcp_indexfoundry_project_serve({
  project_id: 'prompts-research-analysis',
  port: 8080,
  mode: 'dev'
});
```

**Acceptance:**
- [ ] `/api/search` endpoint returns technique chunks
- [ ] `/api/chat` endpoint generates contextual responses
- [ ] Context expansion works (parent + adjacent chunks)

### Task 5.2: Build Chat Interface Component

**Mode:** green-phase

**File:** `src/components/chat/TechniqueChat.tsx`

**Design Vision:**
- Floating chat bubble in bottom-right corner
- Slide-up panel with conversation history
- Technique cards embedded in responses
- "Ask about any technique..." placeholder
- Uses RAG to answer: "Which technique for step-by-step reasoning?"

**Component Structure:**
```
TechniqueChat.tsx (React island, client:visible)
├── ChatBubble (floating trigger)
├── ChatPanel
│   ├── MessageList
│   │   ├── UserMessage
│   │   └── AssistantMessage
│   │       └── TechniqueCard (inline)
│   ├── InputArea
│   └── SuggestedQuestions
└── useChatSession (hook with RAG integration)
```

### Task 5.3: RAG Query Pipeline

**Mode:** Code

**File:** `src/lib/rag.ts`

```typescript
import type { Technique } from './types';

interface RAGResult {
  answer: string;
  techniques: Technique[];
  sources: string[];
}

export async function queryTechniques(query: string): Promise<RAGResult> {
  // 1. Classify query to determine if RAG needed
  const classification = await classifyQuery(query);
  
  // 2. If retrieval needed, search vector DB
  if (classification.needsRetrieval) {
    const chunks = await searchChunks(query, {
      mode: 'hybrid',
      top_k: 5,
      expand_context: { enabled: true, strategy: 'both' }
    });
    
    // 3. Extract technique IDs from chunks
    const techniqueIds = extractTechniqueIds(chunks);
    
    // 4. Generate response with context
    const answer = await generateAnswer(query, chunks);
    
    return {
      answer,
      techniques: await getTechniquesByIds(techniqueIds),
      sources: chunks.map(c => c.source.uri)
    };
  }
  
  return { answer: classification.directAnswer, techniques: [], sources: [] };
}
```

### Task 5.4: Example Queries to Test

```
- "What's the best technique for complex reasoning?"
- "How do I use chain of thought prompting?"
- "Which techniques work well together for code generation?"
- "What's the difference between few-shot and zero-shot?"
- "Recommend techniques for creative writing tasks"
```

---

## Coordination Notes

- Use `mcp--mnehmosindex-foundrymcp--indexfoundry_project_query` to search existing content
- Use `mcp--mnehmossynchmcp--set_active_context` to persist state between sessions
- Commit after each phase completes
- Tag releases: `v2.0.0-alpha` (after GREEN), `v2.0.0` (after BLUE)
