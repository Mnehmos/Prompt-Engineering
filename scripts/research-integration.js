#!/usr/bin/env node
/**
 * Research Data Integration Script
 * Merges research taxonomy v2.0 with existing site techniques
 */

const fs = require('fs');
const path = require('path');

// File paths
const RESEARCH_DATA = 'C:\\Users\\mnehm\\Documents\\GitHub\\vario-ai\\projects\\research\\jun-nov-2025\\final\\data.json';
const SITE_DATA = path.join(__dirname, '../data/processed/techniques.json');
const OUTPUT_FILE = path.join(__dirname, '../data/processed/techniques_enhanced.json');

/**
 * Main integration function
 */
async function integrate() {
  console.log('🚀 Starting Research Data Integration...\n');
  
  try {
    // Read source files
    console.log('📖 Reading source files...');
    const researchData = JSON.parse(fs.readFileSync(RESEARCH_DATA, 'utf8'));
    const siteData = JSON.parse(fs.readFileSync(SITE_DATA, 'utf8'));
    
    console.log(`✓ Research data: ${researchData.statistics.totalTechniques} techniques`);
    console.log(`✓ Site data: ${countTechniques(siteData)} techniques\n`);
    
    // Create enhanced structure
    console.log('🔄 Merging datasets...');
    const enhanced = {
      version: '2.1',
      lastUpdated: new Date().toISOString().split('T')[0],
      metadata: {
        originalSiteTechniques: countTechniques(siteData),
        researchTechniques: researchData.statistics.totalTechniques,
        totalEnhanced: 0
      },
      categories: []
    };
    
    // Add research categories (new taxonomy)
    enhanced.categories.push(...researchData.categories);
    
    // Add existing site categories
    enhanced.categories.push(...siteData.categories);
    
    // Calculate totals
    enhanced.metadata.totalEnhanced = countTechniques(enhanced);
    
    console.log(`✓ Merged ${enhanced.categories.length} categories`);
    console.log(`✓ Total techniques: ${enhanced.metadata.totalEnhanced}\n`);
    
    // Write output
    console.log('💾 Writing enhanced data...');
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(enhanced, null, 2),
      'utf8'
    );
    
    console.log(`✓ Enhanced data written to: ${OUTPUT_FILE}`);
    console.log('\n✅ Integration complete!\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`- Original site techniques: ${siteData.categories.length} categories`);
    console.log(`- Research techniques: ${researchData.categories.length} categories`);
    console.log(`- Enhanced total: ${enhanced.categories.length} categories`);
    console.log(`- Total techniques: ${enhanced.metadata.totalEnhanced}`);
    
  } catch (error) {
    console.error('❌ Error during integration:', error.message);
    process.exit(1);
  }
}

/**
 * Count total techniques across all categories
 */
function countTechniques(data) {
  return data.categories.reduce((total, cat) => {
    return total + (cat.techniques?.length || 0);
  }, 0);
}

// Run integration
integrate();