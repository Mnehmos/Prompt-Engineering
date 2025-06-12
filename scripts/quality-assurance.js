#!/usr/bin/env node

/**
 * Quality Assurance Tool for Prompt Engineering Taxonomy
 * 
 * This script provides comprehensive quality checks, automated fixes,
 * and detailed reporting for maintaining data quality standards.
 */

const fs = require('fs');
const path = require('path');

class QualityAssuranceManager {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.stats = {
            totalTechniques: 0,
            completeTechniques: 0,
            errorsFound: 0,
            errorsFixed: 0,
            qualityScore: 0
        };
    }

    /**
     * Load and parse JSON file safely
     */
    loadJsonFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.addIssue('CRITICAL', `Failed to load ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Save JSON file with formatting
     */
    saveJsonFile(filePath, data) {
        try {
            const backup = `${filePath}.backup.${new Date().toISOString().replace(/[:.]/g, '-')}`;
            fs.copyFileSync(filePath, backup);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`💾 Saved ${filePath} (backup: ${backup})`);
            return true;
        } catch (error) {
            this.addIssue('HIGH', `Failed to save ${filePath}: ${error.message}`);
            return false;
        }
    }

    /**
     * Add issue to tracking
     */
    addIssue(severity, message) {
        this.issues.push({ severity, message, timestamp: new Date() });
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            this.stats.errorsFound++;
        }
    }

    /**
     * Add fix to tracking
     */
    addFix(description) {
        this.fixes.push({ description, timestamp: new Date() });
        this.stats.errorsFixed++;
    }

    /**
     * Check and fix technique_categories.json structure
     */
    fixTechniqueCategoriesStructure() {
        console.log('🔧 Checking technique_categories.json structure...');
        
        const masterData = this.loadJsonFile('data/processed/techniques.json');
        const categoriesFile = 'data/processed/technique_categories.json';
        
        if (!masterData || !masterData.categories) {
            this.addIssue('CRITICAL', 'Master data file is invalid');
            return false;
        }

        // Create proper categories structure
        const correctStructure = {
            categories: masterData.categories.map(category => ({
                id: category.id,
                name: category.name,
                description: category.description || `${category.name} techniques and approaches for prompt engineering`,
                techniqueCount: category.techniques ? category.techniques.length : 0,
                techniques: category.techniques ? category.techniques.map(t => t.id) : []
            }))
        };

        if (this.saveJsonFile(categoriesFile, correctStructure)) {
            this.addFix('Fixed technique_categories.json structure');
            return true;
        }

        return false;
    }

    /**
     * Fix assets/js/data-loader.js embedded categories
     */
    fixDataLoaderCategories() {
        console.log('🔧 Fixing data-loader.js embedded categories...');
        
        const masterData = this.loadJsonFile('data/processed/techniques.json');
        if (!masterData) return false;

        try {
            let content = fs.readFileSync('assets/js/data-loader.js', 'utf8');
            
            // Create proper categoriesData
            const categoriesData = `this.categoriesData = {
            categories: [
${masterData.categories.map(cat => 
    `                {
                    id: "${cat.id}",
                    name: "${cat.name}",
                    description: "${cat.description || cat.name + ' techniques and approaches'}",
                    sources: ["Generated from master data"]
                }`
).join(',\n')}
            ]
        };`;

            // Replace the categoriesData section
            const regex = /this\.categoriesData\s*=\s*{[\s\S]*?};/;
            
            if (regex.test(content)) {
                content = content.replace(regex, categoriesData);
                fs.writeFileSync('assets/js/data-loader.js', content, 'utf8');
                this.addFix('Fixed data-loader.js categoriesData');
                return true;
            } else {
                this.addIssue('HIGH', 'Could not find categoriesData section in data-loader.js');
            }
            
        } catch (error) {
            this.addIssue('HIGH', `Error fixing data-loader.js: ${error.message}`);
        }
        
        return false;
    }

    /**
     * Validate technique completeness
     */
    validateTechniqueCompleteness() {
        console.log('📊 Analyzing technique completeness...');
        
        const masterData = this.loadJsonFile('data/processed/techniques.json');
        if (!masterData) return;

        let complete = 0;
        let incomplete = 0;
        const incompleteList = [];

        masterData.categories.forEach(category => {
            if (category.techniques) {
                category.techniques.forEach(technique => {
                    this.stats.totalTechniques++;
                    
                    const requiredFields = ['id', 'name', 'description', 'sources'];
                    const recommendedFields = ['useCase', 'example'];
                    const qualityFields = ['tips', 'commonMistakes'];
                    
                    let score = 0;
                    let missing = [];
                    
                    // Check required fields
                    requiredFields.forEach(field => {
                        if (technique[field] && technique[field].length > 0) {
                            score += 25; // 100 points total for required
                        } else {
                            missing.push(field);
                        }
                    });
                    
                    // Check recommended fields
                    recommendedFields.forEach(field => {
                        if (technique[field] && technique[field].length > 0) {
                            score += 15; // 30 points for recommended
                        } else {
                            missing.push(field);
                        }
                    });
                    
                    // Check quality fields
                    qualityFields.forEach(field => {
                        if (technique[field] && technique[field].length > 0) {
                            score += 10; // 20 points for quality
                        } else {
                            missing.push(field);
                        }
                    });

                    if (score >= 100) {
                        complete++;
                    } else {
                        incomplete++;
                        if (missing.length > 0) {
                            incompleteList.push({
                                name: technique.name,
                                id: technique.id,
                                score: score,
                                missing: missing
                            });
                        }
                    }
                });
            }
        });

        this.stats.completeTechniques = complete;
        this.stats.qualityScore = this.stats.totalTechniques > 0 ? 
            Math.round((complete / this.stats.totalTechniques) * 100) : 0;

        console.log(`   ✓ ${complete} complete techniques`);
        console.log(`   ⚠️  ${incomplete} incomplete techniques`);
        console.log(`   📈 Quality Score: ${this.stats.qualityScore}%`);

        // Report top incomplete techniques
        if (incompleteList.length > 0) {
            console.log('\n🎯 TOP INCOMPLETE TECHNIQUES:');
            incompleteList
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .forEach((tech, i) => {
                    console.log(`   ${i + 1}. ${tech.name} (${tech.score}% complete)`);
                    console.log(`      Missing: ${tech.missing.join(', ')}`);
                });
        }
    }

    /**
     * Check for duplicate techniques across files
     */
    checkForDuplicates() {
        console.log('🔍 Checking for duplicate techniques...');
        
        const masterData = this.loadJsonFile('data/processed/techniques.json');
        if (!masterData) return;

        const seenIds = new Set();
        const seenNames = new Set();
        let duplicates = 0;

        masterData.categories.forEach(category => {
            if (category.techniques) {
                category.techniques.forEach(technique => {
                    if (seenIds.has(technique.id)) {
                        this.addIssue('HIGH', `Duplicate technique ID: ${technique.id}`);
                        duplicates++;
                    } else {
                        seenIds.add(technique.id);
                    }

                    if (seenNames.has(technique.name)) {
                        this.addIssue('MEDIUM', `Duplicate technique name: ${technique.name}`);
                    } else {
                        seenNames.add(technique.name);
                    }
                });
            }
        });

        if (duplicates === 0) {
            console.log('   ✅ No duplicate technique IDs found');
        } else {
            console.log(`   ⚠️  Found ${duplicates} duplicate technique IDs`);
        }
    }

    /**
     * Validate data consistency across files
     */
    validateDataConsistency() {
        console.log('🔄 Checking data consistency across files...');
        
        const files = [
            'data/processed/techniques.json',
            'data/processed/technique_categories.json',
            'js/prompt-builder.js'
        ];

        let inconsistencies = 0;
        
        // This is a simplified check - in practice, would do deeper validation
        files.forEach(file => {
            if (!fs.existsSync(file)) {
                this.addIssue('CRITICAL', `Missing file: ${file}`);
                inconsistencies++;
            }
        });

        if (inconsistencies === 0) {
            console.log('   ✅ All required files present');
        } else {
            console.log(`   ❌ Found ${inconsistencies} file issues`);
        }
    }

    /**
     * Generate comprehensive quality report
     */
    generateQualityReport() {
        console.log('\n📋 QUALITY ASSURANCE REPORT\n');
        
        // Summary Statistics
        console.log('📊 STATISTICS:');
        console.log(`   Total Techniques: ${this.stats.totalTechniques}`);
        console.log(`   Complete Techniques: ${this.stats.completeTechniques}`);
        console.log(`   Quality Score: ${this.stats.qualityScore}%`);
        console.log(`   Errors Found: ${this.stats.errorsFound}`);
        console.log(`   Errors Fixed: ${this.stats.errorsFixed}`);
        
        // Issues Summary
        if (this.issues.length > 0) {
            console.log('\n❗ ISSUES FOUND:');
            const critical = this.issues.filter(i => i.severity === 'CRITICAL').length;
            const high = this.issues.filter(i => i.severity === 'HIGH').length;
            const medium = this.issues.filter(i => i.severity === 'MEDIUM').length;
            
            if (critical > 0) console.log(`   🔴 Critical: ${critical}`);
            if (high > 0) console.log(`   🟠 High: ${high}`);
            if (medium > 0) console.log(`   🟡 Medium: ${medium}`);
            
            // Show first few issues
            console.log('\n   Top Issues:');
            this.issues.slice(0, 5).forEach((issue, i) => {
                console.log(`   ${i + 1}. [${issue.severity}] ${issue.message}`);
            });
        }

        // Fixes Applied
        if (this.fixes.length > 0) {
            console.log('\n✅ FIXES APPLIED:');
            this.fixes.forEach((fix, i) => {
                console.log(`   ${i + 1}. ${fix.description}`);
            });
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (this.stats.qualityScore < 70) {
            console.log('   • Run metadata enhancer to improve completeness');
        }
        if (this.stats.errorsFound > this.stats.errorsFixed) {
            console.log('   • Review and manually fix remaining issues');
        }
        console.log('   • Run validation after applying fixes');
        console.log('   • Consider setting up automated daily checks');
        
        return {
            stats: this.stats,
            issues: this.issues,
            fixes: this.fixes
        };
    }

    /**
     * Run comprehensive quality assurance
     */
    async runQualityAssurance() {
        console.log('🔍 Starting Comprehensive Quality Assurance...\n');

        try {
            // Fix structural issues
            this.fixTechniqueCategoriesStructure();
            this.fixDataLoaderCategories();
            
            // Validate content
            this.validateTechniqueCompleteness();
            this.checkForDuplicates();
            this.validateDataConsistency();
            
            // Generate report
            const report = this.generateQualityReport();
            
            console.log('\n✨ Quality Assurance completed!');
            
            if (this.stats.errorsFixed > 0) {
                console.log(`   Fixed ${this.stats.errorsFixed} issues`);
                console.log('   Re-run validation to see improvements');
            }
            
            return report;

        } catch (error) {
            console.error('❌ Quality Assurance failed:', error.message);
            throw error;
        }
    }
}

// Run quality assurance if called directly
if (require.main === module) {
    const qa = new QualityAssuranceManager();
    
    qa.runQualityAssurance()
        .then((report) => {
            const exitCode = report.stats.errorsFound > report.stats.errorsFixed ? 1 : 0;
            console.log(`\n🎯 Quality Score: ${report.stats.qualityScore}%`);
            process.exit(exitCode);
        })
        .catch((error) => {
            console.error('Quality assurance failed:', error);
            process.exit(1);
        });
}

module.exports = QualityAssuranceManager;