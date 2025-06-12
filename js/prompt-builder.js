/**
 * Interactive Prompt Builder for Prompt Engineering Taxonomy
 * Side-by-side layout with live editing
 */

class PromptBuilder {
    constructor() {
        this.selectedTechniques = new Set();
        this.techniqueData = new Map();
        this.promptData = {
            basePrompt: '',
            taskDescription: '',
            outputFormat: ''
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
        
        // Initialize prompt preview
        this.updatePromptPreview();
        
        // Update selected techniques display
        this.updateSelectedTechniquesDisplay();
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
                        <div class="technique-selector-item" data-technique-id="${technique.id}">
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

    setupEventListeners() {
        // Technique selection
        document.addEventListener('change', (e) => {
            if (e.target.matches('#technique-selector input[type="checkbox"]')) {
                this.handleTechniqueToggle(e.target.value, e.target.checked);
                // Update visual state of the selector item
                const item = e.target.closest('.technique-selector-item');
                if (item) {
                    item.classList.toggle('selected', e.target.checked);
                }
            }
        });
        
        // Technique info
        document.addEventListener('click', (e) => {
            if (e.target.matches('.technique-info-icon')) {
                this.showTechniqueInfo(e.target.dataset.technique);
            }
        });
        
        // Input fields - live updating
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
        
        // Action buttons
        document.getElementById('copy-prompt-button')?.addEventListener('click', () => {
            this.copyPrompt();
        });
        
        document.getElementById('clear-all-button')?.addEventListener('click', () => {
            this.clearAll();
        });
        
        document.getElementById('save-prompt-button')?.addEventListener('click', () => {
            this.savePrompt();
        });
        
        document.getElementById('export-prompt-button')?.addEventListener('click', () => {
            this.exportPrompt();
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
    }

    updateSelectedTechniquesDisplay() {
        const countBadge = document.getElementById('technique-count');
        const summaryContainer = document.getElementById('selected-techniques-summary');
        const listContainer = document.getElementById('selected-techniques-list');
        
        // Update count badge
        if (countBadge) {
            countBadge.textContent = this.selectedTechniques.size;
        }
        
        // Show/hide summary section
        if (summaryContainer) {
            if (this.selectedTechniques.size === 0) {
                summaryContainer.style.display = 'none';
            } else {
                summaryContainer.style.display = 'block';
            }
        }
        
        // Update selected techniques list
        if (listContainer) {
            if (this.selectedTechniques.size === 0) {
                listContainer.innerHTML = '';
            } else {
                listContainer.innerHTML = Array.from(this.selectedTechniques).map(id => {
                    const technique = this.techniqueData.get(id);
                    return `
                        <div class="selected-technique-tag">
                            <span>${technique.name}</span>
                            <button class="remove-technique" data-technique="${id}" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }).join('');
                
                // Add remove handlers
                listContainer.querySelectorAll('.remove-technique').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const techniqueId = btn.dataset.technique;
                        this.selectedTechniques.delete(techniqueId);
                        const checkbox = document.getElementById(`technique-${techniqueId}`);
                        if (checkbox) {
                            checkbox.checked = false;
                            // Update visual state
                            const item = checkbox.closest('.technique-selector-item');
                            if (item) {
                                item.classList.remove('selected');
                            }
                        }
                        this.updateSelectedTechniquesDisplay();
                        this.updatePromptPreview();
                    });
                });
            }
        }
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
        if (this.promptData.basePrompt.trim()) {
            prompt += this.promptData.basePrompt.trim() + '\n\n';
        }
        
        // Add task description
        if (this.promptData.taskDescription.trim()) {
            prompt += this.promptData.taskDescription.trim() + '\n\n';
        }
        
        // Add output format
        if (this.promptData.outputFormat.trim()) {
            prompt += 'Output format: ' + this.promptData.outputFormat.trim();
        }
        
        // Set the preview content
        const finalPrompt = prompt.trim() || 'Select techniques and fill in the fields above to see your prompt here...';
        preview.textContent = finalPrompt;
        
        // Update token count
        this.updateTokenCount(finalPrompt);
        
        // Enable/disable copy button
        const copyBtn = document.getElementById('copy-prompt-button');
        if (copyBtn) {
            copyBtn.disabled = !prompt.trim();
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
        
        if (this.selectedTechniques.has('role-prompting') && !this.promptData.basePrompt.trim()) {
            instructions.push('Approach this task with expert knowledge and professional insight.');
        }
        
        if (this.selectedTechniques.has('few-shot-learning')) {
            instructions.push('Learn from the examples provided and apply similar patterns.');
        }
        
        if (this.selectedTechniques.has('react')) {
            instructions.push('Use reasoning and acting in an interleaved manner.');
        }
        
        return instructions.join(' ');
    }

    updateTokenCount(text) {
        const counter = document.getElementById('token-count');
        if (!counter) return;
        
        // Rough estimate: ~4 chars per token
        const tokens = Math.ceil(text.length / 4);
        counter.innerHTML = `<i class="fas fa-calculator"></i> ~${tokens} tokens`;
        
        if (tokens > 500) {
            counter.classList.add('token-count-warning');
        } else {
            counter.classList.remove('token-count-warning');
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
            <div class="technique-category" style="color: #666; margin-bottom: 16px; font-style: italic;">${technique.categoryName}</div>
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
            if (checkbox) {
                checkbox.checked = !isSelected;
                // Update visual state
                const item = checkbox.closest('.technique-selector-item');
                if (item) {
                    item.classList.toggle('selected', !isSelected);
                }
            }
            
            // Update button text
            e.target.textContent = isSelected ? 'Add to Prompt' : 'Remove from Prompt';
        });
        
        modal.style.display = 'block';
    }

    copyPrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview) return;
        
        const text = preview.textContent;
        if (text && text !== 'Select techniques and fill in the fields above to see your prompt here...') {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-prompt-button');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.style.background = '#38a169';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                this.showMessage('Failed to copy to clipboard', 'error');
            });
        }
    }

    clearAll() {
        if (confirm('Clear all selections and inputs? This action cannot be undone.')) {
            // Clear selections
            this.selectedTechniques.clear();
            this.promptData = {
                basePrompt: '',
                taskDescription: '',
                outputFormat: ''
            };
            
            // Clear UI
            document.querySelectorAll('#technique-selector input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                const item = cb.closest('.technique-selector-item');
                if (item) {
                    item.classList.remove('selected');
                }
            });
            
            document.getElementById('base-prompt').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('output-format').value = '';
            
            // Update displays
            this.updateSelectedTechniquesDisplay();
            this.updatePromptPreview();
            
            this.showMessage('All cleared successfully', 'info');
        }
    }

    savePrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview || preview.textContent === 'Select techniques and fill in the fields above to see your prompt here...') {
            this.showMessage('No prompt to save', 'error');
            return;
        }
        
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
        if (!preview || preview.textContent === 'Select techniques and fill in the fields above to see your prompt here...') {
            this.showMessage('No prompt to export', 'error');
            return;
        }
        
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
        
        this.showMessage('Prompt exported successfully!', 'success');
    }

    showMessage(text, type = 'info') {
        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            msg.style.background = '#e6f7e6';
            msg.style.color = '#276749';
            msg.style.border = '1px solid #38a169';
        } else if (type === 'error') {
            msg.style.background = '#fde8e8';
            msg.style.color = '#c53030';
            msg.style.border = '1px solid #e53e3e';
        } else {
            msg.style.background = '#e6f0ff';
            msg.style.color = '#2b6cb0';
            msg.style.border = '1px solid #4299e1';
        }
        
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }

    showError(message) {
        console.error(message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorDiv.style.cssText = `
            padding: 20px;
            text-align: center;
            color: #c53030;
            background: #fde8e8;
            border: 1px solid #e53e3e;
            border-radius: 8px;
            margin: 20px;
        `;
        
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