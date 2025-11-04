---
title: Pattern Schema Validation Rules
task_id: pattern_schema_001
date: 2025-11-04
status: FINAL
owner: Architect Mode
version: 1.0.0
---

# Pattern Schema Validation Rules

## Overview

This document defines the validation rules for [`patterns.json`](../data/processed/patterns.json) to ensure data quality and system compatibility.

## Data Loader Compatibility Analysis

### Current State
The existing [`data-loader.js`](../assets/js/data-loader.js) currently loads:
- `data/processed/techniques.json` 
- `data/processed/technique_categories.json`

### Patterns.json Compatibility

✅ **COMPATIBLE** - The patterns.json schema is designed for seamless future integration:

1. **Parallel Structure**: Mirrors techniques.json format
   ```javascript
   // techniques.json structure
   {
     "categories": [
       {
         "id": "category-id",
         "techniques": [...]
       }
     ]
   }
   
   // patterns.json structure (compatible)
   {
     "patterns": [...]
   }
   ```

2. **Same Loading Pattern**: Can use existing `TaxonomyDataUtils.loadDataUniversal()` approach
   ```javascript
   // Future enhancement (not implemented yet)
   const patternsData = await fetch('data/processed/patterns.json');
   this.patternsData = await patternsData.json();
   ```

3. **No Breaking Changes**: Empty patterns.json doesn't affect existing functionality since it's not loaded yet

4. **Ready for Integration**: When Sprint 2 adds pattern visualization, the data structure is ready

### Integration Checklist (Future Implementation)

When adding pattern support to data-loader.js:
- [ ] Add `this.patternsData = null` to constructor
- [ ] Load patterns.json in `loadData()` method
- [ ] Add pattern filtering to `getFilteredPatterns()` method
- [ ] Add pattern display methods (`renderPatternCard()`, etc.)
- [ ] Add pattern detail modal support
- [ ] Update search to include patterns

## Validation Rules

### Schema-Level Validation

#### 1. JSON Syntax
```bash
# Validate JSON syntax
jsonlint data/processed/patterns.json
```

**Rule**: Must be valid JSON
**Error**: "Unexpected token" or "Invalid JSON"
**Fix**: Repair JSON syntax errors

#### 2. Root Structure
```javascript
{
  "patterns": [],              // REQUIRED: Array
  "_schema_version": "1.0.0",  // REQUIRED: String
  "_schema_description": "",   // REQUIRED: String
  "_last_updated": "YYYY-MM-DD" // REQUIRED: String (date format)
}
```

**Rule**: Root object must contain `patterns` array
**Error**: "Missing required field: patterns"
**Fix**: Add `"patterns": []` to root object

### Pattern-Level Validation

#### 1. Required Fields Check

**All patterns MUST have these fields:**

```javascript
{
  // Core Identifiers (ALL REQUIRED)
  "id": "pattern_XXX",
  "name": "Pattern Name",
  "status": "core|established|emerging",
  "category": "orchestration|state_management|optimization|coordination",
  "abstraction_level": "system|component|implementation",
  
  // Problem Domain (ALL REQUIRED)
  "context": "string (min 50 chars)",
  "problem": "string (min 50 chars)",
  "solution": "string (min 50 chars)",
  
  // Structure (ALL REQUIRED)
  "structure": {
    "participants": ["array", "min 2 items"],
    "collaborations": "string (min 30 chars)",
    "implementation": "string (min 50 chars)"
  },
  
  // Consequences (ALL REQUIRED)
  "consequences": {
    "positive": ["array", "min 1 item"],
    "negative": ["array", "min 1 item"],
    "risks": ["array", "min 1 item"]
  },
  
  // Implementation Guide (ALL REQUIRED)
  "implementation_guide": {
    "current_state": "string (min 30 chars)",
    "target_state": "string (min 30 chars)",
    "steps": ["array", "min 3 items"],
    "immediate_actions": ["array", "min 1 item"],
    "prerequisites": ["array", "min 0 items"],
    "mode_adaptations": {
      "roo": "string (min 20 chars)",
      "kilo": "string (min 20 chars)",
      "general": "string (min 20 chars)"
    }
  },
  
  // Metadata (ALL REQUIRED)
  "metadata": {
    "added_date": "YYYY-MM-DD",
    "last_updated": "YYYY-MM-DD",
    "source": "string (min 10 chars)",
    "maturity": "production|research|emerging"
  }
}
```

#### 2. Field Format Validation

##### ID Format
```regex
^pattern_\d{3}$
```

**Valid Examples:**
- `pattern_001`
- `pattern_042`
- `pattern_999`

**Invalid Examples:**
- `pattern_1` (not 3 digits)
- `pattern_1000` (too many digits)
- `pattern-001` (wrong separator)
- `PATTERN_001` (wrong case)

##### Date Format
```regex
^\d{4}-\d{2}-\d{2}$
```

**Valid Examples:**
- `2025-11-04`
- `2024-01-15`

**Invalid Examples:**
- `11/04/2025` (wrong format)
- `2025-1-4` (missing leading zeros)
- `25-11-04` (2-digit year)

##### Enum Validation

**status**: Must be one of:
- `core` - Well-established, widely used patterns
- `established` - Proven patterns with growing adoption
- `emerging` - New patterns still being validated

**category**: Must be one of:
- `orchestration` - Coordination and delegation patterns
- `state_management` - Managing system state and context
- `optimization` - Performance and efficiency patterns
- `coordination` - Multi-agent interaction patterns

**abstraction_level**: Must be one of:
- `system` - Entire system architecture level
- `component` - Individual component or module level
- `implementation` - Concrete implementation details

**maturity**: Must be one of:
- `production` - Battle-tested in production systems
- `research` - Research-validated but not widespread
- `emerging` - Experimental or novel approaches

#### 3. Content Quality Rules

##### Minimum Length Requirements
- `context`: ≥ 50 characters
- `problem`: ≥ 50 characters
- `solution`: ≥ 50 characters
- `structure.collaborations`: ≥ 30 characters
- `structure.implementation`: ≥ 50 characters
- `implementation_guide.current_state`: ≥ 30 characters
- `implementation_guide.target_state`: ≥ 30 characters

**Rationale**: Ensures descriptions are substantive and useful

##### Array Minimum Items
- `structure.participants`: ≥ 2 items
- `consequences.positive`: ≥ 1 item
- `consequences.negative`: ≥ 1 item (use "None identified" if truly none)
- `consequences.risks`: ≥ 1 item
- `implementation_guide.steps`: ≥ 3 items
- `implementation_guide.immediate_actions`: ≥ 1 item

**Rationale**: Ensures completeness of pattern documentation

#### 4. Relationship Validation

##### Related Patterns
```javascript
"relationships": {
  "related_patterns": ["pattern_002", "pattern_005"]
}
```

**Rules:**
- All IDs must reference existing patterns in the same file
- No self-references (can't reference own ID)
- No duplicate IDs in array

**Validation Query:**
```javascript
// Pseudo-code for validation
for each pattern in patterns:
  for each related_id in pattern.relationships.related_patterns:
    assert patterns.find(p => p.id === related_id) exists
    assert related_id !== pattern.id
```

##### Related Techniques
```javascript
"relationships": {
  "related_techniques": ["boomerang-task-delegation", "mode-based-specialization"]
}
```

**Rules:**
- All IDs must reference existing techniques in [`techniques.json`](../data/processed/techniques.json)
- No duplicate IDs in array

##### Hierarchical Relationships
```javascript
"relationships": {
  "implements": ["pattern_005"],      // This pattern implements these higher-level patterns
  "implemented_by": ["pattern_002"]   // These lower-level patterns implement this one
}
```

**Rules:**
- No circular dependencies: If A implements B, then B cannot implement A
- All referenced IDs must exist

#### 5. Cross-File Consistency

**technique_categories.json Integration**

When "Workflow Engineering" category is added:
- Category ID should be: `workflow-engineering` 
- Patterns in this category should reference it consistently
- Category must exist before patterns reference it

## Validation Script Structure

### Recommended Validation Pipeline

```javascript
// scripts/validation/validate-patterns.js

class PatternValidator {
  validateSchema(patternsData) {
    // 1. Check root structure
    this.validateRootStructure(patternsData);
    
    // 2. Validate each pattern
    patternsData.patterns.forEach(pattern => {
      this.validateRequiredFields(pattern);
      this.validateFieldFormats(pattern);
      this.validateContentQuality(pattern);
      this.validateEnums(pattern);
    });
    
    // 3. Validate relationships
    this.validateRelationships(patternsData.patterns);
    
    // 4. Cross-file validation
    this.validateCrossReferences(patternsData);
    
    return this.validationReport;
  }
}
```

### Validation Levels

#### Level 1: Blocking Errors (Must Fix)
- JSON syntax errors
- Missing required fields
- Invalid enum values
- Broken references (non-existent IDs)
- Circular dependencies

#### Level 2: Warnings (Should Fix)
- Content too short (below minimum length)
- Missing optional but recommended fields
- Missing examples
- No validation criteria defined

#### Level 3: Suggestions (Nice to Have)
- Could add more related patterns
- Could provide more implementation examples
- Could add community resources
- Could expand anti-patterns section

## Example Validation Output

```markdown
# Pattern Validation Report

## Summary
- Total Patterns: 7
- Valid: 6
- Errors: 1
- Warnings: 3

## Errors (MUST FIX)
❌ pattern_003: Missing required field 'structure.implementation'
❌ pattern_005: Invalid status value 'stable' (must be: core|established|emerging)

## Warnings (SHOULD FIX)
⚠️  pattern_001: Content length below minimum (context: 45 chars, required: 50)
⚠️  pattern_004: No examples provided (recommended)
⚠️  pattern_007: Missing validation.success_criteria

## Suggestions
💡 pattern_002: Could add more related_techniques references
💡 pattern_006: Consider adding community_resources links

## Cross-Reference Check
✅ All related_patterns references valid
✅ All related_techniques references exist in techniques.json
✅ No circular dependencies detected
```

## Testing Checklist

### Manual Testing
- [ ] Open patterns.json in JSON validator
- [ ] Verify all required fields present for each pattern
- [ ] Check all date formats (YYYY-MM-DD)
- [ ] Verify all enum values are valid
- [ ] Check all IDs follow pattern_XXX format
- [ ] Verify no duplicate IDs

### Automated Testing
- [ ] Run JSON linter: `jsonlint data/processed/patterns.json`
- [ ] Run pattern validator script: `node scripts/validation/validate-patterns.js`
- [ ] Check relationship integrity: `node scripts/validation/check-relationships.js`
- [ ] Verify cross-file references: `node scripts/validation/cross-file-check.js`

### Integration Testing
- [ ] Empty patterns.json loads without errors
- [ ] Site builds successfully with patterns.json present
- [ ] No console errors when loading main taxonomy page
- [ ] techniques.json still loads correctly (no interference)

## Common Validation Errors

### Error: Duplicate Pattern ID
```
❌ pattern_001 appears 2 times in patterns array
```
**Fix**: Ensure each pattern has a unique ID

### Error: Invalid Related Technique Reference
```
❌ pattern_002 references non-existent technique: 'invalid-technique-id'
```
**Fix**: Verify technique IDs against techniques.json

### Error: Circular Dependency
```
❌ Circular dependency detected: pattern_001 → pattern_002 → pattern_001
```
**Fix**: Remove circular implements/implemented_by relationships

### Error: Missing Required Field
```
❌ pattern_003 missing required field: metadata.added_date
```
**Fix**: Add the missing field with appropriate value

### Warning: Content Too Short
```
⚠️  pattern_004 context field too short (30 chars, minimum 50)
```
**Fix**: Expand the description to meet minimum requirements

## Quality Metrics

### Pattern Quality Score
Each pattern is scored 0-100 based on:

- **Required Fields Complete** (40 points)
  - All required fields present: 40 points
  - Missing fields: -10 points each
  
- **Content Quality** (30 points)
  - All fields meet minimum length: 30 points
  - Short content: -5 points per field
  
- **Completeness** (20 points)
  - Examples provided: +5 points
  - Validation criteria defined: +5 points
  - Anti-patterns documented: +5 points
  - Community resources linked: +5 points
  
- **Relationships** (10 points)
  - Related patterns linked: +3 points
  - Related techniques linked: +3 points
  - Hierarchical relationships defined: +4 points

**Target Score**: ≥ 90 for production-ready patterns

## Maintenance

### Schema Updates
When updating the schema:
1. Update [`patterns.json`](../data/processed/patterns.json) `_schema_version`
2. Update this validation documentation
3. Update [`pattern_schema_documentation.md`](pattern_schema_documentation.md)
4. Run validation on all existing patterns
5. Update validation scripts if needed

### Adding New Validation Rules
1. Document the rule in this file
2. Add to validation script
3. Test against existing patterns
4. Set grace period for existing patterns if needed
5. Communicate changes to content creators

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-04  
**Maintained By**: Architect Mode