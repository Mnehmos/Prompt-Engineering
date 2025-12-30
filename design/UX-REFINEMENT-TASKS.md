# UX Refinement Tasks

Based on user feedback after initial Astro migration deployment.

## Issue 1: Taxonomy Page - Filter UX

### Problem
- "All Techniques" heading is misleading when a category filter is active
- No visible way to clear filter and return to all 192 techniques
- Title should reflect current state

### Solution
- Dynamic heading: "All Techniques (192)" → "Secure Agent Architectures (12)"
- Add "Clear Filter" button next to category pills when filter is active
- Highlight active category in the filter bar

### Files
- `src/pages/taxonomy.astro`
- `src/styles/global.css`

---

## Issue 2: Technique Modal - Navigation

### Problem
- Modal shows single technique but no way to browse through the list
- Have to close modal and click next card

### Solution
- Add prev/next arrows in modal header/footer
- Arrow key navigation (left/right)
- Swipe gestures on mobile (touch events)
- Show position indicator: "3 of 12"

### Files
- `src/components/TechniqueCard.astro` (or new `TechniqueModal.tsx`)
- `src/scripts/modal-navigation.ts`

---

## Issue 3: Prompt Builder - Layout Overhaul

### Problem
- Technique selector dropdown is tiny
- Categories and techniques mixed together
- Layout doesn't use screen space well

### Solution
Split into two-column layout:
```
┌─────────────────────────────────────────────────────────┐
│  PROMPT BUILDER                                         │
├──────────────────────┬──────────────────────────────────┤
│  CATEGORIES          │  TECHNIQUES                      │
│  ○ All (192)         │  [Search techniques...]          │
│  ○ Context Eng (20)  │  ┌────────────┬────────────┐    │
│  ○ Workflow (21)     │  │ Chain-of-  │ Tree-of-   │    │
│  ○ Agentic (25)      │  │ Thought    │ Thought    │    │
│  ...                 │  ├────────────┼────────────┤    │
│                      │  │ ReAct      │ Reflexion  │    │
│                      │  └────────────┴────────────┘    │
├──────────────────────┴──────────────────────────────────┤
│  SELECTED TECHNIQUES (3)                                │
│  [Chain-of-Thought] [ReAct] [Memory Strategies]         │
├─────────────────────────────────────────────────────────┤
│  PREVIEW                                                │
│  Your prompt with selected techniques...                │
└─────────────────────────────────────────────────────────┘
```

### Files
- `src/pages/builder.astro`
- `src/components/TechniqueSelector.astro`
- `src/scripts/prompt-builder.ts`

---

## Issue 4: Relationships Graph - Full Page Layout

### Problem
- Graph visualization is small relative to page
- Sidebar takes too much space
- Tiny nodes hard to interact with

### Solution
- Full-width graph visualization
- Collapsible sidebar or floating controls
- Larger node sizes
- Better zoom defaults
- Focus mode: click category to isolate its techniques

### Files
- `src/pages/relationships.astro`
- `src/components/RelationshipGraph.astro`
- `src/scripts/d3-graph.ts`

---

## Issue 5: Demo Chatbot - RAG Integration

### Problem
- Demo mode is confusing
- No actual RAG backend connected
- Index Foundry project not in repo

### Solution
1. Create `.indexfoundry/` directory in repo with project config
2. Add build script to generate vectors
3. Connect to IndexFoundry serve endpoint
4. Or: Remove demo chat until backend is ready

### Files
- `.indexfoundry/project.json` (new)
- `src/pages/search.astro`
- `src/scripts/chat.ts`
- `package.json` (add index-foundry scripts)

---

## Issue 6: Header Logo Not Updating

### Problem
Screenshot shows "PromptResearch" instead of "mnehmos.prompt.research"

### Solution
GitHub Pages cache may not have updated. Verify in Header.astro the change is correct, then hard refresh or wait for cache invalidation.

### Verification
Check `src/components/Header.astro` line 47-48 shows:
```astro
<span class="logo-text"><span class="logo-text--prefix">mnehmos</span><span class="logo-text--accent">.prompt.research</span></span>
```

---

## Priority Order

1. **High**: Issue 1 (Filter UX) - Quick win, major UX improvement
2. **High**: Issue 3 (Prompt Builder layout) - Core feature is unusable
3. **Medium**: Issue 2 (Modal navigation) - Nice to have
4. **Medium**: Issue 4 (Graph layout) - Works but awkward
5. **Low**: Issue 5 (RAG) - Requires backend work
6. **None**: Issue 6 (Logo) - Just cache, should resolve

---

## Estimated Effort

| Issue | Complexity | Time |
|-------|------------|------|
| 1 | Simple | 30 min |
| 2 | Medium | 1 hr |
| 3 | Complex | 2-3 hr |
| 4 | Medium | 1-2 hr |
| 5 | Complex | 2 hr |
| 6 | None | 0 |

**Total**: ~7-8 hours of development work
