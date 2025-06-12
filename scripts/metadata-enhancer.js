#!/usr/bin/env node

/**
 * Metadata Enhancement Tool for Prompt Engineering Taxonomy
 * 
 * This script adds missing metadata fields (useCase, tips, commonMistakes, example)
 * to techniques based on priority and best practices.
 */

const fs = require('fs');
const path = require('path');

class TaxonomyMetadataEnhancer {
    constructor() {
        // Enhanced metadata for priority techniques
        this.enhancedMetadata = {
            'basic-prompting': {
                useCase: 'Simple, direct tasks where clarity is paramount. Effective for well-defined tasks with clear instructions.',
                tips: 'Be specific and clear in your instructions. Avoid ambiguous language. Include context when necessary. State the desired output format explicitly.',
                commonMistakes: 'Being too vague or general. Not providing enough context. Assuming the model knows unstated requirements. Using complex language when simple is better.',
                example: 'Translate the following English text to French: "Hello, how are you?"'
            },
            
            'zero-shot-learning': {
                useCase: 'Simple tasks or when working with capable models that don\'t require examples. Best for straightforward instructions.',
                tips: 'Make instructions as clear and specific as possible. Include output format requirements. Consider the model\'s capabilities and limitations.',
                commonMistakes: 'Underestimating task complexity. Not providing sufficient context. Expecting perfect results without examples for complex tasks.',
                example: 'Summarize the main points of the following article in 3 bullet points: [article text]'
            },
            
            'few-shot-learning': {
                useCase: 'Tasks where examples help illustrate the desired pattern or format of response. Effective for classification, formatting, and pattern-following tasks.',
                tips: 'Choose diverse, high-quality examples. Ensure examples clearly demonstrate the pattern. Use 2-5 examples for best results. Keep examples concise but complete.',
                commonMistakes: 'Using poor-quality or inconsistent examples. Too many examples that confuse rather than clarify. Examples that don\'t match the actual task.',
                example: 'Classify sentiment as positive or negative:\n\nText: "The food was delicious." Sentiment: positive\nText: "Terrible service." Sentiment: negative\n\nText: "The atmosphere was nice but waiting time was too long."'
            },
            
            'one-shot-learning': {
                useCase: 'When a single example sufficiently conveys the pattern or when context length is limited. Good for simple pattern matching.',
                tips: 'Choose the most representative example possible. Ensure the example is clear and unambiguous. Make sure the pattern is obvious from one example.',
                commonMistakes: 'Choosing an example that doesn\'t clearly show the pattern. Using edge cases as the single example. Overcomplicating the example.',
                example: 'Translate English to French:\nEnglish: The weather is beautiful today.\nFrench: Le temps est beau aujourd\'hui.\n\nEnglish: I would like to order dinner.'
            },
            
            'in-context-learning': {
                useCase: 'Achieving task-specific behavior without fine-tuning. Particularly effective for classification, translation, and reasoning tasks.',
                tips: 'Provide clear, consistent examples. Maintain the same format throughout. Use examples that cover the range of expected inputs.',
                commonMistakes: 'Inconsistent formatting between examples. Examples that don\'t represent the full scope of the task. Too much variation in example quality.',
                example: 'Q: What is the capital of France?\nA: Paris\n\nQ: What is the capital of Japan?\nA: Tokyo\n\nQ: What is the capital of Australia?\nA:'
            },
            
            'chain-of-thought': {
                useCase: 'Complex reasoning tasks, math problems, logical deductions, and multi-step decision processes. Essential for transparent reasoning.',
                tips: 'Provide clear, detailed reasoning steps in your examples. Break down complex problems into smaller, logical steps. Use natural language that matches how humans reason through problems.',
                commonMistakes: 'Skipping intermediate steps in reasoning chains. Using overly complex examples that confuse the model. Not adapting the reasoning style to the specific problem domain.',
                example: 'Question: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\n\nLet\'s think about this step-by-step:\n1. Roger starts with 5 tennis balls\n2. He buys 2 cans of tennis balls, with 3 balls per can\n3. So he gets 2 × 3 = 6 new tennis balls\n4. In total, he has 5 + 6 = 11 tennis balls\n\nAnswer: 11 tennis balls'
            },
            
            'zero-shot-cot': {
                useCase: 'When example chains of reasoning aren\'t available but step-by-step thinking is still beneficial. Good for novel problems.',
                tips: 'Use clear thought-inducing phrases like "Let\'s think step by step" or "Let\'s work through this systematically." Be explicit about wanting reasoning.',
                commonMistakes: 'Not being explicit enough about wanting step-by-step reasoning. Using phrases that don\'t actually trigger reasoning. Expecting detailed reasoning without proper prompting.',
                example: 'Question: If a store has 10 apples and 3 people each buy 2 apples, how many apples are left?\n\nLet\'s think step by step.'
            },
            
            'tree-of-thoughts': {
                useCase: 'Complex problems with multiple possible approaches, where exploring alternatives is beneficial. Best for creative problem-solving and strategic planning.',
                tips: 'Encourage exploration of multiple paths. Use evaluation criteria for different approaches. Be prepared for longer response times. Structure the exploration systematically.',
                commonMistakes: 'Not providing clear evaluation criteria. Allowing too much branching without focus. Not synthesizing insights from different paths.',
                example: 'Problem: Find the optimal strategy for the game of 24 (reach 24 using +, -, *, / with cards 3, 9, 4, 1).\n\nLet\'s explore multiple approaches:\nPath 1: (3 + 9) * (4 - 1) = 12 * 3 = 36 (too high)\nPath 2: (9 - 1) * 3 = 8 * 3 = 24 ✓'
            },
            
            'self-consistency': {
                useCase: 'Improving answer reliability in complex reasoning tasks. Particularly useful when accuracy is critical and you can afford multiple generations.',
                tips: 'Generate multiple reasoning paths with different approaches. Look for the most common final answer. Use temperature > 0 for diversity in reasoning.',
                commonMistakes: 'Not generating enough diverse paths. Focusing only on the final answer rather than reasoning quality. Using identical reasoning approaches.',
                example: 'Generate 3 different approaches to this problem, then select the most consistent answer:\n[problem statement]\n\nApproach 1: [reasoning path 1]\nApproach 2: [reasoning path 2]\nApproach 3: [reasoning path 3]\n\nMost consistent answer: [selection]'
            },
            
            'react': {
                useCase: 'Tasks requiring tool use or external actions. Complex problem-solving that needs iterative reasoning and acting.',
                tips: 'Clearly separate the Thought, Action, and Observation steps. Be explicit about which tools are available. Encourage the model to reflect on observations before taking new actions.',
                commonMistakes: 'Not providing enough context about available tools. Allowing the model to skip the reasoning step. Failing to incorporate observations into subsequent reasoning.',
                example: 'Thought: I need to find the current weather in Paris to answer this question.\nAction: Search[current weather Paris]\nObservation: The current temperature in Paris is 22°C with partly cloudy skies.\nThought: Now I have the information needed to provide a complete answer.'
            },
            
            'self-correction': {
                useCase: 'Error reduction and iterative improvement. Useful for high-stakes tasks where accuracy is important and initial responses may have errors.',
                tips: 'Be explicit about the review process. Provide specific criteria for evaluation. Encourage honest self-assessment. Allow multiple revision rounds if needed.',
                commonMistakes: 'Not providing clear evaluation criteria. Being too lenient or too harsh in self-evaluation. Not actually making meaningful corrections.',
                example: 'First, provide your initial answer. Then, review your answer for:\n1. Factual accuracy\n2. Logical consistency\n3. Completeness\n\nFinally, provide a corrected version if needed.'
            },
            
            'rag': {
                useCase: 'Tasks requiring up-to-date or external knowledge. Question answering with specific domain knowledge. Information synthesis from multiple sources.',
                tips: 'Use high-quality, diverse knowledge sources. Implement effective chunking strategies for long documents. Consider hybrid retrieval methods combining semantic and keyword search.',
                commonMistakes: 'Retrieving too much irrelevant information that dilutes the context. Not properly attributing sources in the generated output. Using outdated or unreliable knowledge sources.',
                example: 'Based on the following retrieved documents:\n[Document 1: relevant excerpt]\n[Document 2: relevant excerpt]\n\nAnswer the question: [question]\n\nMake sure to cite which documents support your answer.'
            },
            
            'role-prompting': {
                useCase: 'Tasks requiring domain expertise or specific tone/style. When you need authoritative, professional, or specialized responses.',
                tips: 'Choose roles that match the required expertise. Be specific about the role\'s background and experience. Maintain consistency throughout the interaction.',
                commonMistakes: 'Choosing roles that don\'t match the task. Being too vague about the role\'s qualifications. Switching between roles inconsistently.',
                example: 'You are a senior software architect with 15 years of experience in distributed systems. You specialize in microservices architecture and have worked with companies like Netflix and Amazon. Please review this system design and provide recommendations for scalability improvements.'
            },
            
            'instructed-prompting': {
                useCase: 'Any task where specific behavioral guidance is needed. When you need to control the AI\'s approach or methodology.',
                tips: 'Be explicit and detailed in your instructions. Use clear, imperative language. Break down complex instructions into steps. Specify what to avoid as well as what to do.',
                commonMistakes: 'Being too vague or ambiguous in instructions. Not providing enough detail about the expected process. Conflicting or contradictory instructions.',
                example: 'You are a professional translator. Translate the following English text to Spanish, maintaining the same tone and formality level. Pay special attention to cultural nuances and idiomatic expressions. If a direct translation isn\'t appropriate, provide the closest cultural equivalent and explain your choice.'
            }
        };
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
     * Enhance metadata for a single technique
     */
    enhanceTechnique(technique) {
        const enhancement = this.enhancedMetadata[technique.id];
        if (!enhancement) {
            return technique; // No enhancement available
        }

        const enhanced = { ...technique };

        // Add missing fields
        if (!enhanced.useCase && enhancement.useCase) {
            enhanced.useCase = enhancement.useCase;
        }
        if (!enhanced.tips && enhancement.tips) {
            enhanced.tips = enhancement.tips;
        }
        if (!enhanced.commonMistakes && enhancement.commonMistakes) {
            enhanced.commonMistakes = enhancement.commonMistakes;
        }
        if (!enhanced.example && enhancement.example) {
            enhanced.example = enhancement.example;
        }

        return enhanced;
    }

    /**
     * Enhance main techniques.json file
     */
    enhanceMainTechniquesFile() {
        const filePath = 'data/processed/techniques.json';
        console.log(`📝 Enhancing ${filePath}...`);

        const data = this.loadJsonFile(filePath);
        if (!data || !data.categories) {
            console.error('Invalid techniques.json structure');
            return false;
        }

        let enhancedCount = 0;

        // Enhance techniques in each category
        data.categories.forEach(category => {
            if (category.techniques) {
                category.techniques.forEach((technique, index) => {
                    const originalTechnique = { ...technique };
                    const enhanced = this.enhanceTechnique(technique);
                    
                    if (JSON.stringify(originalTechnique) !== JSON.stringify(enhanced)) {
                        category.techniques[index] = enhanced;
                        enhancedCount++;
                        console.log(`  ✓ Enhanced: ${enhanced.name || enhanced.id}`);
                    }
                });
            }
        });

        if (enhancedCount > 0) {
            if (this.saveJsonFile(filePath, data)) {
                console.log(`  📁 Saved ${enhancedCount} enhancements to ${filePath}`);
                return true;
            }
        } else {
            console.log(`  ℹ️  No enhancements needed for ${filePath}`);
        }

        return false;
    }

    /**
     * Enhance embedded data in JavaScript files
     */
    enhanceJavaScriptFile(filePath) {
        console.log(`📝 Enhancing ${filePath}...`);

        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let enhancedCount = 0;

            // Find and enhance technique objects
            Object.keys(this.enhancedMetadata).forEach(techniqueId => {
                const enhancement = this.enhancedMetadata[techniqueId];
                
                // Look for technique definitions with this ID
                const idPattern = new RegExp(`"id":\\s*"${techniqueId}"[^}]*}`, 'g');
                const matches = content.match(idPattern);
                
                if (matches) {
                    matches.forEach(match => {
                        let enhanced = match;
                        let modified = false;

                        // Add missing fields if they don't exist in the match
                        if (!match.includes('"useCase"') && enhancement.useCase) {
                            enhanced = enhanced.replace('}', `,\n                            "useCase": "${enhancement.useCase.replace(/"/g, '\\"')}"\n                        }`);
                            modified = true;
                        }

                        if (!match.includes('"tips"') && enhancement.tips) {
                            enhanced = enhanced.replace('}', `,\n                            "tips": "${enhancement.tips.replace(/"/g, '\\"')}"\n                        }`);
                            modified = true;
                        }

                        if (!match.includes('"commonMistakes"') && enhancement.commonMistakes) {
                            enhanced = enhanced.replace('}', `,\n                            "commonMistakes": "${enhancement.commonMistakes.replace(/"/g, '\\"')}"\n                        }`);
                            modified = true;
                        }

                        if (!match.includes('"example"') && enhancement.example) {
                            enhanced = enhanced.replace('}', `,\n                            "example": "${enhancement.example.replace(/"/g, '\\"')}"\n                        }`);
                            modified = true;
                        }

                        if (modified) {
                            content = content.replace(match, enhanced);
                            enhancedCount++;
                            console.log(`  ✓ Enhanced: ${techniqueId}`);
                        }
                    });
                }
            });

            if (enhancedCount > 0) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`  📁 Saved ${enhancedCount} enhancements to ${filePath}`);
                return true;
            } else {
                console.log(`  ℹ️  No enhancements needed for ${filePath}`);
            }

        } catch (error) {
            console.error(`Error enhancing ${filePath}:`, error.message);
            return false;
        }

        return false;
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
     * Run the metadata enhancement process
     */
    async enhance() {
        console.log('🚀 Starting Metadata Enhancement...\n');

        const filesToEnhance = [
            { path: 'data/processed/techniques.json', type: 'json' },
            { path: 'js/prompt-builder.js', type: 'js' }
        ];

        let totalEnhanced = 0;

        for (const file of filesToEnhance) {
            if (!fs.existsSync(file.path)) {
                console.log(`⚠️  File not found: ${file.path}`);
                continue;
            }

            // Create backup
            this.createBackup(file.path);

            // Enhance based on file type
            let success = false;
            if (file.type === 'json') {
                success = this.enhanceMainTechniquesFile();
            } else if (file.type === 'js') {
                success = this.enhanceJavaScriptFile(file.path);
            }

            if (success) {
                totalEnhanced++;
            }
            
            console.log(''); // Add spacing
        }

        // Summary
        console.log('📊 ENHANCEMENT SUMMARY:');
        console.log(`   Enhanced ${totalEnhanced} files`);
        console.log(`   Added metadata for ${Object.keys(this.enhancedMetadata).length} priority techniques`);
        console.log('   Fields added: useCase, tips, commonMistakes, example');
        
        if (totalEnhanced > 0) {
            console.log('\n✅ Enhancement complete! Re-run validation to see improvements.');
        } else {
            console.log('\n⚠️  No files were enhanced. Check file paths and content.');
        }

        return totalEnhanced;
    }

    /**
     * Generate enhancement report
     */
    generateReport() {
        console.log('📋 AVAILABLE ENHANCEMENTS:\n');
        
        Object.keys(this.enhancedMetadata).forEach((id, index) => {
            const meta = this.enhancedMetadata[id];
            console.log(`${index + 1}. ${id}`);
            console.log(`   Use Case: ${meta.useCase.substring(0, 80)}...`);
            console.log(`   Has Tips: ${!!meta.tips}`);
            console.log(`   Has Common Mistakes: ${!!meta.commonMistakes}`);
            console.log(`   Has Example: ${!!meta.example}`);
            console.log('');
        });
    }
}

// Run enhancement if called directly
if (require.main === module) {
    const enhancer = new TaxonomyMetadataEnhancer();
    
    if (process.argv.includes('--report')) {
        enhancer.generateReport();
    } else {
        enhancer.enhance()
            .then((count) => {
                console.log(`\n✨ Enhancement process completed! Enhanced ${count} files.`);
                process.exit(0);
            })
            .catch((error) => {
                console.error('Enhancement failed:', error);
                process.exit(1);
            });
    }
}

module.exports = TaxonomyMetadataEnhancer;