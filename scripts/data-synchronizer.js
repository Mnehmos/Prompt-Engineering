#!/usr/bin/env node

/**
 * Data Synchronization Tool for Prompt Engineering Taxonomy
 * 
 * This script synchronizes data across all embedded files and fixes
 * consistency issues identified by the validation tool.
 */

const fs = require('fs');
const path = require('path');

class TaxonomyDataSynchronizer {
    constructor() {
        this.masterData = null;
        this.syncLog = [];
    }

    /**
     * Load JSON file safely
     */
    loadJsonFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Failed to load ${filePath}:`, error.message);
            return null;
        }
    }

    /**
     * Save JSON file with pretty formatting
     */
    saveJsonFile(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Failed to save ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Create backup of files before modification
     */
    createBackup(filePath) {
        try {
            const backupPath = `${filePath}.backup.${new Date().toISOString().replace(/[:.]/g, '-')}`;
            fs.copyFileSync(filePath, backupPath);
            console.log(`💾 Created backup: ${backupPath}`);
            return true;
        } catch (error) {
            console.error(`Failed to create backup for ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Load master data from the main techniques.json file
     */
    loadMasterData() {
        console.log('📖 Loading master data from data/processed/techniques.json...');
        this.masterData = this.loadJsonFile('data/processed/techniques.json');
        
        if (!this.masterData || !this.masterData.categories) {
            throw new Error('Invalid master data structure');
        }

        console.log(`   ✓ Loaded ${this.masterData.categories.length} categories`);
        
        let totalTechniques = 0;
        this.masterData.categories.forEach(category => {
            if (category.techniques) {
                totalTechniques += category.techniques.length;
            }
        });
        
        console.log(`   ✓ Loaded ${totalTechniques} techniques\n`);
        return this.masterData;
    }

    /**
     * Fix the technique_categories.json file
     */
    fixTechniqueCategoriesFile() {
        console.log('🔧 Fixing data/processed/technique_categories.json...');
        
        const categoriesData = {
            categories: this.masterData.categories.map(category => ({
                id: category.id,
                name: category.name,
                description: category.description || `${category.name} techniques and patterns`,
                techniques: category.techniques ? category.techniques.map(t => t.id) : []
            }))
        };

        if (this.saveJsonFile('data/processed/technique_categories.json', categoriesData)) {
            console.log('   ✓ Fixed technique_categories.json structure');
            this.syncLog.push('Fixed technique_categories.json structure');
            return true;
        }
        
        return false;
    }

    /**
     * Synchronize embedded data in assets/js/data-loader.js
     */
    syncDataLoaderFile() {
        console.log('🔧 Synchronizing assets/js/data-loader.js...');
        
        try {
            let content = fs.readFileSync('assets/js/data-loader.js', 'utf8');
            
            // Find and replace the categoriesData section
            const categoriesDataRegex = /this\.categoriesData\s*=\s*{[\s\S]*?};/;
            
            const newCategoriesData = `this.categoriesData = {
            categories: [
${this.masterData.categories.map(cat => `                { id: "${cat.id}", name: "${cat.name}" }`).join(',\n')}
            ]
        };`;

            if (categoriesDataRegex.test(content)) {
                content = content.replace(categoriesDataRegex, newCategoriesData);
                fs.writeFileSync('assets/js/data-loader.js', content, 'utf8');
                console.log('   ✓ Synchronized categoriesData in data-loader.js');
                this.syncLog.push('Synchronized categoriesData in data-loader.js');
                return true;
            } else {
                console.log('   ⚠️  Could not find categoriesData section to replace');
            }
            
        } catch (error) {
            console.error(`   ❌ Error synchronizing data-loader.js:`, error.message);
        }
        
        return false;
    }

    /**
     * Validate data consistency after synchronization
     */
    validateConsistency() {
        console.log('🔍 Validating data consistency...');
        
        // Check technique_categories.json
        const categoriesData = this.loadJsonFile('data/processed/technique_categories.json');
        if (!categoriesData) {
            console.log('   ❌ Could not load technique_categories.json');
            return false;
        }

        let isConsistent = true;
        
        // Check that all categories match
        if (categoriesData.categories.length !== this.masterData.categories.length) {
            console.log('   ❌ Category count mismatch');
            isConsistent = false;
        } else {
            categoriesData.categories.forEach((cat, index) => {
                const masterCat = this.masterData.categories[index];
                if (cat.id !== masterCat.id || cat.name !== masterCat.name) {
                    console.log(`   ❌ Category mismatch: ${cat.id} vs ${masterCat.id}`);
                    isConsistent = false;
                }
            });
        }

        if (isConsistent) {
            console.log('   ✅ Data consistency validated');
        }
        
        return isConsistent;
    }

    /**
     * Generate synchronization report
     */
    generateReport() {
        console.log('\n📊 SYNCHRONIZATION REPORT:\n');
        
        if (this.syncLog.length === 0) {
            console.log('   No synchronization actions performed.\n');
            return;
        }

        this.syncLog.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action}`);
        });

        console.log(`\n   Total actions: ${this.syncLog.length}`);
        console.log('   Status: ✅ Synchronization complete\n');
    }

    /**
     * Run the complete synchronization process
     */
    async synchronize() {
        console.log('🔄 Starting Data Synchronization...\n');

        try {
            // Load master data
            this.loadMasterData();

            // Create backups
            const filesToBackup = [
                'data/processed/technique_categories.json',
                'assets/js/data-loader.js'
            ];

            filesToBackup.forEach(file => {
                if (fs.existsSync(file)) {
                    this.createBackup(file);
                }
            });

            console.log(''); // Add spacing

            // Perform synchronization
            let successCount = 0;

            if (this.fixTechniqueCategoriesFile()) {
                successCount++;
            }

            if (this.syncDataLoaderFile()) {
                successCount++;
            }

            // Validate consistency
            const isConsistent = this.validateConsistency();

            // Generate report
            this.generateReport();

            if (successCount > 0 && isConsistent) {
                console.log('✅ Synchronization completed successfully!');
                console.log('   Re-run validation to verify improvements.');
            } else {
                console.log('⚠️  Synchronization completed with issues.');
                console.log('   Some files may need manual review.');
            }

            return successCount;

        } catch (error) {
            console.error('❌ Synchronization failed:', error.message);
            return 0;
        }
    }
}

// Run synchronization if called directly
if (require.main === module) {
    const synchronizer = new TaxonomyDataSynchronizer();
    
    synchronizer.synchronize()
        .then((count) => {
            console.log(`\n✨ Synchronization process completed! Updated ${count} files.`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('Synchronization failed:', error);
            process.exit(1);
        });
}

module.exports = TaxonomyDataSynchronizer;