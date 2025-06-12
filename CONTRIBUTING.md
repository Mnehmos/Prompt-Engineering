# Contributing to the Prompt Engineering Taxonomy

Thank you for your interest in contributing to the Prompt Engineering Taxonomy! This guide will help you understand our standards, processes, and best practices for maintaining high-quality, consistent data across the taxonomy.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Data Quality Standards](#data-quality-standards)
- [Adding New Techniques](#adding-new-techniques)
- [Enhancing Existing Techniques](#enhancing-existing-techniques)
- [Data Validation and Quality Assurance](#data-validation-and-quality-assurance)
- [File Structure and Synchronization](#file-structure-and-synchronization)
- [Best Practices](#best-practices)
- [Review Process](#review-process)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Basic understanding of JSON and JavaScript
- Familiarity with prompt engineering concepts

### Initial Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies (if any): `npm install`
4. Run validation to understand current status: `node scripts/data-validation.js`

## 📊 Data Quality Standards

### Required Fields for All Techniques

Every technique MUST include:

- **`id`**: Unique identifier in kebab-case (e.g., `chain-of-thought`)
- **`name`**: Human-readable name (e.g., "Chain-of-Thought (CoT) Prompting")
- **`description`**: Clear, concise explanation (minimum 20 characters)
- **`sources`**: Array of academic papers, articles, or authoritative references

### Recommended Fields

For complete techniques, include:

- **`useCase`**: When and why to use this technique
- **`example`**: Practical example demonstrating the technique
- **`relatedTechniques`**: Array of related technique IDs

### Quality Enhancement Fields

For high-priority techniques, add:

- **`tips`**: Best practices and implementation guidance
- **`commonMistakes`**: What to avoid when using this technique
- **`aliases`**: Alternative names or abbreviations

### Data Quality Requirements

1. **Consistency**: Maintain consistent naming, formatting, and structure
2. **Accuracy**: Ensure all information is factually correct and up-to-date
3. **Completeness**: Provide comprehensive metadata for core techniques
4. **Clarity**: Write descriptions that are accessible to both beginners and experts
5. **Sources**: Always cite authoritative sources for technique information

## ➕ Adding New Techniques

### Step 1: Research and Documentation

1. **Verify Uniqueness**: Check that the technique doesn't already exist
2. **Gather Sources**: Collect at least 2-3 authoritative references
3. **Understand Context**: Determine the appropriate category
4. **Draft Content**: Prepare all required and recommended fields

### Step 2: Choose the Correct Category

Current categories:
- **Basic Concepts**: Fundamental prompting structures
- **Reasoning Frameworks**: Techniques for explicit reasoning
- **Multi-Agent Systems**: Advanced coordination techniques

### Step 3: Add to Master Data File

Add your technique to `data/processed/techniques.json`:

```json
{
  "id": "your-technique-id",
  "name": "Your Technique Name",
  "description": "Clear description of what this technique does and how it works.",
  "sources": ["Author et al. (Year)", "Another Source"],
  "relatedTechniques": ["related-technique-1", "related-technique-2"],
  "useCase": "When and why to use this technique.",
  "example": "Practical example showing the technique in action.",
  "tips": "Best practices for implementation.",
  "commonMistakes": "What to avoid when using this technique."
}
```

### Step 4: Validate and Synchronize

1. Run validation: `node scripts/data-validation.js`
2. Run synchronization: `node scripts/data-synchronizer.js`
3. Verify no errors or warnings for your new technique

## ✨ Enhancing Existing Techniques

### Priority Enhancement Order

Focus on these techniques first (HIGH priority):
1. Chain-of-Thought (CoT) Prompting
2. Zero-Shot Learning/Prompting  
3. Few-Shot Learning/Prompting
4. Basic Prompting
5. In-Context Learning (ICL)
6. Tree-of-Thoughts (ToT)
7. Self-Consistency
8. ReAct (Reason + Act)
9. Self-Correction techniques
10. RAG (Retrieval Augmented Generation)

### Enhancement Process

1. **Identify Missing Fields**: Use validation output to see what's missing
2. **Research Best Practices**: Find authoritative guidance for the technique
3. **Draft Content**: Write clear, actionable content for missing fields
4. **Add to Master File**: Update `data/processed/techniques.json`
5. **Validate**: Run validation to ensure quality

### Example Enhancement

Before:
```json
{
  "id": "chain-of-thought",
  "name": "Chain-of-Thought (CoT) Prompting",
  "description": "Eliciting step-by-step reasoning before the final answer.",
  "sources": ["Wei et al."]
}
```

After:
```json
{
  "id": "chain-of-thought",
  "name": "Chain-of-Thought (CoT) Prompting", 
  "description": "Eliciting step-by-step reasoning before the final answer.",
  "sources": ["Wei et al."],
  "useCase": "Complex reasoning tasks, math problems, logical deductions, and multi-step decision processes.",
  "tips": "Provide clear, detailed reasoning steps in examples. Break down complex problems into smaller, logical steps.",
  "commonMistakes": "Skipping intermediate steps. Using overly complex examples that confuse the model.",
  "example": "Question: Roger has 5 tennis balls...\n\nLet's think about this step-by-step:\n1. Roger starts with 5 tennis balls\n..."
}
```

## 🔍 Data Validation and Quality Assurance

### Available Tools

1. **Validation Tool**: `node scripts/data-validation.js`
   - Checks for missing required fields
   - Identifies inconsistencies across files
   - Reports metadata completeness statistics

2. **Metadata Enhancer**: `node scripts/metadata-enhancer.js`
   - Automatically adds missing metadata for priority techniques
   - Creates backups before modifications

3. **Data Synchronizer**: `node scripts/data-synchronizer.js`
   - Synchronizes data across all embedded files
   - Fixes structural inconsistencies

### Quality Assurance Workflow

1. **Before Making Changes**:
   ```bash
   node scripts/data-validation.js
   ```

2. **After Adding/Modifying Techniques**:
   ```bash
   node scripts/data-validation.js
   node scripts/data-synchronizer.js
   node scripts/data-validation.js  # Verify improvements
   ```

3. **Batch Enhancement** (for multiple techniques):
   ```bash
   node scripts/metadata-enhancer.js
   node scripts/data-synchronizer.js
   node scripts/data-validation.js
   ```

## 📁 File Structure and Synchronization

### Primary Data Files

- **`data/processed/techniques.json`**: Master data file (source of truth)
- **`data/processed/technique_categories.json`**: Category definitions
- **`js/prompt-builder.js`**: Embedded data for prompt builder
- **`assets/js/data-loader.js`**: Embedded data for main interface

### Synchronization Process

The master file (`data/processed/techniques.json`) is the source of truth. All other files are synchronized from it:

1. Make changes only to the master file
2. Run the synchronizer to update all embedded files
3. Validate that all files are consistent

### Backup Strategy

All modification tools automatically create timestamped backups:
- Format: `filename.backup.YYYY-MM-DDTHH-mm-ss-sssZ`
- Stored in the same directory as the original file
- Safe to delete old backups after verification

## 🎯 Best Practices

### Writing Guidelines

1. **Descriptions**: Be concise but comprehensive. Aim for 50-200 words.
2. **Use Cases**: Focus on practical applications and when to choose this technique over others.
3. **Examples**: Use realistic, relatable scenarios that clearly demonstrate the technique.
4. **Tips**: Provide actionable guidance that helps users succeed.
5. **Common Mistakes**: Include real pitfalls that users encounter.

### Technical Guidelines

1. **IDs**: Use kebab-case, be descriptive but concise
2. **Names**: Include common abbreviations in parentheses
3. **Sources**: Use consistent citation format: "Author et al. (Year)"
4. **Related Techniques**: Link to genuinely related concepts

### Quality Metrics

Aim for these completion rates:
- **Required fields**: 100%
- **Use cases**: 80%+
- **Examples**: 80%+
- **Tips**: 60%+ (focus on high-priority techniques)
- **Common mistakes**: 60%+ (focus on high-priority techniques)

## 📋 Review Process

### Self-Review Checklist

Before submitting:

- [ ] All required fields present and complete
- [ ] Description is clear and accurate (20+ characters)
- [ ] Sources are authoritative and properly cited
- [ ] Use case explains when/why to use the technique
- [ ] Example is practical and demonstrates the technique
- [ ] Tips provide actionable guidance
- [ ] Common mistakes address real pitfalls
- [ ] Related techniques are genuinely related
- [ ] ID follows kebab-case convention
- [ ] Validation passes without errors
- [ ] Files are synchronized

### Peer Review

1. **Technical Accuracy**: Verify technique descriptions and examples
2. **Completeness**: Check that all recommended fields are present
3. **Clarity**: Ensure content is accessible to the target audience
4. **Consistency**: Maintain consistent style and formatting
5. **Quality**: Assess overall contribution value

### Approval Criteria

Contributions will be approved if they:
- Meet all data quality standards
- Pass automated validation
- Provide clear value to users
- Follow established conventions
- Include proper documentation

## 🆘 Support and Questions

### Getting Help

1. **Documentation**: Check this contributing guide first
2. **Validation**: Run validation tools to identify issues
3. **Examples**: Look at existing high-quality techniques for reference
4. **Issues**: Open a GitHub issue for specific questions

### Common Issues

**Validation Errors**: Usually caused by missing required fields or formatting issues
**Synchronization Problems**: Run the synchronizer after making changes
**Category Questions**: Refer to category descriptions or ask for guidance

---

Thank you for contributing to the Prompt Engineering Taxonomy! Your efforts help create a valuable resource for the entire prompt engineering community. 🚀