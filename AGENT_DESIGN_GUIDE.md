# Prompt Engineering Taxonomy - Agent Design Document

## Overview
This document provides guidelines for agents working on the Prompt Engineering Taxonomy educational website. The project maintains a specific architecture and design philosophy that must be preserved.

## Core Architecture Principles

### 1. Static Site Philosophy
- **No Build Dependencies**: The site runs directly in browsers without compilation
- **Embedded Data Strategy**: JSON data is embedded in JavaScript files to avoid CORS issues
- **Progressive Enhancement**: Core functionality works without JavaScript

### 2. File Structure & Responsibilities

```
├── index.html                     # Landing page
├── prompt-builder.html            # Interactive prompt builder tool  
├── sources.html                   # Research attribution page
├── assets/
│   ├── css/styles.css             # Global styles with CSS custom properties
│   └── js/
│       ├── main.js                # General site utilities
│       ├── data-loader.js         # Taxonomy data & display logic
│       ├── header-footer.js       # Shared component injection
│       └── network-visualization.js # D3.js relationship graphs
├── js/prompt-builder.js           # Standalone prompt builder logic
├── reports/
│   ├── taxonomy-overview.html     # Main technique browser
│   └── technique-relationships.html # Network visualization
└── data/processed/                # Reference data (not directly used)
```

## Design Patterns & Conventions

### Data Management Pattern
**Current Approach**: Each major feature embeds its own data copy
```javascript
// Pattern used in data-loader.js, prompt-builder.js, network-visualization.js
this.techniquesData = {
  categories: [
    {
      id: "category-id",
      techniques: [
        {
          id: "technique-id", 
          name: "Technique Name",
          description: "...",
          sources: ["..."],
          relatedTechniques: ["..."],
          // Educational fields
          useCase: "...",
          example: "...",
          tips: "...",
          commonMistakes: "..."
        }
      ]
    }
  ]
};
```

**MAINTAIN**: This embedded approach for browser compatibility
**EXTEND**: Add new educational fields following existing patterns

### Component Injection Pattern
```javascript
// Standard pattern from header-footer.js
function injectHeader(basePath) {
  const existingHeader = document.querySelector('header');
  if (!existingHeader) return;
  existingHeader.innerHTML = headerHTML;
}
```

**EXTEND**: Use this pattern for other reusable components
**MAINTAIN**: Path-aware injection for multi-level directory structure

### CSS Architecture
```css
/* CSS Custom Properties Pattern */
:root {
  --primary: #5468ff;
  --font-sans: 'Inter', sans-serif;
  --border-radius: 0.375rem;
}

/* Component-scoped Classes */
.technique-card { /* ... */ }
.technique-list-item { /* ... */ }
.modal-content { /* ... */ }
```

**MAINTAIN**: Custom property system for consistency
**EXTEND**: Follow BEM-like naming for new components

### JavaScript Class Patterns
```javascript
// Standard class structure
class ComponentName {
  constructor() {
    this.data = null;
    this.currentState = {};
  }
  
  init() {
    this.loadData();
    this.setupUI();
    this.addEventListeners();
  }
  
  loadData() { /* Embed or process data */ }
  setupUI() { /* DOM manipulation */ }
  addEventListeners() { /* Event binding */ }
}
```

## Agent Guidelines

### When Adding New Techniques
1. **Update ALL embedded data copies** in:
   - `assets/js/data-loader.js` (lines ~52-578)
   - `js/prompt-builder.js` (lines ~215-517) 
   - `assets/js/network-visualization.js` (lines ~62-517)

2. **Follow technique data structure**:
```javascript
{
  id: "kebab-case-id",
  name: "Human Readable Name", 
  description: "Clear explanation",
  sources: ["Author et al.", "Paper Name"],
  relatedTechniques: ["other-technique-ids"],
  useCase: "When to use this",
  example: "Concrete example",
  tips: "Best practices", // Optional
  commonMistakes: "What to avoid" // Optional
}
```

### When Modifying UI Components
1. **Preserve responsive design** - test mobile/tablet/desktop
2. **Maintain accessibility** - keep ARIA labels and keyboard navigation
3. **Follow color/spacing system** - use CSS custom properties
4. **Update ALL views** if changing technique display (cards, list, modal)

### When Adding Features
1. **Check existing patterns first** - reuse established approaches
2. **Maintain no-build philosophy** - avoid requiring compilation steps
3. **Progressive enhancement** - ensure core functionality without JavaScript
4. **Path-aware navigation** - handle relative paths for nested pages

### Critical Don'ts
- ❌ **Don't break the embedded data pattern** - external JSON files won't work in browsers
- ❌ **Don't introduce build dependencies** - keep it deployable to GitHub Pages
- ❌ **Don't modify data in only one file** - maintain consistency across copies
- ❌ **Don't break existing URL patterns** - maintain bookmarkable links
- ❌ **Don't ignore mobile responsiveness** - significant mobile user base

### Testing Checklist
- [ ] All embedded data sources match
- [ ] Mobile/tablet layouts functional
- [ ] Cross-page navigation works
- [ ] Search and filtering operational
- [ ] Modal interactions accessible
- [ ] Network visualization loads
- [ ] Prompt builder functional

### Extension Points
- **New technique categories**: Follow existing category structure
- **Additional visualizations**: Use D3.js pattern from network-visualization.js
- **Educational content**: Extend tips/mistakes/examples fields
- **Interactive elements**: Follow modal and event handling patterns
- **Responsive features**: Use CSS custom properties and existing breakpoints

This document ensures consistency while enabling controlled expansion of the educational website's capabilities.