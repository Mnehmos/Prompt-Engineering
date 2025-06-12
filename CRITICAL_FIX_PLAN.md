# CRITICAL UI FIX: Data Consolidation Plan

## IMMEDIATE ACTIONS REQUIRED

### 1. **PRIMARY FIX: Update embedded-taxonomy-data.js**
- **Source**: `data/processed/techniques.json` (92 techniques)
- **Target**: `assets/js/embedded-taxonomy-data.js` (currently 24 techniques)
- **Action**: Replace partial data with complete 92-technique dataset

### 2. **CONSOLIDATE REDUNDANT FILES**

#### Files to UPDATE:
- ✅ `assets/js/embedded-taxonomy-data.js` → Use complete data from techniques.json
- ✅ `assets/js/network-visualization.js` → Remove embedded data, use window.embeddedTaxonomyData
- ✅ `js/prompt-builder.js` → Remove embedded data, use window.embeddedTaxonomyData

#### Files to KEEP:
- ✅ `data/processed/techniques.json` → Master source of truth (92 techniques)
- ✅ `data/processed/technique_categories.json` → Category metadata
- ✅ `assets/js/data-loader.js` → Loader logic (but fix embedded fallback)

#### Files to REMOVE (Redundant):
- ❌ `PromptEngineeringTaxonomy/` directory → Old duplicate
- ❌ Multiple `.backup` files → Cleanup

### 3. **TECHNIQUE COUNT VERIFICATION**

#### Expected Results After Fix:
- **Main site**: 92 technique cards/modals
- **Network visualization**: 92 nodes
- **Prompt builder**: 92 selectable techniques
- **Search/filter**: All 92 techniques discoverable

## TECHNICAL IMPLEMENTATION

### Step 1: Extract Complete Data
```javascript
// From data/processed/techniques.json (92 techniques)
// Categories: basic-concepts(10), reasoning-frameworks(13), agent-tool-use(12), 
// self-improvement(10), retrieval-augmentation(8), prompt-optimization(11),
// multimodal-techniques(11), specialized-application(12), multi-agent-systems(5)
```

### Step 2: Replace Embedded Data
- Update `window.embeddedTaxonomyData` in embedded-taxonomy-data.js
- Remove duplicate embedded data from other files
- Use single source of truth pattern

### Step 3: Update Data Loaders
- Make all JS files reference `window.embeddedTaxonomyData`
- Remove redundant embedded data blocks
- Ensure consistent technique IDs and structure

## VALIDATION TESTS

After implementation:
1. ✅ Count technique cards on main page = 92
2. ✅ Count network visualization nodes = 92  
3. ✅ Count prompt builder selections = 92
4. ✅ Search returns all expected techniques
5. ✅ All modals display complete technique data
6. ✅ No console errors during load

## FILES CHANGED SUMMARY
- **Modified**: 3 files (embedded-taxonomy-data.js, network-visualization.js, prompt-builder.js)
- **Removed**: ~10 redundant/backup files
- **Result**: Single source of truth, 92 techniques live across all UI components