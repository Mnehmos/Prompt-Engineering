/**
 * Interactive Prompt Builder for Prompt Engineering Taxonomy
 * Clean, modern implementation using TaxonomyDataUtils
 */

class PromptBuilder {
    constructor() {
        this.selectedTechniques = new Set();
        this.techniqueData = new Map();
        this.currentStep = 1;
        this.promptData = {
            template: null,
            basePrompt: '',
            taskDescription: '',
            outputFormat: '',
            templateFields: {}
        };
        
        // Predefined templates
        this.templates = {
            basic: {
                id: 'basic',
                name: 'Basic Prompt',
                description: 'Simple instruction-based prompt',
                template: '{task_description}\n\n{output_format}',
                fields: []
            },
            role: {
                id: 'role',
                name: 'Role-Based Prompt',
                description: 'Assign a specific role or expertise',
                template: 'You are {role_description}.\n\n{task_description}\n\n{output_format}',
                fields: ['role_description']
            },
            cot: {
                id: 'cot',
                name: 'Chain-of-Thought',
                description: 'Step-by-step reasoning approach',
                template: '{task_description}\n\nLet\'s think step by step:\n\n{output_format}',
                fields: []
            },
            fewshot: {
                id: 'fewshot',
                name: 'Few-Shot Examples',
                description: 'Provide examples before the task',
                template: 'Here are some examples:\n\n{examples}\n\nNow, {task_description}\n\n{output_format}',
                fields: ['examples']
            },
            structured: {
                id: 'structured',
                name: 'Structured Output',
                description: 'Request specific output structure',
                template: '{task_description}\n\nPlease provide your response in the following format:\n{structure}\n\n{output_format}',
                fields: ['structure']
            }
        };
    }

    async init() {
        try {
            // Load technique data
            await this.loadTechniqueData();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ Prompt Builder initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Prompt Builder:', error);
            this.showError('Failed to load technique data. Please refresh the page.');
        }
    }

    async loadTechniqueData() {
        const basePath = window.APP_CONFIG?.dataBasePath || './';
        const result = await TaxonomyDataUtils.loadDataUniversal(basePath);
        const { techniquesData } = result;
        
        // Convert to Map for easier access
        techniquesData.categories.forEach(category => {
            category.techniques.forEach(technique => {
                this.techniqueData.set(technique.id, {
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });
        
        console.log(`Loaded ${this.techniqueData.size} techniques`);
    }

    initializeUI() {
        // Initialize technique selector
        this.renderTechniqueSelector();
        
        // Initialize template selector
        this.renderTemplateSelector();
        
        // Update step indicators
        this.updateStepIndicator();
        
        // Initialize prompt preview
        this.updatePromptPreview();
    }

    renderTechniqueSelector() {
        const container = document.getElementById('technique-selector');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Group techniques by category
        const categories = new Map();
        
        this.techniqueData.forEach((technique, id) => {
            if (!categories.has(technique.categoryId)) {
                categories.set(technique.categoryId, {
                    name: technique.categoryName,
                    techniques: []
                });
            }
            categories.get(technique.categoryId).techniques.push(technique);
        });
        
        // Render each category
        categories.forEach((category, categoryId) => {
            const categorySection = document.createElement('div');
            categorySection.className = 'technique-category-section';
            categorySection.innerHTML = `
                <h3>${category.name}</h3>
                <div class="technique-list" data-category="${categoryId}">
                    ${category.techniques.map(technique => `
                        <div class="technique-selector-item">
                            <input type="checkbox" 
                                   id="technique-${technique.id}" 
                                   value="${technique.id}"
                                   ${this.selectedTechniques.has(technique.id) ? 'checked' : ''}>
                            <label for="technique-${technique.id}">${technique.name}</label>
                            <i class="fas fa-info-circle technique-info-icon" 
                               data-technique="${technique.id}" 
                               title="View details"></i>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(categorySection);
        });
    }

    renderTemplateSelector() {
        const selector = document.getElementById('template-selector');
        if (!selector) return;
        
        // Clear and add options
        selector.innerHTML = '<option value="">-- Select a template --</option>';
        
        Object.values(this.templates).forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            selector.appendChild(option);
        });
    }

    setupEventListeners() {
        // Technique selection
        document.addEventListener('change', (e) => {
            if (e.target.matches('#technique-selector input[type="checkbox"]')) {
                this.handleTechniqueToggle(e.target.value, e.target.checked);
            }
        });
        
        // Technique info
        document.addEventListener('click', (e) => {
            if (e.target.matches('.technique-info-icon')) {
                this.showTechniqueInfo(e.target.dataset.technique);
            }
        });
        
        // Template selection
        const templateSelector = document.getElementById('template-selector');
        if (templateSelector) {
            templateSelector.addEventListener('change', (e) => {
                this.selectTemplate(e.target.value);
            });
        }
        
        // Input fields
        ['base-prompt', 'task-description', 'output-format'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const key = id.replace('-', '');
                    this.promptData[key === 'baseprompt' ? 'basePrompt' : 
                                    key === 'taskdescription' ? 'taskDescription' : 
                                    'outputFormat'] = e.target.value;
                    this.updatePromptPreview();
                });
            }
        });
        
        // Navigation buttons
        this.setupNavigationButtons();
        
        // Action buttons
        document.getElementById('copy-prompt-button')?.addEventListener('click', () => {
            this.copyPrompt();
        });
        
        document.getElementById('clear-prompt-button')?.addEventListener('click', () => {
            this.clearPrompt();
        });
        
        document.getElementById('save-prompt-button')?.addEventListener('click', () => {
            this.savePrompt();
        });
        
        document.getElementById('export-prompt-button')?.addEventListener('click', () => {
            this.exportPrompt();
        });
    }

    setupNavigationButtons() {
        // Next buttons
        for (let i = 1; i <= 3; i++) {
            const btn = document.getElementById(`next-step-${i}`);
            if (btn) {
                btn.addEventListener('click', () => this.goToStep(i + 1));
            }
        }
        
        // Previous buttons
        for (let i = 2; i <= 4; i++) {
            const btn = document.getElementById(`prev-step-${i}`);
            if (btn) {
                btn.addEventListener('click', () => this.goToStep(i - 1));
            }
        }
        
        // Start over
        document.getElementById('start-over-button')?.addEventListener('click', () => {
            if (confirm('Start over? This will clear all selections.')) {
                this.clearPrompt();
                this.goToStep(1);
            }
        });
    }

    handleTechniqueToggle(techniqueId, isChecked) {
        if (isChecked) {
            this.selectedTechniques.add(techniqueId);
        } else {
            this.selectedTechniques.delete(techniqueId);
        }
        
        this.updateSelectedTechniquesDisplay();
        this.updatePromptPreview();
        this.updateNavigationState();
    }

    updateSelectedTechniquesDisplay() {
        const container = document.getElementById('selected-techniques');
        const countBadge = document.getElementById('technique-count');
        
        if (countBadge) {
            countBadge.textContent = this.selectedTechniques.size;
        }
        
        if (!container) return;
        
        if (this.selectedTechniques.size === 0) {
            container.innerHTML = '<p class="empty-state">No techniques selected. Select techniques from the list below.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="selected-techniques-list">
                ${Array.from(this.selectedTechniques).map(id => {
                    const technique = this.techniqueData.get(id);
                    return `
                        <div class="selected-technique-item">
                            <button class="remove-technique-button" data-technique="${id}">
                                <i class="fas fa-times"></i>
                            </button>
                            <span>${technique.name}</span>
                            <span class="selected-technique-category">${technique.categoryName}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add remove handlers
        container.querySelectorAll('.remove-technique-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const techniqueId = btn.dataset.technique;
                this.selectedTechniques.delete(techniqueId);
                const checkbox = document.getElementById(`technique-${techniqueId}`);
                if (checkbox) checkbox.checked = false;
                this.updateSelectedTechniquesDisplay();
                this.updatePromptPreview();
                this.updateNavigationState();
            });
        });
    }

    selectTemplate(templateId) {
        this.promptData.template = templateId ? this.templates[templateId] : null;
        
        const description = document.getElementById('template-description');
        if (description) {
            description.textContent = this.promptData.template?.description || '';
        }
        
        this.renderTemplateFields();
        this.updatePromptPreview();
        this.updateNavigationState();
    }

    renderTemplateFields() {
        const container = document.getElementById('template-fields-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.promptData.template || !this.promptData.template.fields.length) {
            return;
        }
        
        this.promptData.template.fields.forEach(field => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'input-group';
            
            const label = field.replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            fieldElement.innerHTML = `
                <label for="template-${field}">${label}:</label>
                <textarea id="template-${field}" 
                          placeholder="Enter ${label.toLowerCase()}...">${this.promptData.templateFields[field] || ''}</textarea>
            `;
            
            container.appendChild(fieldElement);
            
            // Add event listener
            const textarea = fieldElement.querySelector('textarea');
            textarea.addEventListener('input', (e) => {
                this.promptData.templateFields[field] = e.target.value;
                this.updatePromptPreview();
            });
        });
    }

    updatePromptPreview() {
        const preview = document.getElementById('prompt-preview');
        if (!preview) return;
        
        let prompt = '';
        
        // Build technique instructions
        if (this.selectedTechniques.size > 0) {
            const techniqueInstructions = this.buildTechniqueInstructions();
            if (techniqueInstructions) {
                prompt += techniqueInstructions + '\n\n';
            }
        }
        
        // Add base prompt if present
        if (this.promptData.basePrompt) {
            prompt += this.promptData.basePrompt + '\n\n';
        }
        
        // Apply template or default structure
        if (this.promptData.template) {
            let templateText = this.promptData.template.template;
            
            // Replace placeholders
            templateText = templateText.replace(/{task_description}/g, this.promptData.taskDescription || '[Task description]');
            templateText = templateText.replace(/{output_format}/g, this.promptData.outputFormat || '[Output format]');
            
            // Replace template-specific fields
            Object.entries(this.promptData.templateFields).forEach(([field, value]) => {
                templateText = templateText.replace(new RegExp(`{${field}}`, 'g'), value || `[${field}]`);
            });
            
            prompt += templateText;
        } else {
            // Default structure
            if (this.promptData.taskDescription) {
                prompt += `Task: ${this.promptData.taskDescription}\n\n`;
            }
            if (this.promptData.outputFormat) {
                prompt += `Output format: ${this.promptData.outputFormat}`;
            }
        }
        
        preview.textContent = prompt || 'Your prompt will appear here...';
        
        // Update token count
        this.updateTokenCount(prompt);
        
        // Enable/disable copy button
        const copyBtn = document.getElementById('copy-prompt-button');
        if (copyBtn) {
            copyBtn.disabled = !prompt || prompt === 'Your prompt will appear here...';
        }
    }

    buildTechniqueInstructions() {
        const instructions = [];
        
        // Check for specific techniques and add appropriate instructions
        if (this.selectedTechniques.has('chain-of-thought')) {
            instructions.push('Think through this step-by-step and show your reasoning.');
        }
        
        if (this.selectedTechniques.has('self-consistency')) {
            instructions.push('Generate multiple reasoning paths and select the most consistent answer.');
        }
        
        if (this.selectedTechniques.has('zero-shot-cot')) {
            instructions.push("Let's think about this step by step.");
        }
        
        if (this.selectedTechniques.has('tree-of-thoughts')) {
            instructions.push('Explore multiple approaches and evaluate each one.');
        }
        
        if (this.selectedTechniques.has('self-correction')) {
            instructions.push('After your initial response, review it for errors and provide a corrected version.');
        }
        
        if (this.selectedTechniques.has('role-prompting') && !this.promptData.basePrompt) {
            instructions.push('Approach this task with expert knowledge and professional insight.');
        }
        
        return instructions.join(' ');
    }

    updateTokenCount(text) {
        const counter = document.getElementById('token-count');
        if (!counter) return;
        
        // Rough estimate: ~4 chars per token
        const tokens = Math.ceil(text.length / 4);
        counter.innerHTML = `<i class="fas fa-calculator"></i> ~${tokens} tokens (${text.length} chars)`;
        
        if (tokens > 500) {
            counter.classList.add('token-count-warning');
        } else {
            counter.classList.remove('token-count-warning');
        }
    }

    goToStep(step) {
        this.currentStep = step;
        
        // Hide all steps
        document.querySelectorAll('.wizard-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show current step
        const currentContent = document.getElementById(`step-${step}-content`);
        if (currentContent) {
            currentContent.style.display = 'block';
        }
        
        // Update step indicator
        this.updateStepIndicator();
        
        // Update navigation state
        this.updateNavigationState();
    }

    updateStepIndicator() {
        // Update step classes
        document.querySelectorAll('.wizard-step').forEach(stepEl => {
            const stepNum = parseInt(stepEl.dataset.step);
            stepEl.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                stepEl.classList.add('active');
            } else if (stepNum < this.currentStep) {
                stepEl.classList.add('completed');
            }
        });
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${(this.currentStep / 4) * 100}%`;
        }
    }

    updateNavigationState() {
        // Step 1: Need at least one technique selected
        const nextStep1 = document.getElementById('next-step-1');
        if (nextStep1) {
            nextStep1.disabled = this.selectedTechniques.size === 0;
        }
        
        // Step 2: Need a template selected (optional, so always enabled)
        const nextStep2 = document.getElementById('next-step-2');
        if (nextStep2) {
            nextStep2.disabled = false;
        }
        
        // Step 3: Need task description
        const nextStep3 = document.getElementById('next-step-3');
        if (nextStep3) {
            nextStep3.disabled = !this.promptData.taskDescription;
        }
    }

    showTechniqueInfo(techniqueId) {
        const technique = this.techniqueData.get(techniqueId);
        if (!technique) return;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('technique-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'technique-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div id="technique-modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close handlers
            modal.querySelector('.close').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update content
        const modalBody = document.getElementById('technique-modal-body');
        modalBody.innerHTML = `
            <h2>${technique.name}</h2>
            <div class="technique-category">${technique.categoryName}</div>
            <p>${technique.description}</p>
            
            ${technique.useCase ? `
                <div class="technique-detail-section">
                    <h4>Use Case</h4>
                    <p>${technique.useCase}</p>
                </div>
            ` : ''}
            
            ${technique.example ? `
                <div class="technique-detail-section">
                    <h4>Example</h4>
                    <div class="example-code">${technique.example}</div>
                </div>
            ` : ''}
            
            ${technique.tips ? `
                <div class="technique-detail-section">
                    <h4>Tips</h4>
                    <p>${technique.tips}</p>
                </div>
            ` : ''}
            
            ${technique.commonMistakes ? `
                <div class="technique-detail-section">
                    <h4>Common Mistakes</h4>
                    <p>${technique.commonMistakes}</p>
                </div>
            ` : ''}
            
            <button class="button primary add-to-prompt-button" data-technique="${techniqueId}">
                ${this.selectedTechniques.has(techniqueId) ? 'Remove from Prompt' : 'Add to Prompt'}
            </button>
        `;
        
        // Add button handler
        modalBody.querySelector('.add-to-prompt-button').addEventListener('click', (e) => {
            const isSelected = this.selectedTechniques.has(techniqueId);
            this.handleTechniqueToggle(techniqueId, !isSelected);
            
            // Update checkbox
            const checkbox = document.getElementById(`technique-${techniqueId}`);
            if (checkbox) checkbox.checked = !isSelected;
            
            // Update button text
            e.target.textContent = isSelected ? 'Add to Prompt' : 'Remove from Prompt';
        });
        
        modal.style.display = 'block';
    }

    copyPrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview) return;
        
        const text = preview.textContent;
        if (text && text !== 'Your prompt will appear here...') {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-prompt-button');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }
    }

    clearPrompt() {
        // Clear selections
        this.selectedTechniques.clear();
        this.promptData = {
            template: null,
            basePrompt: '',
            taskDescription: '',
            outputFormat: '',
            templateFields: {}
        };
        
        // Clear UI
        document.querySelectorAll('#technique-selector input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.getElementById('template-selector').value = '';
        document.getElementById('base-prompt').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('output-format').value = '';
        
        // Update displays
        this.updateSelectedTechniquesDisplay();
        this.renderTemplateFields();
        this.updatePromptPreview();
        this.updateNavigationState();
    }

    savePrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview || preview.textContent === 'Your prompt will appear here...') return;
        
        const name = prompt('Enter a name for this prompt:');
        if (!name) return;
        
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        savedPrompts.push({
            name,
            prompt: preview.textContent,
            techniques: Array.from(this.selectedTechniques),
            data: this.promptData,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
        this.showMessage('Prompt saved successfully!', 'success');
    }

    exportPrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview || preview.textContent === 'Your prompt will appear here...') return;
        
        const exportData = {
            prompt: preview.textContent,
            techniques: Array.from(this.selectedTechniques).map(id => {
                const technique = this.techniqueData.get(id);
                return { id, name: technique.name };
            }),
            configuration: this.promptData,
            metadata: {
                exported: new Date().toISOString(),
                version: '2.0'
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompt-export.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    showMessage(text, type = 'info') {
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.textContent = text;
        
        const container = document.querySelector('.prompt-builder-container');
        if (container) {
            container.insertBefore(msg, container.firstChild);
            setTimeout(() => msg.remove(), 3000);
        }
    }

    showError(message) {
        console.error(message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        const container = document.getElementById('technique-selector');
        if (container) {
            container.innerHTML = '';
            container.appendChild(errorDiv);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const promptBuilder = new PromptBuilder();
    promptBuilder.init();
});