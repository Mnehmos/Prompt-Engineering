# ADR-001: Research Data Integration Implementation

## Status
**ACCEPTED** - Ready for immediate implementation

## Context
We have 74 research entries from the v2.0 taxonomy research phase that need to be integrated into the live Prompt Engineering Taxonomy website. The site currently displays 133 techniques. The research integration script exists but has never been executed.

## Decision
Implement research data integration through the following concrete steps:

### Phase 1: Execute Research Integration Script
**File**: `scripts/research-integration.js`
**Action**: Run the script to merge research data
**Expected Output**: `data/processed/techniques_enhanced.json`

### Phase 2: Update Site Data Loader
**File**: `assets/js/data-loader.js`
**Current**: Loads `data/processed/techniques.json`
**Change**: Update to load `techniques_enhanced.json`
**Impact**: Site will display merged taxonomy

### Phase 3: Update Statistics
**Files**: `index.html`, `reports/taxonomy-overview.html`
**Current**: Show "133 techniques"
**Change**: Update stat cards with actual merged count
**Source**: `enhanced.metadata.totalEnhanced` from merged data

### Phase 4: Version Management
**File**: `data/processed/techniques.json`
**Action**: Backup original as `techniques_v1.json`
**Then**: Rename `techniques_enhanced.json` to `techniques.json`
**Result**: Seamless migration maintaining existing file references

## Implementation Order
1. Backup current `techniques.json` → `techniques_v1.json`
2. Execute `node scripts/research-integration.js`
3. Verify `techniques_enhanced.json` created successfully
4. Test load in browser (local)
5. Update statistics in HTML files
6. Commit changes
7. Deploy to GitHub Pages

## Consequences

### Positive
- Research is finally integrated into live site
- No more circular planning
- Clear rollback path via v1 backup
- Script does the heavy lifting

### Negative
- Need to verify no duplicate techniques
- Statistics may need manual verification
- May need to rebuild related pages

### Risks
- Script may encounter parsing errors
- Research data path may be incorrect
- Merged data may break existing visualizations

## Validation Criteria
- [ ] Script executes without errors
- [ ] Enhanced JSON file created
- [ ] Site loads without console errors
- [ ] Technique count updated correctly
- [ ] All categories still render
- [ ] Search/filter still works

## Next Actions
**SWITCH TO CODE MODE IMMEDIATELY**
- Run research integration script
- Verify output
- Update site files
- Test functionality
- Deploy changes

---

**END OF ARCHITECTURE PHASE**
**IMPLEMENTATION BEGINS NOW**