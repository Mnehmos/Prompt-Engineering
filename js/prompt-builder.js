/**
 * Interactive Prompt Builder for Prompt Engineering Taxonomy
 * Helps users construct effective prompts using selected techniques
 */

class PromptBuilder {
    constructor() {
        this.selectedTechniques = [];
        this.techniqueData = {};
        this.basePrompt = "";
        this.taskDescription = "";
        this.outputFormat = "";
        this.skillLevel = "intermediate"; // default
    }

    /**
     * Initialize the prompt builder
     */
    async init() {
        try {
            // Load technique data
            await this.loadTechniqueData();
            
            // Initialize UI components
            this.initUI();
            
            // Add event listeners
            this.addEventListeners();
        } catch (error) {
            console.error('Error initializing prompt builder:', error);
            this.showError('Failed to load technique data. Please try refreshing the page.');
        }
    }

    /**
     * Load technique data from JSON
     */
    async loadTechniqueData() {
        try {
            // Load categories first
            const categoriesResponse = await fetch('/data/processed/technique_categories.json');
            const categoriesData = await categoriesResponse.json();
            
            // Load techniques
            const techniquesResponse = await fetch('/data/processed/techniques.json');
            const techniquesData = await techniquesResponse.json();
            
            // Process and store data
            this.processTechniqueData(categoriesData, techniquesData);
        } catch (error) {
            console.error('Error loading technique data:', error);
            throw new Error('Failed to load taxonomy data');
        }
    }

    /**
     * Process and organize technique data
     */
    processTechniqueData(categoriesData, techniquesData) {
        // Create a map of techniques by ID for easy lookup
        this.techniqueData = {};
        
        techniquesData.categories.forEach(category => {
            const categoryInfo = categoriesData.categories.find(c => c.id === category.id);
            
            category.techniques.forEach(technique => {
                this.techniqueData[technique.id] = {
                    ...technique,
                    categoryId: category.id,
                    categoryName: categoryInfo ? categoryInfo.name : category.id
                };
            });
        });
    }

    /**
     * Initialize UI components
     */
    initUI() {
        // Create technique selection area
        this.createTechniqueSelectors();
        
        // Initialize prompt preview area
        this.updatePromptPreview();
    }

    /**
     * Create technique selector elements
     */
    createTechniqueSelectors() {
        const container = document.getElementById('technique-selector');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Group techniques by category
        const categorizedTechniques = {};
        
        Object.values(this.techniqueData).forEach(technique => {
            if (!categorizedTechniques[technique.categoryId]) {
                categorizedTechniques[technique.categoryId] = {
                    name: technique.categoryName,
                    techniques: []
                };
            }
            
            categorizedTechniques[technique.categoryId].techniques.push(technique);
        });
        
        // Create category sections
        Object.keys(categorizedTechniques).forEach(categoryId => {
            const category = categorizedTechniques[categoryId];
            
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'technique-category-section';
            
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);
            
            // Create technique list
            const techniqueList = document.createElement('div');
            techniqueList.className = 'technique-list';
            
            category.techniques.forEach(technique => {
                const techniqueItem = document.createElement('div');
                techniqueItem.className = 'technique-selector-item';
                techniqueItem.dataset.id = technique.id;
                
                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `technique-${technique.id}`;
                
                // Create label
                const label = document.createElement('label');
                label.htmlFor = `technique-${technique.id}`;
                label.textContent = technique.name;
                
                // Create info icon
                const infoIcon = document.createElement('i');
                infoIcon.className = 'fas fa-info-circle technique-info-icon';
                infoIcon.title = 'View technique details';
                
                techniqueItem.appendChild(checkbox);
                techniqueItem.appendChild(label);
                techniqueItem.appendChild(infoIcon);
                techniqueList.appendChild(techniqueItem);
                
                // Add click event for technique selection
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.addTechnique(technique.id);
                    } else {
                        this.removeTechnique(technique.id);
                    }
                });
                
                // Add click event for info icon
                infoIcon.addEventListener('click', () => {
                    this.showTechniqueDetails(technique.id);
                });
            });
            
            categorySection.appendChild(techniqueList);
            container.appendChild(categorySection);
        });
    }

    /**
     * Add a technique to the selected techniques
     */
    addTechnique(techniqueId) {
        if (!this.selectedTechniques.includes(techniqueId)) {
            this.selectedTechniques.push(techniqueId);
            this.updateSelectedTechniques();
            this.updatePromptPreview();
        }
    }

    /**
     * Remove a technique from the selected techniques
     */
    removeTechnique(techniqueId) {
        this.selectedTechniques = this.selectedTechniques.filter(id => id !== techniqueId);
        this.updateSelectedTechniques();
        this.updatePromptPreview();
    }

    /**
     * Update the selected techniques list UI
     */
    updateSelectedTechniques() {
        const container = document.getElementById('selected-techniques');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.selectedTechniques.length === 0) {
            container.innerHTML = '<p class="empty-state">No techniques selected. Select techniques from the list to build your prompt.</p>';
            return;
        }
        
        // Create list of selected techniques
        const techniqueList = document.createElement('div');
        techniqueList.className = 'selected-techniques-list';
        
        this.selectedTechniques.forEach(techniqueId => {
            const technique = this.techniqueData[techniqueId];
            if (!technique) return;
            
            const techniqueItem = document.createElement('div');
            techniqueItem.className = 'selected-technique-item';
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-technique-button';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.title = 'Remove technique';
            
            // Create technique name
            const techniqueName = document.createElement('span');
            techniqueName.className = 'selected-technique-name';
            techniqueName.textContent = technique.name;
            
            // Create category badge
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'selected-technique-category';
            categoryBadge.textContent = technique.categoryName;
            
            techniqueItem.appendChild(removeButton);
            techniqueItem.appendChild(techniqueName);
            techniqueItem.appendChild(categoryBadge);
            techniqueList.appendChild(techniqueItem);
            
            // Add click event for remove button
            removeButton.addEventListener('click', () => {
                this.removeTechnique(techniqueId);
                
                // Uncheck the corresponding checkbox
                const checkbox = document.getElementById(`technique-${techniqueId}`);
                if (checkbox) checkbox.checked = false;
            });
        });
        
        container.appendChild(techniqueList);
    }

    /**
     * Update the prompt preview based on selected techniques and inputs
     */
    updatePromptPreview() {
        const previewContainer = document.getElementById('prompt-preview');
        if (!previewContainer) return;
        
        // Get input values
        this.taskDescription = document.getElementById('task-description')?.value || "";
        this.basePrompt = document.getElementById('base-prompt')?.value || "";
        this.outputFormat = document.getElementById('output-format')?.value || "";
        
        // Build the prompt
        let finalPrompt = "";
        
        // Add selected techniques guidance
        if (this.selectedTechniques.length > 0) {
            finalPrompt += this.constructTechniquePrompt();
        }
        
        // Add user inputs
        if (this.basePrompt) {
            finalPrompt += this.basePrompt + "\n\n";
        }
        
        if (this.taskDescription) {
            finalPrompt += "Task: " + this.taskDescription + "\n\n";
        }
        
        if (this.outputFormat) {
            finalPrompt += "Output format: " + this.outputFormat + "\n";
        }
        
        // Add placeholder if prompt is empty
        if (!finalPrompt.trim()) {
            finalPrompt = "Your prompt will appear here. Select techniques and fill in the input fields to build your prompt.";
        }
        
        // Set the preview
        previewContainer.textContent = finalPrompt.trim();
        
        // Update copy button state
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.disabled = !finalPrompt.trim() || finalPrompt.includes("Your prompt will appear here");
        }
    }

    /**
     * Construct a prompt based on selected techniques
     */
    constructTechniquePrompt() {
        let prompt = "";
        
        // Add role context if Chain-of-Thought is selected
        if (this.selectedTechniques.includes('chain-of-thought')) {
            prompt += "I want you to think through this problem step by step and show your reasoning.\n\n";
        }
        
        // Add self-consistency if selected
        if (this.selectedTechniques.includes('self-consistency')) {
            prompt += "Generate multiple different reasoning paths to solve this problem, then select the most consistent answer.\n\n";
        }
        
        // Add Zero-Shot CoT if selected
        if (this.selectedTechniques.includes('zero-shot-cot')) {
            prompt += "Let's think about this step by step.\n\n";
        }
        
        // Add Tree-of-Thoughts if selected
        if (this.selectedTechniques.includes('tree-of-thoughts')) {
            prompt += "For this problem, explore multiple possible approaches. For each approach, think about the next steps and evaluate whether the approach is likely to succeed.\n\n";
        }
        
        // Add ReAct if selected
        if (this.selectedTechniques.includes('react')) {
            prompt += "Let's break down this problem:\n1. Thought: Reflect on what we need to do\n2. Action: Determine what information or steps we need\n3. Observation: Note the results\n\nRepeat this process until we reach a solution.\n\n";
        }
        
        // Add self-evaluation prompt if selected
        if (this.selectedTechniques.includes('self-correction')) {
            prompt += "After generating your initial response, review it for errors or improvements, then provide a revised version.\n\n";
        }
        
        return prompt;
    }

    /**
     * Show details for a specific technique
     */
    showTechniqueDetails(techniqueId) {
        const technique = this.techniqueData[techniqueId];
        if (!technique) return;
        
        // Get or create modal
        let modal = document.getElementById('technique-detail-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'technique-detail-modal';
            modal.className = 'modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            // Create close button
            const closeButton = document.createElement('span');
            closeButton.className = 'close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modalContent.appendChild(closeButton);
            
            // Create technique details container
            const detailsContainer = document.createElement('div');
            detailsContainer.id = 'technique-details-container';
            modalContent.appendChild(detailsContainer);
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update modal content
        const detailsContainer = document.getElementById('technique-details-container');
        
        if (detailsContainer) {
            // Clear container
            detailsContainer.innerHTML = '';
            
            // Add technique name
            const title = document.createElement('h2');
            title.textContent = technique.name;
            detailsContainer.appendChild(title);
            
            // Add category
            const category = document.createElement('div');
            category.className = 'technique-category';
            category.textContent = technique.categoryName;
            detailsContainer.appendChild(category);
            
            // Add description
            const description = document.createElement('p');
            description.className = 'technique-description';
            description.textContent = technique.description || 'No description available.';
            detailsContainer.appendChild(description);
            
            // Add aliases if available
            if (technique.aliases && technique.aliases.length > 0) {
                const aliasesSection = document.createElement('div');
                aliasesSection.className = 'technique-detail-section';
                
                const aliasesTitle = document.createElement('h4');
                aliasesTitle.textContent = 'Also Known As';
                
                const aliasesList = document.createElement('p');
                aliasesList.textContent = technique.aliases.join(', ');
                
                aliasesSection.appendChild(aliasesTitle);
                aliasesSection.appendChild(aliasesList);
                detailsContainer.appendChild(aliasesSection);
            }
            
            // Add use case if available
            if (technique.useCase) {
                const useCaseSection = document.createElement('div');
                useCaseSection.className = 'technique-detail-section';
                
                const useCaseTitle = document.createElement('h4');
                useCaseTitle.textContent = 'Use Case';
                
                const useCaseText = document.createElement('p');
                useCaseText.textContent = technique.useCase;
                
                useCaseSection.appendChild(useCaseTitle);
                useCaseSection.appendChild(useCaseText);
                detailsContainer.appendChild(useCaseSection);
            }
            
            // Add example if available
            if (technique.example) {
                const exampleSection = document.createElement('div');
                exampleSection.className = 'technique-detail-section';
                
                const exampleTitle = document.createElement('h4');
                exampleTitle.textContent = 'Example';
                
                const exampleCode = document.createElement('div');
                exampleCode.className = 'example-code';
                exampleCode.textContent = technique.example;
                
                exampleSection.appendChild(exampleTitle);
                exampleSection.appendChild(exampleCode);
                detailsContainer.appendChild(exampleSection);
            }
            
            // Add sources if available
            if (technique.sources && technique.sources.length > 0) {
                const sourcesSection = document.createElement('div');
                sourcesSection.className = 'technique-detail-section';
                
                const sourcesTitle = document.createElement('h4');
                sourcesTitle.textContent = 'Sources';
                
                const sourcesList = document.createElement('ul');
                sourcesList.className = 'sources-list';
                
                technique.sources.forEach(source => {
                    const sourceItem = document.createElement('li');
                    sourceItem.textContent = source;
                    sourcesList.appendChild(sourceItem);
                });
                
                sourcesSection.appendChild(sourcesTitle);
                sourcesSection.appendChild(sourcesList);
                detailsContainer.appendChild(sourcesSection);
            }
            
            // Add related techniques if available
            if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
                const relatedSection = document.createElement('div');
                relatedSection.className = 'technique-detail-section';
                
                const relatedTitle = document.createElement('h4');
                relatedTitle.textContent = 'Related Techniques';
                
                const relatedList = document.createElement('div');
                relatedList.className = 'related-techniques';
                
                technique.relatedTechniques.forEach(relatedId => {
                    const relatedTechnique = this.techniqueData[relatedId];
                    if (relatedTechnique) {
                        const relatedItem = document.createElement('span');
                        relatedItem.className = 'related-technique';
                        relatedItem.textContent = relatedTechnique.name;
                        relatedItem.dataset.id = relatedId;
                        
                        relatedItem.addEventListener('click', () => {
                            this.showTechniqueDetails(relatedId);
                        });
                        
                        relatedList.appendChild(relatedItem);
                    }
                });
                
                relatedSection.appendChild(relatedTitle);
                relatedSection.appendChild(relatedList);
                detailsContainer.appendChild(relatedSection);
            }
            
            // Add "Add to Prompt" button
            const addButton = document.createElement('button');
            addButton.className = 'button primary add-to-prompt-button';
            addButton.textContent = this.selectedTechniques.includes(techniqueId) ? 'Remove from Prompt' : 'Add to Prompt';
            
            addButton.addEventListener('click', () => {
                const checkbox = document.getElementById(`technique-${techniqueId}`);
                
                if (this.selectedTechniques.includes(techniqueId)) {
                    this.removeTechnique(techniqueId);
                    addButton.textContent = 'Add to Prompt';
                    if (checkbox) checkbox.checked = false;
                } else {
                    this.addTechnique(techniqueId);
                    addButton.textContent = 'Remove from Prompt';
                    if (checkbox) checkbox.checked = true;
                }
            });
            
            detailsContainer.appendChild(addButton);
        }
        
        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Input field change events
        const inputFields = [
            document.getElementById('task-description'),
            document.getElementById('base-prompt'),
            document.getElementById('output-format')
        ];
        
        inputFields.forEach(field => {
            if (field) {
                field.addEventListener('input', () => {
                    this.updatePromptPreview();
                });
            }
        });
        
        // Copy button
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyPromptToClipboard();
            });
        }
        
        // Clear button
        const clearButton = document.getElementById('clear-prompt-button');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearPrompt();
            });
        }
        
        // Skill level selector
        const skillLevelSelector = document.getElementById('skill-level-selector');
        if (skillLevelSelector) {
            skillLevelSelector.addEventListener('change', () => {
                this.skillLevel = skillLevelSelector.value;
                this.updatePromptPreview();
            });
        }
    }

    /**
     * Copy the generated prompt to clipboard
     */
    copyPromptToClipboard() {
        const promptText = document.getElementById('prompt-preview')?.textContent;
        
        if (promptText && !promptText.includes("Your prompt will appear here")) {
            navigator.clipboard.writeText(promptText)
                .then(() => {
                    // Show success message
                    const copyButton = document.getElementById('copy-prompt-button');
                    if (copyButton) {
                        const originalText = copyButton.textContent;
                        copyButton.textContent = 'Copied!';
                        
                        setTimeout(() => {
                            copyButton.textContent = originalText;
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('Error copying to clipboard:', error);
                });
        }
    }

    /**
     * Clear the prompt (deselect all techniques and clear inputs)
     */
    clearPrompt() {
        // Clear selected techniques
        this.selectedTechniques = [];
        
        // Uncheck all checkboxes
        document.querySelectorAll('#technique-selector input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear input fields
        const taskDescription = document.getElementById('task-description');
        if (taskDescription) taskDescription.value = '';
        
        const basePrompt = document.getElementById('base-prompt');
        if (basePrompt) basePrompt.value = '';
        
        const outputFormat = document.getElementById('output-format');
        if (outputFormat) outputFormat.value = '';
        
        // Reset skill level
        const skillLevelSelector = document.getElementById('skill-level-selector');
        if (skillLevelSelector) skillLevelSelector.value = 'intermediate';
        this.skillLevel = 'intermediate';
        
        // Update UI
        this.updateSelectedTechniques();
        this.updatePromptPreview();
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${message}</p>`;
        
        // Find container to append to
        const container = document.querySelector('.prompt-builder-container') || document.body;
        container.prepend(errorElement);
        
        // Remove after delay
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const promptBuilder = new PromptBuilder();
    promptBuilder.init();
});