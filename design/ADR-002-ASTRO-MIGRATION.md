# ADR-002: Astro Migration for Prompt Engineering Taxonomy

## Status
**Proposed** | Date: 2025-12-29

## Context

The mnehmos.prompts.research website needs to be migrated from static HTML to Astro to:
1. Match the mnehmos ecosystem branding (vario.automation.website design system)
2. Improve maintainability with component architecture
3. Enable TDD workflow with proper testing infrastructure
4. Modernize the interactive components (relationship graph, prompt builder)
5. Leverage content collections for technique data management

### Current Architecture

```
mnehmos.prompts.research/
├── index.html                    # Static landing page
├── prompt-builder.html           # Static prompt builder page
├── workflow-patterns.html        # Static workflow patterns page
├── case-studies.html             # Static case studies page
├── sources.html                  # Attribution page
├── agent-rules-integration.html  # Agent rules page
├── assets/
│   ├── css/styles.css           # 1800+ lines monolithic CSS
│   └── js/
│       ├── header-footer.js     # Dynamic header/footer injection
│       ├── main.js              # Animations, theme toggle
│       ├── data-loader.js       # Technique data with embedded JSON
│       ├── network-visualization.js  # D3.js force graph (~700 lines)
│       └── data-loader-utils.js # Helper functions
├── js/prompt-builder.js          # Prompt builder class (~800 lines)
├── data/processed/
│   ├── techniques.json          # 182+ techniques
│   ├── technique_categories.json # Category definitions
│   └── patterns.json            # Workflow patterns
└── reports/
    ├── taxonomy-overview.html   # Technique browser
    └── technique-relationships.html  # Network visualization
```

### Pain Points

1. **Duplicated data** - Technique data embedded in 3+ JavaScript files
2. **No type safety** - Vanilla JavaScript, no compile-time checks
3. **Monolithic CSS** - 1800+ lines, hard to maintain
4. **No testing** - Zero automated tests
5. **Inconsistent layouts** - Some pages use header-footer.js, others inline HTML
6. **No SSG benefits** - Fully client-rendered, no SEO optimization

## Decision

Migrate to **Astro 4.x** with the following architecture:

### Target Architecture

```
mnehmos.prompts.research/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── vitest.config.ts
├── playwright.config.ts
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Card.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Button.astro
│   │   │   ├── Modal.astro
│   │   │   ├── SearchInput.astro
│   │   │   └── ThemeToggle.astro
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   └── Hero.astro
│   │   ├── technique/            # Technique-specific components
│   │   │   ├── TechniqueCard.astro
│   │   │   ├── TechniqueList.astro
│   │   │   ├── TechniqueModal.astro
│   │   │   ├── CategoryFilter.astro
│   │   │   └── TechniqueSearch.tsx  # React island
│   │   ├── visualization/        # Interactive visualizations
│   │   │   ├── RelationshipGraph.tsx  # React + D3.js island
│   │   │   └── GraphControls.astro
│   │   └── builder/              # Prompt builder components
│   │       ├── PromptBuilder.tsx     # React island
│   │       ├── TechniqueSelector.tsx
│   │       ├── PromptPreview.astro
│   │       └── TemplateGallery.astro
│   ├── content/
│   │   ├── config.ts             # Content collection schemas
│   │   ├── techniques/           # Technique MDX files
│   │   │   ├── chain-of-thought.mdx
│   │   │   ├── few-shot-learning.mdx
│   │   │   └── ...
│   │   ├── categories/           # Category definitions
│   │   │   ├── reasoning-frameworks.yaml
│   │   │   ├── agent-tool-use.yaml
│   │   │   └── ...
│   │   ├── patterns/             # Workflow patterns
│   │   │   ├── boomerang-coordination.mdx
│   │   │   └── ...
│   │   └── case-studies/         # Case study content
│   │       ├── quest-keeper-ai.mdx
│   │       └── ...
│   ├── layouts/
│   │   ├── Layout.astro          # Base layout
│   │   ├── TechniqueLayout.astro # Technique detail layout
│   │   └── DocsLayout.astro      # Documentation layout
│   ├── pages/
│   │   ├── index.astro           # Landing page
│   │   ├── taxonomy.astro        # Technique browser
│   │   ├── relationships.astro   # Network visualization
│   │   ├── builder.astro         # Prompt builder
│   │   ├── patterns.astro        # Workflow patterns
│   │   ├── case-studies.astro    # Case studies index
│   │   ├── sources.astro         # Attribution
│   │   ├── techniques/
│   │   │   └── [...slug].astro   # Dynamic technique pages
│   │   └── api/                  # API routes
│   │       ├── techniques.json.ts
│   │       └── search.json.ts
│   ├── styles/
│   │   ├── global.css            # Tailwind + custom properties
│   │   └── components/           # Component-specific styles
│   ├── lib/
│   │   ├── techniques.ts         # Technique data utilities
│   │   ├── relationships.ts      # Graph relationship logic
│   │   ├── search.ts             # Search/filter utilities
│   │   └── types.ts              # TypeScript type definitions
│   └── utils/
│       ├── format.ts             # Formatting utilities
│       └── cn.ts                 # Class name utility
├── tests/
│   ├── unit/                     # Vitest unit tests
│   │   ├── lib/
│   │   │   ├── techniques.test.ts
│   │   │   ├── relationships.test.ts
│   │   │   └── search.test.ts
│   │   └── components/
│   │       ├── TechniqueCard.test.ts
│   │       └── PromptBuilder.test.tsx
│   └── e2e/                      # Playwright E2E tests
│       ├── taxonomy.spec.ts
│       ├── relationships.spec.ts
│       └── builder.spec.ts
└── public/
    ├── favicon.svg
    └── og-image.png
```

## Design Decisions

### 1. Component Framework

**Decision:** Use Astro components for static content, React islands for interactive components.

**Rationale:**
- Astro components for zero-JS static content (cards, layouts, lists)
- React for complex stateful components (D3 graph, prompt builder)
- `client:visible` directive for lazy-loading interactive components

### 2. Styling Strategy

**Decision:** Tailwind CSS with CSS custom properties for theming.

**Design Tokens:**
```css
:root {
  /* Primary: Indigo (from mnehmos ecosystem) */
  --primary: #4f46e5;
  --primary-light: #6366f1;
  --primary-dark: #4338ca;
  
  /* Accent: Copper (from vario.automation) */
  --copper: #B87333;
  --copper-light: #D4956A;
  
  /* Semantic */
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.3);
}

[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(71, 85, 105, 0.3);
}
```

### 3. Content Collections

**Decision:** Use Astro Content Collections with Zod schemas for type-safe content.

**Technique Schema:**
```typescript
// src/content/config.ts
import { z, defineCollection } from 'astro:content';

const techniquesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    sources: z.array(z.string()),
    relatedTechniques: z.array(z.string()).optional(),
    useCase: z.string().optional(),
    tips: z.string().optional(),
    commonMistakes: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    maturity: z.enum(['production', 'emerging', 'research']).optional(),
    modelSpecific: z.record(z.string()).optional(),
  }),
});

const categoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
    order: z.number(),
  }),
});
```

### 4. Interactive Components Architecture

#### Relationship Graph (React + D3.js)

```typescript
// src/components/visualization/RelationshipGraph.tsx
interface GraphProps {
  techniques: Technique[];
  categories: Category[];
  initialCategory?: string;
}

// Key features:
// - Force simulation with WebGL rendering for performance
// - Category filtering with smooth transitions
// - Node click → technique detail modal
// - Zoom/pan with minimap
// - Export as PNG/SVG
```

#### Prompt Builder (React)

```typescript
// src/components/builder/PromptBuilder.tsx
interface PromptBuilderProps {
  techniques: Technique[];
  templates: Template[];
}

// Key features:
// - Drag-and-drop technique selection
// - Real-time prompt preview with syntax highlighting
// - Template system with customization
// - Save/load prompts to localStorage
// - Copy to clipboard with format options
// - AI-powered suggestions (optional)
```

### 5. Testing Strategy

**Unit Tests (Vitest):**
```typescript
// tests/unit/lib/techniques.test.ts
describe('Technique utilities', () => {
  test('getTechniquesByCategory filters correctly', () => {...});
  test('searchTechniques matches name, description, aliases', () => {...});
  test('getRelatedTechniques returns valid technique IDs', () => {...});
});

// tests/unit/components/TechniqueCard.test.ts
describe('TechniqueCard', () => {
  test('renders technique name and category', () => {...});
  test('displays source count correctly', () => {...});
  test('handles click to open modal', () => {...});
});
```

**E2E Tests (Playwright):**
```typescript
// tests/e2e/taxonomy.spec.ts
test.describe('Taxonomy Page', () => {
  test('filters techniques by category', async ({ page }) => {...});
  test('search returns matching techniques', async ({ page }) => {...});
  test('technique modal displays full details', async ({ page }) => {...});
});

// tests/e2e/builder.spec.ts
test.describe('Prompt Builder', () => {
  test('combines multiple techniques into prompt', async ({ page }) => {...});
  test('saves and loads prompts', async ({ page }) => {...});
  test('copies prompt to clipboard', async ({ page }) => {...});
});
```

### 6. Build and Deploy

**Configuration:**
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mnehmos.github.io',
  base: '/mnehmos.prompts.research/',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'd3': ['d3'],
            'react': ['react', 'react-dom'],
          }
        }
      }
    }
  }
});
```

## Migration Plan

### Phase 1: Scaffolding (RED)
1. Initialize Astro project with React + Tailwind
2. Write failing tests for core utilities
3. Write failing tests for key components
4. Setup CI/CD with GitHub Actions

### Phase 2: Implementation (GREEN)
1. Create base layouts and navigation
2. Migrate content to collections
3. Implement technique browser
4. Implement relationship graph
5. Implement prompt builder
6. Make all tests pass

### Phase 3: Polish (BLUE)
1. Optimize performance (lazy loading, code splitting)
2. Add accessibility improvements
3. Refine animations and transitions
4. Documentation and README updates

## Consequences

### Positive
- **Type safety** across all content and components
- **Better DX** with hot reload and component isolation
- **Faster builds** with Astro's partial hydration
- **SEO optimization** with static HTML generation
- **Testable** components and utilities
- **Maintainable** with clear separation of concerns

### Negative
- **Learning curve** for team unfamiliar with Astro
- **Migration effort** for existing content
- **React overhead** for interactive components (mitigated by islands)

### Risks
- D3.js integration complexity with React reconciliation
- Content collection migration may reveal data inconsistencies
- Initial bundle size from D3.js (mitigate with dynamic import)

## References

- [Astro Documentation](https://docs.astro.build)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [D3.js with React](https://2019.wattenberger.com/blog/react-and-d3)
- [vario.automation.website Design System](../vario.automation.website/)
- [ADR-001: Research Integration](./ADR-001-RESEARCH-INTEGRATION-IMPLEMENTATION.md)
