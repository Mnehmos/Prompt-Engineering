#!/usr/bin/env node
/**
 * Schema Normalizer - Converts research techniques to site format
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/processed/techniques.json');
const OUTPUT_FILE = path.join(__dirname, '../data/processed/techniques_normalized.json');

function normalizeSchema() {
  console.log('🔄 Starting schema normalization...\n');
  
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  
  data.categories.forEach(category => {
    category.techniques.forEach(technique => {
      // Convert applications array to useCase string if needed
      if (technique.applications && !technique.useCase) {
        technique.useCase = technique.applications.join('. ') + '.';
        delete technique.applications;
      }
      
      // Remove maturity field (not used in site format)
      if (technique.maturity) {
        delete technique.maturity;
      }
      
      // Remove color and icon from categories (only in category metadata)
      if (technique.color) delete technique.color;
      if (technique.icon) delete technique.icon;
      
      // Ensure relatedTechniques exists (empty array if not present)
      if (!technique.relatedTechniques) {
        technique.relatedTechniques = [];
      }
    });
    
    // Remove color and icon from category level if present
    delete category.color;
    delete category.icon;
  });
  
  // Write normalized data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✅ Schema normalized`);
  console.log(`   Output: ${OUTPUT_FILE}\n`);
}

normalizeSchema();