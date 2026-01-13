#!/usr/bin/env node
/**
 * ArXiv Research Integration Script
 * Merges new techniques from arXiv papers into the existing taxonomy
 */

const fs = require('fs');
const path = require('path');

// File paths
const ARXIV_DATA = path.join(__dirname, '../data/raw/arxiv-jan-2026.json');
const SITE_DATA = path.join(__dirname, '../data/processed/techniques.json');
const BACKUP_FILE = path.join(__dirname, '../data/processed/techniques_backup.json');

/**
 * Main integration function
 */
async function integrate() {
  console.log('🚀 Starting ArXiv Research Integration...\n');
  
  try {
    // Read source files
    console.log('📖 Reading source files...');
    const arxivData = JSON.parse(fs.readFileSync(ARXIV_DATA, 'utf8'));
    const siteData = JSON.parse(fs.readFileSync(SITE_DATA, 'utf8'));
    
    // Backup existing data
    console.log('💾 Creating backup...');
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(siteData, null, 2), 'utf8');
    
    const originalCount = countTechniques(siteData);
    console.log(`✓ Existing techniques: ${originalCount}`);
    console.log(`✓ New techniques from arXiv: ${arxivData.metadata.techniquesExtracted}\n`);
    
    // Merge techniques by category
    console.log('🔄 Merging techniques by category...');
    
    for (const arxivCategory of arxivData.categories) {
      // Find matching category in site data
      let siteCategory = siteData.categories.find(c => c.id === arxivCategory.id);
      
      if (siteCategory) {
        console.log(`  → Updating category: ${arxivCategory.name}`);
        // Add new techniques to existing category
        for (const technique of arxivCategory.techniques) {
          // Check for duplicates
          const exists = siteCategory.techniques.some(t => t.id === technique.id);
          if (!exists) {
            siteCategory.techniques.push(technique);
            console.log(`    + Added: ${technique.name}`);
          } else {
            console.log(`    ~ Skipped (exists): ${technique.name}`);
          }
        }
      } else {
        console.log(`  → Adding new category: ${arxivCategory.name}`);
        // Add entire new category
        siteData.categories.push(arxivCategory);
      }
    }
    
    // Update metadata
    const newCount = countTechniques(siteData);
    siteData.version = incrementVersion(siteData.version);
    siteData.lastUpdated = new Date().toISOString().split('T')[0];
    siteData.metadata.totalEnhanced = newCount;
    
    // Write updated data
    console.log('\n💾 Writing updated taxonomy...');
    fs.writeFileSync(SITE_DATA, JSON.stringify(siteData, null, 2), 'utf8');
    
    console.log('\n✅ Integration complete!\n');
    
    // Summary
    console.log('📊 Summary:');
    console.log(`  - Original techniques: ${originalCount}`);
    console.log(`  - Added techniques: ${newCount - originalCount}`);
    console.log(`  - New total: ${newCount}`);
    console.log(`  - Version: ${siteData.version}`);
    console.log(`  - Source: ${arxivData.source}`);
    
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

/**
 * Increment version number
 */
function incrementVersion(version) {
  const parts = version.split('.');
  parts[1] = String(parseInt(parts[1]) + 1);
  return parts.join('.');
}

// Run integration
integrate();
