/**
 * Interactive Prompt Builder for Prompt Engineering Taxonomy
 * Side-by-side layout with live editing
 */

class PromptBuilder {
    constructor() {
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
                        <div class="technique-reference-item" data-technique-id="${technique.id}">
                            <span class="technique-name">${technique.name}</span>
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
        // Technique reference - clicking anywhere on the item shows info
        document.addEventListener('click', (e) => {
            // Check if clicked on technique item or info icon
            const techniqueItem = e.target.closest('.technique-reference-item');
            if (techniqueItem) {
                const techniqueId = techniqueItem.dataset.techniqueId;
                this.showTechniqueInfo(techniqueId);
                return;
            }
            
            // Direct click on info icon
            if (e.target.matches('.technique-info-icon')) {
                this.showTechniqueInfo(e.target.dataset.technique);
                return;
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

    updatePromptPreview() {
        const preview = document.getElementById('prompt-preview');
        if (!preview) return;
        
        let prompt = '';
        
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
        const finalPrompt = prompt.trim() || 'Fill in the fields above to see your prompt here...';
        preview.textContent = finalPrompt;
        
        // Update token count
        this.updateTokenCount(finalPrompt);
        
        // Enable/disable copy button
        const copyBtn = document.getElementById('copy-prompt-button');
        if (copyBtn) {
            copyBtn.disabled = !prompt.trim();
        }
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
            
        `;
        
        modal.style.display = 'block';
    }

    copyPrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview) return;
        
        const text = preview.textContent;
        if (text && text !== 'Fill in the fields above to see your prompt here...') {
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
        if (confirm('Clear all inputs? This action cannot be undone.')) {
            // Clear prompt data
            this.promptData = {
                basePrompt: '',
                taskDescription: '',
                outputFormat: ''
            };
            
            // Clear UI inputs
            document.getElementById('base-prompt').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('output-format').value = '';
            
            // Update display
            this.updatePromptPreview();
            
            this.showMessage('All cleared successfully', 'info');
        }
    }

    savePrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview || preview.textContent === 'Fill in the fields above to see your prompt here...') {
            this.showMessage('No prompt to save', 'error');
            return;
        }
        
        const name = prompt('Enter a name for this prompt:');
        if (!name) return;
        
        const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        savedPrompts.push({
            name,
            prompt: preview.textContent,
            data: this.promptData,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
        this.showMessage('Prompt saved successfully!', 'success');
    }

    exportPrompt() {
        const preview = document.getElementById('prompt-preview');
        if (!preview || preview.textContent === 'Fill in the fields above to see your prompt here...') {
            this.showMessage('No prompt to export', 'error');
            return;
        }
        
        const exportData = {
            prompt: preview.textContent,
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