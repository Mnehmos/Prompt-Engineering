# Prompt Engineering Taxonomy - Knowledge Base Document

## Quick Reference

| Property | Value |
|----------|-------|
| **Repository** | https://github.com/Mnehmos/mnehmos.prompts.research |
| **Primary Language** | TypeScript / JavaScript |
| **Project Type** | Research / Website |
| **Status** | Active |
| **Last Updated** | 2025-12-29 |

## Overview

The Prompt Engineering Taxonomy is a comprehensive, interactive research resource that catalogues and visualizes 180+ prompt engineering techniques derived from 17+ research papers and 6 months of AI research (June-November 2025). The project transforms academic research into an accessible, searchable web application that serves as a reference guide for AI developers, researchers, and practitioners working with large language models and agentic systems.

## Architecture

### System Design

This project implements a static site generator pattern using Astro, enhanced with React components for interactivity and D3.js for data visualizations. The architecture separates concerns into:

- **Data Layer**: Structured JSON files containing technique definitions, categorizations, and relationships
- **Processing Layer**: Node.js scripts for data validation, synchronization, and quality assurance
- **Presentation Layer**: Astro-based static site with React islands for interactive components
- **Integration Layer**: RAG server for AI-powered querying and research automation
- **Deployment**: GitHub Pages for zero-cost hosting with automated CI/CD

The system does not connect to external APIs at runtime but includes build-time integrations for research data collection via MCP (Model Context Protocol) servers.

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Data Store | JSON files containing 180+ techniques across 11 categories | `data/processed/` |
| Validation Scripts | Quality assurance and data integrity checking | `scripts/` |
| Astro Site | Static site generator configuration and build process | `astro.config.mjs`, `src/` |
| RAG Server | AI-powered query interface for taxonomy knowledge | `rag-server/` |
| Design Documents | Architecture decisions and system specifications | `design/` |
| Interactive Reports | HTML visualizations of technique relationships | `reports/` |

### Data Flow

```
Research Papers/Sources
    ↓ [Manual Curation + MCP Integration]
Raw Markdown/JSON
    ↓ [Data Scripts: Validation, Normalization, Enhancement]
Processed JSON (techniques.json, technique_categories.json, patterns.json)
    ↓ [Astro Build Process]
Static HTML/CSS/JS with React Islands
    ↓ [Git Push]
GitHub Pages (Live Site)
    ↓ [Optional]
RAG Server (AI Query Interface)
```

## API Surface

### Public Interfaces

This is a static website project with data structures rather than runtime APIs. The public interfaces are the data schemas and file formats.

#### Data Schema: Technique

The core data structure representing a prompt engineering technique:

- **Structure**:
  - `id` (string): Unique identifier (kebab-case)
  - `name` (string): Human-readable technique name
  - `description` (string): Comprehensive explanation of the technique
  - `example` (string): Concrete usage example
  - `sources` (array): Citations to research papers or references
  - `useCase` (string): Practical applications and scenarios
  - `tips` (string, optional): Best practices and recommendations
  - `commonMistakes` (string, optional): Pitfalls to avoid
  - `relatedTechniques` (array): IDs of related techniques
- **Location**: `data/processed/techniques.json`
- **Format**: JSON array of technique objects

#### Data Schema: Category

Organizational structure for grouping related techniques:

- **Structure**:
  - `id` (string): Category identifier
  - `name` (string): Category display name
  - `description` (string): Category purpose and scope
  - `techniques` (array): List of technique IDs in this category
- **Location**: `data/processed/technique_categories.json`
- **Format**: JSON object with categories array

#### Data Schema: Pattern

Advanced workflow patterns for multi-agent systems:

- **Structure**:
  - `id` (string): Pattern identifier
  - `name` (string): Pattern name
  - `description` (string): Pattern explanation
  - `implementation` (object): Implementation details
  - `examples` (array): Use case examples
- **Location**: `data/processed/patterns.json`
- **Format**: JSON array of pattern objects

### Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | string | `development` | Build environment (production/development) |
| `SITE_BASE` | string | `/mnehmos.prompts.research/` | Base path for GitHub Pages deployment |
| None required | - | - | Static site with no runtime configuration needed |

## Usage Examples

### Basic Usage

```typescript
// Loading and displaying technique data in an Astro component
import techniques from '@data/processed/techniques.json';
import categories from '@data/processed/technique_categories.json';

// Find a specific technique
const chainOfThought = techniques.find(t => t.id === 'chain-of-thought');

// Get all techniques in a category
const reasoningCategory = categories.categories.find(c => c.id === 'reasoning-frameworks');
const reasoningTechniques = techniques.filter(t =>
  reasoningCategory.techniques.includes(t.id)
);

// Display technique information
console.log(chainOfThought.name); // "Chain of Thought"
console.log(chainOfThought.description);
console.log(chainOfThought.example);
```

### Advanced Patterns

```javascript
// Validating data integrity using the validation script
// From scripts/data-validation.js
class TaxonomyValidator {
  validateTechnique(technique) {
    const requiredFields = ['id', 'name', 'description', 'sources'];
    const missing = requiredFields.filter(field => !technique[field]);

    if (missing.length > 0) {
      this.errors.push(`Technique ${technique.id} missing: ${missing.join(', ')}`);
    }

    // Validate related techniques exist
    if (technique.relatedTechniques) {
      technique.relatedTechniques.forEach(relatedId => {
        if (!this.techniques.find(t => t.id === relatedId)) {
          this.errors.push(`Invalid related technique: ${relatedId}`);
        }
      });
    }
  }
}

// Usage
const validator = new TaxonomyValidator();
validator.loadAndValidate('data/processed/techniques.json');
validator.printReport();
```

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| astro | ^4.16.17 | Static site generation framework |
| @astrojs/react | ^3.6.2 | React integration for Astro |
| @astrojs/tailwind | ^5.1.2 | Tailwind CSS integration |
| react | ^18.3.1 | UI component library |
| react-dom | ^18.3.1 | React DOM rendering |
| d3 | ^7.9.0 | Data visualization library for network graphs |
| clsx | ^2.1.1 | Utility for conditional CSS classes |
| tailwind-merge | ^2.5.4 | Merge Tailwind CSS classes intelligently |
| lucide-react | ^0.454.0 | Icon library |
| typescript | ^5.6.3 | Type safety and tooling |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @playwright/test | ^1.48.2 | End-to-end testing framework |
| @axe-core/playwright | ^4.8.0 | Accessibility testing |
| vitest | ^2.1.4 | Unit testing framework |
| @vitest/ui | ^2.1.4 | Vitest UI dashboard |
| @testing-library/react | ^16.0.1 | React component testing utilities |
| @testing-library/jest-dom | ^6.9.1 | Custom Jest matchers for DOM |
| @types/d3 | ^7.4.3 | TypeScript definitions for D3 |
| @types/react | ^18.3.12 | TypeScript definitions for React |
| @types/react-dom | ^18.3.1 | TypeScript definitions for React DOM |
| @vitejs/plugin-react | ^4.7.0 | Vite plugin for React |
| jsdom | ^25.0.1 | DOM implementation for testing |
| tailwindcss | ^3.4.14 | CSS framework |

## Integration Points

### Works With

| Project | Integration Type | Description |
|---------|-----------------|-------------|
| mnehmos.index-foundry.mcp | Extension | RAG server built using Index Foundry for AI-powered querying |
| mnehmos.roo.code | Peer | Uses Boomerang coordination pattern for task management |
| mnehmos.multi-agent.framework | Conceptual | Implements workflow patterns documented in this research |

### External Services

| Service | Purpose | Required |
|---------|---------|----------|
| GitHub Pages | Static site hosting | Yes (for deployment) |
| GitHub Actions | CI/CD automation | No (can deploy manually) |
| OpenAI API | RAG server embeddings | No (only for RAG features) |

## Development Guide

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git for version control
- Modern web browser for testing

### Setup

```bash
# Clone the repository
git clone https://github.com/Mnehmos/mnehmos.prompts.research
cd mnehmos.prompts.research

# Install dependencies
npm install

# Validate data integrity
node scripts/data-validation.js

# Start development server
npm run dev
```

### Running Locally

```bash
# Development mode with hot reload
npm run dev
# Site runs at http://localhost:4321

# Type checking
npm run check

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Building

```bash
# Build for production (includes type checking)
npm run build

# Output location
dist/

# The build process:
# 1. Runs astro check for type validation
# 2. Generates static HTML/CSS/JS
# 3. Optimizes assets and bundles
# 4. Creates dist/ directory ready for deployment
```

## Maintenance Notes

### Known Issues

1. **Astro migration incomplete**: The project is transitioning from a pure HTML/CSS/JS site to Astro. Some legacy HTML files in `reports/` directory are not yet migrated to Astro components.

2. **RAG server environment-dependent**: The RAG server requires OpenAI API keys and specific environment configuration, making it unsuitable for all deployment environments.

3. **Data synchronization complexity**: Multiple JSON files (techniques.json in multiple locations) can lead to sync issues if not carefully managed through validation scripts.

### Future Considerations

1. **Complete Astro migration**: Migrate all legacy HTML reports to Astro components for unified build process
2. **Automated research integration**: Implement MCP-based automation for monthly research updates
3. **Enhanced search**: Add fuzzy search and semantic search capabilities
4. **Community contributions**: Establish workflow for accepting community-submitted techniques
5. **Multi-language support**: Internationalize content for broader accessibility
6. **API development**: Create REST API for programmatic access to technique data
7. **Mobile app**: Develop companion mobile application for on-the-go reference

### Code Quality

| Metric | Status |
|--------|--------|
| Tests | Partial - E2E tests with Playwright, unit tests with Vitest |
| Linting | ESLint (inherited from Astro) |
| Type Safety | TypeScript strict mode enabled |
| Documentation | Comprehensive - README, design docs, ADRs, inline JSDoc |

---

## Appendix: File Structure

```
mnehmos.prompts.research/
├── data/
│   ├── processed/               # Primary data store
│   │   ├── techniques.json      # 180+ technique definitions
│   │   ├── technique_categories.json  # Category organization
│   │   └── patterns.json        # Workflow patterns
│   └── raw/                     # Original source data
│       └── reddit/              # Archived Reddit post content
├── design/                      # Architecture documentation
│   ├── ARCHITECTURE_SUMMARY.md  # System architecture overview
│   ├── SYSTEM_ARCHITECTURE.md   # Detailed C4 architecture
│   ├── ORCHESTRATOR_AGENT_PROMPT_SPEC.md  # AI agent specification
│   └── ADR-*.md                 # Architecture decision records
├── scripts/                     # Data processing utilities
│   ├── data-validation.js       # Validate data integrity
│   ├── data-synchronizer.js     # Sync data across files
│   ├── metadata-enhancer.js     # Enrich technique metadata
│   └── research-integration.js  # Integrate new research
├── rag-server/                  # AI query server
│   ├── data/                    # RAG embeddings and chunks
│   ├── frontend/                # Query interface
│   └── package.json             # Server dependencies
├── reports/                     # Legacy HTML visualizations
│   ├── taxonomy-overview.html   # Interactive technique browser
│   └── technique-relationships.html  # Network visualization
├── src/                         # Astro source (migration in progress)
│   ├── components/              # React components
│   ├── content/                 # Content collections
│   └── lib/                     # Utility functions
├── tests/                       # Test suites
│   ├── unit/                    # Unit tests
│   └── e2e/                     # Playwright E2E tests
├── astro.config.mjs             # Astro configuration
├── package.json                 # Project dependencies and scripts
├── tailwind.config.mjs          # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Vitest testing configuration
├── playwright.config.ts         # Playwright E2E configuration
├── README.md                    # Project documentation
└── PROJECT_KNOWLEDGE.md         # This document

Key directories explained:
- data/processed/: Single source of truth for all technique data
- design/: Architectural documentation and decision records
- scripts/: Node.js utilities for data quality and automation
- rag-server/: Standalone AI-powered query server
- reports/: Legacy interactive HTML pages (being migrated)
- src/: New Astro-based site structure (migration target)
```

---

*Generated by Project Review Orchestrator | 2025-12-29*
*Source: https://github.com/Mnehmos/mnehmos.prompts.research*
