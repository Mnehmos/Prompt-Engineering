---
title: Pattern Schema Documentation
task_id: pattern_schema_001
date: 2025-11-04
status: FINAL
owner: Architect Mode
version: 1.0.0
---

# Pattern Schema Documentation

## Overview

The Pattern schema ([`data/processed/patterns.json`](../data/processed/patterns.json)) is designed to document workflow engineering patterns alongside the existing Technique schema. It provides a structured format for capturing design patterns, architectural patterns, and workflow coordination patterns used in AI agent systems.

## Schema Structure

### Root Object

```json
{
  "patterns": [],                    // Array of pattern objects
  "_schema_version": "1.0.0",       // Schema version for compatibility tracking
  "_schema_description": "...",      // Human-readable schema description
  "_last_updated": "YYYY-MM-DD"     // Last modification date
}
```

## Pattern Object Structure

### Core Identifiers

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier (format: `pattern_XXX`) |
| `name` | string | ✓ | Human-readable pattern name |
| `status` | enum | ✓ | Pattern maturity: `core`, `established`, or `emerging` |
| `category` | enum | ✓ | Pattern category: `orchestration`, `state_management`, `optimization`, or `coordination` |
| `abstraction_level` | enum | ✓ | Scope level: `system`, `component`, or `implementation` |

### Problem Domain (Required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `context` | string | ✓ | Problem domain and scope where pattern applies |
| `problem` | string | ✓ | Specific challenges the pattern addresses |
| `solution` | string | ✓ | High-level solution approach and key insights |

### Structure (Required)

```typescript
structure: {
  participants: string[],        // Components involved with role descriptions
  collaborations: string,        // How components interact
  implementation: string         // Technical implementation guidance
}
```

### Consequences (Required)

```typescript
consequences: {
  positive: string[],           // Benefits gained
  negative: string[],           // Tradeoffs accepted
  risks: string[]               // Potential pitfalls
}
```

### Relationships (Optional but Recommended)

```typescript
relationships: {
  related_patterns: string[],      // IDs of related patterns
  related_techniques: string[],    // IDs from techniques.json
  implements: string[],            // Higher-level patterns this implements
  implemented_by: string[]         // Lower-level patterns that implement this
}
```

### Implementation Guide (Required)

```typescript
implementation_guide: {
  current_state: string,           // Starting point before pattern
  target_state: string,            // Desired end state
  steps: string[],                 // Sequential implementation steps
  immediate_actions: string[],     // Quick wins
  prerequisites: string[],         // Required capabilities
  mode_adaptations: {              // Framework-specific guidance
    roo: string,
    kilo: string,
    general: string
  }
}
```

### Examples (Optional but Recommended)

```typescript
examples: Array<{
  name: string,              // Example scenario name
  description: string,       // Concrete example
  code_snippet?: string,     // Optional code
  outcome: string           // Result achieved
}>
```

### Validation (Optional but Recommended)

```typescript
validation: {
  success_criteria: string[],      // Measurable success indicators
  anti_patterns: string[],         // Common mistakes to avoid
  testing_strategy: string         // How to verify implementation
}
```

### Metadata (Required)

```typescript
metadata: {
  added_date: string,              // YYYY-MM-DD
  last_updated: string,            // YYYY-MM-DD
  source: string,                  // Reference to research source
  source_url?: string,             // Optional URL
  maturity: enum,                  // "production" | "research" | "emerging"
  adoption_level: enum,            // "widespread" | "growing" | "experimental"
  community_resources?: string[],  // Optional external links
  tags?: string[]                  // Optional classification tags
}
```

## Complete Example Pattern

```json
{
  "id": "pattern_001",
  "name": "Boomerang Task Delegation",
  "status": "core",
  "category": "orchestration",
  "abstraction_level": "system",
  "context": "Multi-agent systems where complex tasks must be decomposed and delegated to specialized agents, then integrated back into a coherent whole.",
  "problem": "Orchestrating work across specialized agents while maintaining context, tracking progress, and ensuring results integrate correctly without losing the thread of execution.",
  "solution": "Tasks are delegated to specialist modes with clear boundaries and structured return formats. Results 'boomerang' back to the orchestrator with validation before proceeding to dependent tasks.",
  "structure": {
    "participants": [
      "Orchestrator Agent - Coordinates task decomposition and integration",
      "Specialist Agents - Execute domain-specific subtasks",
      "State Manager - Tracks task progress and dependencies",
      "Validation Layer - Ensures quality of boomerang returns"
    ],
    "collaborations": "Orchestrator analyzes requests, creates task maps with dependencies, delegates to specialists with full context, awaits structured returns, validates outputs, updates state, triggers dependent tasks.",
    "implementation": "Use JSON task maps to define subtasks, dependencies, and acceptance criteria. Each specialist receives complete context and autonomy within their domain. Returns include artifacts, status, and recommendations using standardized payload format."
  },
  "consequences": {
    "positive": [
      "Clear separation of concerns between coordination and execution",
      "Specialists gain full autonomy within their domain",
      "Automatic dependency management and progress tracking",
      "Easy to add new specialist capabilities",
      "Built-in validation and quality gates"
    ],
    "negative": [
      "Overhead of task decomposition and state management",
      "Potential latency from sequential subtask execution",
      "Requires well-defined interfaces between agents"
    ],
    "risks": [
      "State corruption if boomerang returns are malformed",
      "Task deadlock if dependencies are circular",
      "Context loss if delegation scope is too broad"
    ]
  },
  "relationships": {
    "related_patterns": [
      "pattern_005",
      "pattern_003"
    ],
    "related_techniques": [
      "boomerang-task-delegation",
      "mode-based-specialization",
      "task-boundary-enforcement"
    ],
    "implements": [],
    "implemented_by": [
      "pattern_002"
    ]
  },
  "implementation_guide": {
    "current_state": "Monolithic agent handling all tasks with mixed responsibilities and unclear boundaries",
    "target_state": "Orchestrated multi-agent system with clear delegation patterns and automatic integration",
    "steps": [
      "Define specialist agent roles and their domains of expertise",
      "Create task map schema with subtask structure and dependencies",
      "Implement boomerang return format with required fields",
      "Build state management system to track task progress",
      "Add validation layer for returned artifacts",
      "Create dependency resolution engine",
      "Implement error recovery procedures"
    ],
    "immediate_actions": [
      "Identify 2-3 frequently delegated task types",
      "Create boomerang return template JSON",
      "Add basic state tracking file (.roo/boomerang-state.json)"
    ],
    "prerequisites": [
      "Multiple agent modes or specialists available",
      "JSON-based communication capability",
      "File system access for state persistence"
    ],
    "mode_adaptations": {
      "roo": "Use .roo/boomerang-state.json for state, mode-specific prompts for specialists, tool-based delegation",
      "kilo": "Adapt state location to .kilo/, use Kilo's task queue system, leverage existing mode structure",
      "general": "Store state in accessible location, define clear agent interfaces, implement timeout handling"
    }
  },
  "examples": [
    {
      "name": "Multi-Sprint Project Integration",
      "description": "User requests integration of 6 months of research (43 items). Orchestrator creates task map with phases: Collection → Analysis → Integration → Deployment. Delegates Collection to Research Specialist, awaits boomerang with synthesis documents, validates completeness, then delegates Analysis to Content Strategist, and so on.",
      "code_snippet": "{\n  \"task_id\": \"research_integration_nov2025\",\n  \"origin_mode\": \"orchestrator\",\n  \"destination_mode\": \"Research Specialist\",\n  \"context\": {...},\n  \"artifacts_required\": [...]\n}",
      "outcome": "Successfully integrated 43 items across 3 sprints with full traceability and zero rework"
    }
  ],
  "validation": {
    "success_criteria": [
      "All delegated tasks complete successfully",
      "State remains consistent throughout execution",
      "Dependent tasks trigger automatically after prerequisites",
      "Zero information loss in boomerang returns",
      "Error recovery procedures work as designed"
    ],
    "anti_patterns": [
      "Orchestrator doing specialist work (violates separation of concerns)",
      "Proceeding without validating boomerang returns",
      "Creating overly granular tasks (increases overhead)",
      "Not defining clear acceptance criteria for subtasks"
    ],
    "testing_strategy": "Test with increasing complexity: single delegation → sequential chain → parallel tasks → complex dependency graph. Verify state consistency, error handling, and recovery procedures."
  },
  "metadata": {
    "added_date": "2025-11-04",
    "last_updated": "2025-11-04",
    "source": "Mnehmos (2024) - Building Structured AI Teams",
    "source_url": "https://github.com/vario-ai/prompt-taxonomy",
    "maturity": "production",
    "adoption_level": "growing",
    "community_resources": [
      "https://github.com/vario-ai/roo-cline",
      "https://community.example.com/boomerang-pattern"
    ],
    "tags": [
      "orchestration",
      "multi-agent",
      "workflow",
      "coordination",
      "delegation"
    ]
  }
}
```

## Validation Rules

### Required Fields
All patterns MUST include:
- Core identifiers: `id`, `name`, `status`, `category`, `abstraction_level`
- Problem domain: `context`, `problem`, `solution`
- `structure`: with `participants`, `collaborations`, `implementation`
- `consequences`: with `positive`, `negative`, `risks`
- `implementation_guide`: with all subfields
- `metadata`: with `added_date`, `source`, `maturity`

### Field Constraints

#### ID Format
- Pattern: `^pattern_\d{3}$`
- Example: `pattern_001`, `pattern_042`

#### Enumerations
- **status**: `core`, `established`, `emerging`
- **category**: `orchestration`, `state_management`, `optimization`, `coordination`
- **abstraction_level**: `system`, `component`, `implementation`
- **maturity**: `production`, `research`, `emerging`
- **adoption_level**: `widespread`, `growing`, `experimental`

#### Date Format
- Pattern: `YYYY-MM-DD`
- Example: `2025-11-04`

#### Array Constraints
- `participants`: minimum 2 items
- `positive`: minimum 1 item
- `negative`: minimum 1 item (even if "None identified")
- `risks`: minimum 1 item
- `steps`: minimum 3 items
- `immediate_actions`: minimum 1 item

### Relationship Validation
- All `related_patterns` IDs must reference existing patterns
- All `related_techniques` IDs must reference existing techniques in [`techniques.json`](../data/processed/techniques.json)
- No circular dependencies in `implements`/`implemented_by`

## Compatibility with Existing System

### Data Loader Integration
The pattern schema is designed to work alongside the existing [`data-loader.js`](../assets/js/data-loader.js) with minimal modifications:

1. **Parallel Structure**: Mirrors techniques.json format with `patterns` array
2. **Compatible Fields**: Uses same ID format and reference patterns
3. **Extensible**: Additional fields don't break existing functionality

### Future Frontend Enhancement
Patterns will be displayed with:
- Pattern cards similar to technique cards
- Category filtering (orchestration, state_management, etc.)
- Relationship visualization showing pattern hierarchy
- Implementation guide progressive disclosure

## Best Practices

### Writing Pattern Descriptions

**Context**: Be specific about when and where the pattern applies
- ❌ "Used in multi-agent systems"
- ✅ "Multi-agent systems where complex tasks must be decomposed and delegated to specialized agents"

**Problem**: Focus on the core challenge, not symptoms
- ❌ "Things aren't working well"
- ✅ "Orchestrating work across specialized agents while maintaining context and ensuring correct integration"

**Solution**: Provide key insight, not implementation details
- ❌ "Use this API and call these methods"
- ✅ "Tasks boomerang back to the orchestrator with structured returns, enabling validation before proceeding"

### Relationships
- Link to **patterns** that solve related problems or build on this pattern
- Link to **techniques** that implement or use this pattern
- Use `implements`/`implemented_by` to show pattern hierarchies

### Implementation Guides
- Start with "current state" so readers know if this applies to them
- Provide concrete "immediate actions" for quick value
- Include framework-specific adaptations (Roo, Kilo, general)

## Schema Evolution

**Version**: 1.0.0

**Future Enhancements** (potential):
- `performance_characteristics`: Latency, throughput, resource usage
- `compatibility_matrix`: Works with patterns X, conflicts with pattern Y
- `migration_guide`: From old pattern to this pattern
- `empirical_data`: Real-world measurements of effectiveness

## Related Documentation

- [Existing Technique Schema](../data/processed/techniques.json)
- [Orchestrator Agent Prompt](orchestrator_agent_prompt.md) - Lines 397-431 (Pattern Integration Template)
- [Content Prioritization Matrix](content_prioritization_matrix.json) - Lists all 7 patterns
- [System Architecture](SYSTEM_ARCHITECTURE.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-04  
**Maintained By**: Architect Mode