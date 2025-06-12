#!/usr/bin/env node

/**
 * Data Validation Tools for Prompt Engineering Taxonomy
 * 
 * This script validates data consistency across all embedded files,
 * checks for missing metadata, and ensures quality standards.
 */

const fs = require('fs');
const path = require('path');

class TaxonomyValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.stats = {
            totalTechniques: 0,
            techniquesWithUseCase: 0,
            techniquesWithTips: 0,
            techniquesWithCommonMistakes: 0,
            techniquesWithExamples: 0
        };
        
        // Required fields for complete technique metadata
        this.requiredFields = ['id', 'name', 'description', 'sources'];
        this.recommendedFields = ['useCase', 'example', 'relatedTechniques'];
        this.qualityFields = ['tips', 'commonMistakes'];
    }

    /**
     * Load and parse JSON file
     */
    loadJsonFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.errors.push(`Failed to load ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Extract techniques from embedded JavaScript files
     */
    extractTechniquesFromJS(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Look for technique data patterns in JS files
            const techniqueMatches = content.match(/techniques:\s*\[[\s\S]*?\]/g);
            if (!techniqueMatches) return [];

            const techniques = [];
            
            // Extract individual technique objects
            const objectMatches = content.match(/{\s*["']?id["']?:\s*["'][^"']+["'][\s\S]*?}/g);
            if (objectMatches) {
                objectMatches.forEach(match => {
                    try {
                        // Clean up the match to make it valid JSON
                        let cleanMatch = match
                            .replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)\1:/g, '"$2":') // Quote property names
                            .replace(/'/g, '"') // Convert single quotes to double quotes
                            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
                        
                        const technique = JSON.parse(cleanMatch);
                        if (technique.id) {
                            techniques.push(technique);
                        }
                    } catch (e) {
                        // Skip malformed objects
                    }
                });
            }
            
            return techniques;
        } catch (error) {
            this.warnings.push(`Could not extract techniques from ${filePath}: ${error.message}`);
            return [];
        }
    }

    /**
     * Validate technique object
     */
    validateTechnique(technique, sourcePath) {
        const errors = [];
        const warnings = [];
        
        // Check required fields
        this.requiredFields.forEach(field => {
            if (!technique[field]) {
                errors.push(`Missing required field '${field}' in technique '${technique.id || 'unknown'}' from ${sourcePath}`);
            }
        });

        // Check recommended fields
        this.recommendedFields.forEach(field => {
            if (!technique[field]) {
                warnings.push(`Missing recommended field '${field}' in technique '${technique.id}' from ${sourcePath}`);
            }
        });

        // Validate data types
        if (technique.sources && !Array.isArray(technique.sources)) {
            errors.push(`Field 'sources' should be an array in technique '${technique.id}' from ${sourcePath}`);
        }

        if (technique.relatedTechniques && !Array.isArray(technique.relatedTechniques)) {
            errors.push(`Field 'relatedTechniques' should be an array in technique '${technique.id}' from ${sourcePath}`);
        }

        // Validate ID format (should be kebab-case)
        if (technique.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(technique.id)) {
            warnings.push(`Technique ID '${technique.id}' should be in kebab-case format in ${sourcePath}`);
        }

        // Check description length (should be meaningful)
        if (technique.description && technique.description.length < 20) {
            warnings.push(`Description too short for technique '${technique.id}' in ${sourcePath}`);
        }

        return { errors, warnings };
    }

    /**
     * Check data consistency across files
     */
    checkDataConsistency(allTechniques) {
        const techniqueMap = new Map();
        const inconsistencies = [];

        // Group techniques by ID
        allTechniques.forEach(({ technique, source }) => {
            if (!techniqueMap.has(technique.id)) {
                techniqueMap.set(technique.id, []);
            }
            techniqueMap.get(technique.id).push({ technique, source });
        });

        // Check for inconsistencies
        techniqueMap.forEach((entries, id) => {
            if (entries.length > 1) {
                // Compare all versions of this technique
                const baseVersion = entries[0].technique;
                
                for (let i = 1; i < entries.length; i++) {
                    const currentVersion = entries[i].technique;
                    
                    // Check name consistency
                    if (baseVersion.name !== currentVersion.name) {
                        inconsistencies.push(`Name mismatch for technique '${id}': '${baseVersion.name}' vs '${currentVersion.name}' (${entries[0].source} vs ${entries[i].source})`);
                    }
                    
                    // Check description consistency (allow minor differences)
                    if (baseVersion.description && currentVersion.description && 
                        Math.abs(baseVersion.description.length - currentVersion.description.length) > 50) {
                        inconsistencies.push(`Significant description difference for technique '${id}' between ${entries[0].source} and ${entries[i].source}`);
                    }
                }
            }
        });

        return inconsistencies;
    }

    /**
     * Analyze metadata completeness
     */
    analyzeMetadataCompleteness(allTechniques) {
        const analysis = {
            byCategory: {},
            topMissing: [],
            qualityIssues: []
        };

        const fieldCounts = {
            useCase: 0,
            tips: 0,
            commonMistakes: 0,
            example: 0
        };

        allTechniques.forEach(({ technique }) => {
            this.stats.totalTechniques++;
            
            // Count field presence
            if (technique.useCase) {
                fieldCounts.useCase++;
                this.stats.techniquesWithUseCase++;
            }
            if (technique.tips) {
                fieldCounts.tips++;
                this.stats.techniquesWithTips++;
            }
            if (technique.commonMistakes) {
                fieldCounts.commonMistakes++;
                this.stats.techniquesWithCommonMistakes++;
            }
            if (technique.example) {
                fieldCounts.example++;
                this.stats.techniquesWithExamples++;
            }

            // Identify techniques missing critical metadata
            const missingFields = [];
            ['useCase', 'tips', 'commonMistakes', 'example'].forEach(field => {
                if (!technique[field]) {
                    missingFields.push(field);
                }
            });

            if (missingFields.length > 0) {
                analysis.topMissing.push({
                    id: technique.id,
                    name: technique.name,
                    missing: missingFields,
                    category: technique.categoryId || technique.categoryName
                });
            }
        });

        // Calculate completion percentages
        const total = this.stats.totalTechniques;
        analysis.completionRates = {
            useCase: Math.round((fieldCounts.useCase / total) * 100),
            tips: Math.round((fieldCounts.tips / total) * 100),
            commonMistakes: Math.round((fieldCounts.commonMistakes / total) * 100),
            example: Math.round((fieldCounts.example / total) * 100)
        };

        return analysis;
    }

    /**
     * Generate priority list for metadata enhancement
     */
    generatePriorityList(techniques) {
        // Core techniques that should be enhanced first
        const coreTechniqueIds = [
            'chain-of-thought', 'zero-shot-cot', 'few-shot-cot',
            'basic-prompting', 'zero-shot-learning', 'few-shot-learning',
            'tree-of-thoughts', 'self-consistency', 'react',
            'self-correction', 'rag', 'in-context-learning'
        ];

        const priorityList = [];
        
        techniques.forEach(({ technique }) => {
            const priority = coreTechniqueIds.includes(technique.id) ? 'HIGH' : 'MEDIUM';
            const missingFields = [];
            
            ['useCase', 'tips', 'commonMistakes', 'example'].forEach(field => {
                if (!technique[field]) {
                    missingFields.push(field);
                }
            });

            if (missingFields.length > 0) {
                priorityList.push({
                    id: technique.id,
                    name: technique.name,
                    priority,
                    missingFields,
                    completeness: Math.round(((4 - missingFields.length) / 4) * 100)
                });
            }
        });

        // Sort by priority and completeness
        priorityList.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority === 'HIGH' ? -1 : 1;
            }
            return a.completeness - b.completeness;
        });

        return priorityList;
    }

    /**
     * Run complete validation
     */
    async validate() {
        console.log('🔍 Starting Prompt Engineering Taxonomy Validation...\n');

        const filesToCheck = [
            { path: 'data/processed/techniques.json', type: 'json' },
            { path: 'data/processed/technique_categories.json', type: 'json' },
            { path: 'assets/js/data-loader.js', type: 'js' },
            { path: 'js/prompt-builder.js', type: 'js' },
            { path: 'PromptEngineeringTaxonomy/data/techniques.json', type: 'json' }
        ];

        const allTechniques = [];

        // Load and validate each file
        for (const file of filesToCheck) {
            if (!fs.existsSync(file.path)) {
                this.warnings.push(`File not found: ${file.path}`);
                continue;
            }

            console.log(`📁 Checking ${file.path}...`);

            if (file.type === 'json') {
                const data = this.loadJsonFile(file.path);
                if (data && data.categories) {
                    data.categories.forEach(category => {
                        if (category.techniques) {
                            category.techniques.forEach(technique => {
                                const validation = this.validateTechnique(technique, file.path);
                                this.errors.push(...validation.errors);
                                this.warnings.push(...validation.warnings);
                                
                                allTechniques.push({
                                    technique: { ...technique, categoryId: category.id, categoryName: category.name },
                                    source: file.path
                                });
                            });
                        }
                    });
                }
            } else if (file.type === 'js') {
                const techniques = this.extractTechniquesFromJS(file.path);
                techniques.forEach(technique => {
                    const validation = this.validateTechnique(technique, file.path);
                    this.errors.push(...validation.errors);
                    this.warnings.push(...validation.warnings);
                    
                    allTechniques.push({
                        technique,
                        source: file.path
                    });
                });
            }
        }

        // Check consistency across files
        const inconsistencies = this.checkDataConsistency(allTechniques);
        this.warnings.push(...inconsistencies);

        // Analyze metadata completeness
        const analysis = this.analyzeMetadataCompleteness(allTechniques);

        // Generate priority list
        const priorityList = this.generatePriorityList(allTechniques);

        // Output results
        this.printResults(analysis, priorityList);

        return {
            errors: this.errors,
            warnings: this.warnings,
            stats: this.stats,
            analysis,
            priorityList
        };
    }

    /**
     * Print validation results
     */
    printResults(analysis, priorityList) {
        console.log('\n📊 VALIDATION RESULTS\n');
        
        // Statistics
        console.log('📈 Overall Statistics:');
        console.log(`   Total Techniques: ${this.stats.totalTechniques}`);
        console.log(`   With Use Cases: ${this.stats.techniquesWithUseCase} (${analysis.completionRates.useCase}%)`);
        console.log(`   With Tips: ${this.stats.techniquesWithTips} (${analysis.completionRates.tips}%)`);
        console.log(`   With Common Mistakes: ${this.stats.techniquesWithCommonMistakes} (${analysis.completionRates.commonMistakes}%)`);
        console.log(`   With Examples: ${this.stats.techniquesWithExamples} (${analysis.completionRates.example}%)`);

        // Errors
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => console.log(`   • ${error}`));
        }

        // Warnings
        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.slice(0, 10).forEach(warning => console.log(`   • ${warning}`));
            if (this.warnings.length > 10) {
                console.log(`   ... and ${this.warnings.length - 10} more warnings`);
            }
        }

        // Priority enhancement list
        console.log('\n🎯 TOP 20 TECHNIQUES NEEDING METADATA ENHANCEMENT:');
        priorityList.slice(0, 20).forEach((item, index) => {
            console.log(`   ${index + 1}. [${item.priority}] ${item.name} (${item.completeness}% complete)`);
            console.log(`      Missing: ${item.missingFields.join(', ')}`);
        });

        // Summary
        const errorCount = this.errors.length;
        const warningCount = this.warnings.length;
        
        console.log('\n📋 SUMMARY:');
        console.log(`   ${errorCount} errors, ${warningCount} warnings`);
        console.log(`   ${priorityList.length} techniques need metadata enhancement`);
        
        if (errorCount === 0) {
            console.log('   ✅ No critical errors found!');
        } else {
            console.log('   ❗ Critical errors need immediate attention');
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new TaxonomyValidator();
    validator.validate()
        .then(() => {
            console.log('\n✨ Validation complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Validation failed:', error);
            process.exit(1);
        });
}

module.exports = TaxonomyValidator;