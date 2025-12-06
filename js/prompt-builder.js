/**
 * Interactive Prompt Builder v2.0
 * Modern, intelligent, and responsive prompt builder
 */

class PromptBuilder {
    constructor() {
        this.techniqueData = new Map();
        this.categories = new Map();
        this.selectedTechniques = [];
        this.activeFilter = null;
        this.searchQuery = '';
        this.currentModalTechnique = null;

        // Prompt data
        this.promptData = {
            role: '',
            task: '',
            context: '',
            output: ''
        };

        // Templates
        this.templates = [
            {
                id: 'problem-solving',
                name: 'Complex Problem Solving',
                description: 'For multi-step reasoning and analytical tasks',
                techniques: ['chain-of-thought', 'self-consistency'],
                role: 'You are an expert problem solver with deep analytical skills.',
                task: 'Analyze the following problem step by step, considering multiple approaches before arriving at a solution.',
                context: 'Think through each step carefully. If you are uncertain, explain your reasoning.',
                output: 'Provide your solution with clear step-by-step reasoning, alternative approaches considered, and confidence level.'
            },
            {
                id: 'creative-writing',
                name: 'Creative Content Generation',
                description: 'For storytelling, copywriting, and creative tasks',
                techniques: ['role-prompting', 'few-shot-learning'],
                role: 'You are an award-winning creative writer known for compelling narratives.',
                task: 'Create engaging content that captures attention and evokes emotion.',
                context: 'Focus on vivid descriptions, authentic dialogue, and narrative flow.',
                output: 'Deliver polished creative content with attention to pacing and reader engagement.'
            },
            {
                id: 'code-generation',
                name: 'Code Generation',
                description: 'For writing, reviewing, and debugging code',
                techniques: ['structured-output', 'self-correction'],
                role: 'You are a senior software engineer with expertise in clean code principles.',
                task: 'Write production-ready code that is maintainable, efficient, and well-documented.',
                context: 'Follow best practices, include error handling, and consider edge cases.',
                output: 'Provide the code with inline comments, usage examples, and complexity analysis.'
            },
            {
                id: 'research-analysis',
                name: 'Research & Analysis',
                description: 'For data analysis and research synthesis',
                techniques: ['tree-of-thoughts', 'react'],
                role: 'You are a research analyst skilled at synthesizing complex information.',
                task: 'Analyze the provided information, identify patterns, and draw evidence-based conclusions.',
                context: 'Consider multiple perspectives and acknowledge limitations in the data.',
                output: 'Present findings in a structured format with key insights, supporting evidence, and recommendations.'
            },
            {
                id: 'task-decomposition',
                name: 'Task Decomposition',
                description: 'For breaking down complex tasks into steps',
                techniques: ['step-back-prompting', 'plan-and-solve'],
                role: 'You are a project manager expert at breaking down complex initiatives.',
                task: 'Decompose the following task into manageable sub-tasks with clear dependencies.',
                context: 'Consider prerequisites, parallel work streams, and potential blockers.',
                output: 'Provide a numbered action plan with estimated complexity and dependencies noted.'
            },
            {
                id: 'learning-tutor',
                name: 'Learning & Education',
                description: 'For explaining concepts and teaching',
                techniques: ['socratic-method', 'analogical-reasoning'],
                role: 'You are an expert educator who adapts explanations to the learner\'s level.',
                task: 'Explain the concept in a clear, engaging way that builds understanding.',
                context: 'Use analogies, examples, and build from foundational concepts.',
                output: 'Provide an explanation with examples, check questions, and suggestions for deeper learning.'
            }
        ];

        // Keyword-technique mapping for intelligent suggestions
        this.keywordTechniqueMap = {
            'code': ['structured-output', 'self-correction', 'chain-of-thought'],
            'programming': ['structured-output', 'self-correction', 'chain-of-thought'],
            'debug': ['self-correction', 'chain-of-thought', 'step-back-prompting'],
            'analyze': ['tree-of-thoughts', 'chain-of-thought', 'react'],
            'analysis': ['tree-of-thoughts', 'chain-of-thought', 'react'],
            'research': ['tree-of-thoughts', 'react', 'self-consistency'],
            'write': ['role-prompting', 'few-shot-learning', 'structured-output'],
            'creative': ['role-prompting', 'few-shot-learning', 'analogical-reasoning'],
            'story': ['role-prompting', 'few-shot-learning'],
            'explain': ['chain-of-thought', 'socratic-method', 'analogical-reasoning'],
            'teach': ['socratic-method', 'analogical-reasoning', 'few-shot-learning'],
            'solve': ['chain-of-thought', 'self-consistency', 'tree-of-thoughts'],
            'problem': ['chain-of-thought', 'self-consistency', 'step-back-prompting'],
            'plan': ['plan-and-solve', 'tree-of-thoughts', 'step-back-prompting'],
            'design': ['tree-of-thoughts', 'chain-of-thought', 'structured-output'],
            'review': ['self-correction', 'chain-of-thought', 'step-back-prompting'],
            'summarize': ['chain-of-thought', 'structured-output'],
            'compare': ['tree-of-thoughts', 'chain-of-thought'],
            'decide': ['tree-of-thoughts', 'self-consistency', 'chain-of-thought'],
            'optimize': ['chain-of-thought', 'self-correction', 'step-back-prompting'],
            'refactor': ['self-correction', 'chain-of-thought', 'structured-output'],
            'brainstorm': ['tree-of-thoughts', 'analogical-reasoning', 'role-prompting'],
            'list': ['structured-output', 'chain-of-thought'],
            'json': ['structured-output'],
            'format': ['structured-output', 'few-shot-learning'],
            'step': ['chain-of-thought', 'plan-and-solve'],
            'reason': ['chain-of-thought', 'self-consistency', 'tree-of-thoughts'],
            'math': ['chain-of-thought', 'self-consistency'],
            'calculate': ['chain-of-thought', 'self-correction']
        };
    }

    async init() {
        try {
            await this.loadTechniqueData();
            this.initializeUI();
            this.setupEventListeners();
            this.loadSavedState();
            console.log('Prompt Builder v2.0 initialized');
        } catch (error) {
            console.error('Failed to initialize Prompt Builder:', error);
            this.showToast('Failed to load techniques. Please refresh.', 'error');
        }
    }

    async loadTechniqueData() {
        const basePath = window.APP_CONFIG?.dataBasePath || './';
        const result = await TaxonomyDataUtils.loadDataUniversal(basePath);
        const { techniquesData } = result;

        techniquesData.categories.forEach(category => {
            this.categories.set(category.id, {
                id: category.id,
                name: category.name,
                description: category.description
            });

            category.techniques.forEach(technique => {
                this.techniqueData.set(technique.id, {
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });

        document.getElementById('techniqueCount').textContent = this.techniqueData.size;
    }

    initializeUI() {
        this.renderCategoryFilters();
        this.renderTechniques();
        this.renderTemplates();
        this.updatePreview();
    }

    renderCategoryFilters() {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        container.innerHTML = '';

        // Add "All" filter
        const allChip = document.createElement('span');
        allChip.className = 'filter-chip active';
        allChip.textContent = 'All';
        allChip.dataset.category = 'all';
        container.appendChild(allChip);

        // Add category filters (limit to first 5 for space)
        const categoryList = Array.from(this.categories.values()).slice(0, 5);
        categoryList.forEach(category => {
            const chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.textContent = category.name;
            chip.dataset.category = category.id;
            container.appendChild(chip);
        });
    }

    renderTechniques() {
        const container = document.getElementById('techniquesContainer');
        if (!container) return;

        container.innerHTML = '';

        // Group by category
        const groupedTechniques = new Map();

        this.techniqueData.forEach((technique, id) => {
            // Apply search filter
            if (this.searchQuery) {
                const searchLower = this.searchQuery.toLowerCase();
                const matches =
                    technique.name.toLowerCase().includes(searchLower) ||
                    technique.description.toLowerCase().includes(searchLower) ||
                    (technique.useCase && technique.useCase.toLowerCase().includes(searchLower)) ||
                    technique.categoryName.toLowerCase().includes(searchLower);
                if (!matches) return;
            }

            // Apply category filter
            if (this.activeFilter && this.activeFilter !== 'all') {
                if (technique.categoryId !== this.activeFilter) return;
            }

            if (!groupedTechniques.has(technique.categoryId)) {
                groupedTechniques.set(technique.categoryId, {
                    name: technique.categoryName,
                    techniques: []
                });
            }
            groupedTechniques.get(technique.categoryId).techniques.push(technique);
        });

        if (groupedTechniques.size === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No techniques found matching your search.</p>
                </div>
            `;
            return;
        }

        groupedTechniques.forEach((group, categoryId) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-group';
            categoryDiv.innerHTML = `
                <div class="category-header">
                    <span class="category-title">
                        ${group.name}
                        <span class="category-count">(${group.techniques.length})</span>
                    </span>
                    <i class="fas fa-chevron-down category-toggle"></i>
                </div>
                <div class="technique-items">
                    ${group.techniques.map(t => this.renderTechniqueItem(t)).join('')}
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    renderTechniqueItem(technique) {
        const isSelected = this.selectedTechniques.includes(technique.id);
        const briefDesc = technique.description.length > 60
            ? technique.description.substring(0, 60) + '...'
            : technique.description;

        return `
            <div class="technique-item ${isSelected ? 'selected' : ''}" data-technique-id="${technique.id}">
                <div class="technique-checkbox">
                    ${isSelected ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="technique-content">
                    <div class="technique-name">${technique.name}</div>
                    <div class="technique-brief">${briefDesc}</div>
                </div>
                <i class="fas fa-info-circle technique-info-btn" data-technique-id="${technique.id}"></i>
            </div>
        `;
    }

    renderSelectedTechniques() {
        const strip = document.getElementById('selectedStrip');
        const list = document.getElementById('selectedTechniquesList');

        if (this.selectedTechniques.length === 0) {
            strip.classList.remove('has-items');
            return;
        }

        strip.classList.add('has-items');
        list.innerHTML = this.selectedTechniques.map(id => {
            const technique = this.techniqueData.get(id);
            if (!technique) return '';
            return `
                <div class="selected-tag" data-technique-id="${id}" draggable="true">
                    ${technique.name}
                    <span class="remove-btn" data-technique-id="${id}">
                        <i class="fas fa-times"></i>
                    </span>
                </div>
            `;
        }).join('');

        // Update technique count in stats
        document.querySelector('#techniqueStat .stat-value').textContent = this.selectedTechniques.length;
    }

    renderTemplates() {
        const container = document.getElementById('templatesGrid');
        if (!container) return;

        container.innerHTML = this.templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-card-header">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
                <div class="template-card-body">
                    <div class="template-techniques">
                        ${template.techniques.map(t => {
                            const tech = this.techniqueData.get(t);
                            return tech ? `<span class="template-technique-tag">${tech.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('techniqueSearch');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = e.target.value;
                    this.renderTechniques();
                }, 200);
            });
        }

        // Category filters
        document.getElementById('categoryFilters')?.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.activeFilter = chip.dataset.category;
            this.renderTechniques();
        });

        // Technique selection
        document.getElementById('techniquesContainer')?.addEventListener('click', (e) => {
            // Category toggle
            const categoryHeader = e.target.closest('.category-header');
            if (categoryHeader) {
                categoryHeader.closest('.category-group').classList.toggle('collapsed');
                return;
            }

            // Info button
            const infoBtn = e.target.closest('.technique-info-btn');
            if (infoBtn) {
                e.stopPropagation();
                this.showTechniqueModal(infoBtn.dataset.techniqueId);
                return;
            }

            // Technique selection
            const item = e.target.closest('.technique-item');
            if (item) {
                this.toggleTechnique(item.dataset.techniqueId);
            }
        });

        // Selected techniques - remove
        document.getElementById('selectedTechniquesList')?.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                this.toggleTechnique(removeBtn.dataset.techniqueId);
            }
        });

        // Drag and drop for selected techniques
        this.setupDragAndDrop();

        // Tab navigation
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.tab}Panel`).classList.add('active');
            });
        });

        // Prompt inputs
        ['roleInput', 'taskInput', 'contextInput', 'outputInput'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const key = id.replace('Input', '');
                    this.promptData[key] = e.target.value;
                    this.updateCharCount(id, e.target.value.length);
                    this.updatePreview();
                    this.generateSuggestions();
                });
            }
        });

        // Action buttons
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyPrompt());
        document.getElementById('saveBtn')?.addEventListener('click', () => this.savePrompt());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportPrompt());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAll());

        // Modal
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalCloseBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalAddBtn')?.addEventListener('click', () => {
            if (this.currentModalTechnique) {
                this.toggleTechnique(this.currentModalTechnique);
                this.closeModal();
            }
        });
        document.getElementById('techniqueModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'techniqueModal') this.closeModal();
        });

        // Templates
        document.getElementById('templatesGrid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (card) {
                this.loadTemplate(card.dataset.templateId);
            }
        });

        // Saved prompts drawer
        document.getElementById('savedPromptsBtn')?.addEventListener('click', () => this.openDrawer());
        document.getElementById('closeDrawer')?.addEventListener('click', () => this.closeDrawer());
        document.getElementById('drawerOverlay')?.addEventListener('click', () => this.closeDrawer());

        // AI suggestions
        document.getElementById('suggestionList')?.addEventListener('click', (e) => {
            const chip = e.target.closest('.ai-suggestion-chip');
            if (chip) {
                this.toggleTechnique(chip.dataset.techniqueId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDrawer();
            }
        });
    }

    setupDragAndDrop() {
        const list = document.getElementById('selectedTechniquesList');
        if (!list) return;

        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            const tag = e.target.closest('.selected-tag');
            if (tag) {
                draggedItem = tag;
                tag.style.opacity = '0.5';
            }
        });

        list.addEventListener('dragend', (e) => {
            const tag = e.target.closest('.selected-tag');
            if (tag) {
                tag.style.opacity = '1';
            }
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const tag = e.target.closest('.selected-tag');
            if (tag && tag !== draggedItem) {
                const rect = tag.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                if (e.clientX < midpoint) {
                    tag.style.borderLeft = '2px solid var(--primary)';
                    tag.style.borderRight = '';
                } else {
                    tag.style.borderRight = '2px solid var(--primary)';
                    tag.style.borderLeft = '';
                }
            }
        });

        list.addEventListener('dragleave', (e) => {
            const tag = e.target.closest('.selected-tag');
            if (tag) {
                tag.style.borderLeft = '';
                tag.style.borderRight = '';
            }
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            const tag = e.target.closest('.selected-tag');
            if (tag && draggedItem && tag !== draggedItem) {
                const draggedId = draggedItem.dataset.techniqueId;
                const targetId = tag.dataset.techniqueId;

                const draggedIndex = this.selectedTechniques.indexOf(draggedId);
                const targetIndex = this.selectedTechniques.indexOf(targetId);

                this.selectedTechniques.splice(draggedIndex, 1);

                const rect = tag.getBoundingClientRect();
                const midpoint = rect.left + rect.width / 2;
                if (e.clientX < midpoint) {
                    this.selectedTechniques.splice(targetIndex, 0, draggedId);
                } else {
                    this.selectedTechniques.splice(targetIndex + 1, 0, draggedId);
                }

                tag.style.borderLeft = '';
                tag.style.borderRight = '';

                this.renderSelectedTechniques();
                this.updatePreview();
            }
        });
    }

    toggleTechnique(techniqueId) {
        const index = this.selectedTechniques.indexOf(techniqueId);
        if (index === -1) {
            this.selectedTechniques.push(techniqueId);
            this.showToast(`Added: ${this.techniqueData.get(techniqueId)?.name}`, 'success');
        } else {
            this.selectedTechniques.splice(index, 1);
        }

        this.renderTechniques();
        this.renderSelectedTechniques();
        this.updatePreview();
    }

    updateCharCount(inputId, count) {
        const counterId = inputId.replace('Input', 'Count');
        const counter = document.getElementById(counterId);
        if (counter) {
            counter.textContent = count;
        }
    }

    generateSuggestions() {
        const taskText = (this.promptData.task + ' ' + this.promptData.role).toLowerCase();
        const suggestionSet = new Set();

        Object.entries(this.keywordTechniqueMap).forEach(([keyword, techniques]) => {
            if (taskText.includes(keyword)) {
                techniques.forEach(t => {
                    if (!this.selectedTechniques.includes(t) && this.techniqueData.has(t)) {
                        suggestionSet.add(t);
                    }
                });
            }
        });

        const suggestions = Array.from(suggestionSet).slice(0, 5);
        const container = document.getElementById('aiSuggestions');
        const list = document.getElementById('suggestionList');

        if (suggestions.length === 0) {
            container.classList.remove('visible');
            return;
        }

        container.classList.add('visible');
        list.innerHTML = suggestions.map(id => {
            const technique = this.techniqueData.get(id);
            return `
                <div class="ai-suggestion-chip" data-technique-id="${id}">
                    <i class="fas fa-plus"></i>
                    ${technique.name}
                </div>
            `;
        }).join('');
    }

    updatePreview() {
        const preview = document.getElementById('previewContent');
        if (!preview) return;

        let promptParts = [];

        // Role/Persona
        if (this.promptData.role.trim()) {
            promptParts.push(this.promptData.role.trim());
        }

        // Selected techniques instructions
        if (this.selectedTechniques.length > 0) {
            const techniqueInstructions = this.selectedTechniques.map(id => {
                const technique = this.techniqueData.get(id);
                if (!technique) return '';
                return `[${technique.name}]: ${technique.description}`;
            }).filter(Boolean);

            if (techniqueInstructions.length > 0) {
                promptParts.push('Apply the following techniques:\n' + techniqueInstructions.join('\n'));
            }
        }

        // Task
        if (this.promptData.task.trim()) {
            promptParts.push('Task: ' + this.promptData.task.trim());
        }

        // Context
        if (this.promptData.context.trim()) {
            promptParts.push('Context/Constraints: ' + this.promptData.context.trim());
        }

        // Output format
        if (this.promptData.output.trim()) {
            promptParts.push('Output Format: ' + this.promptData.output.trim());
        }

        const fullPrompt = promptParts.join('\n\n');

        if (!fullPrompt) {
            preview.innerHTML = '<span class="preview-placeholder">Start typing or select techniques to see your prompt...</span>';
            document.getElementById('copyBtn').disabled = true;
        } else {
            preview.textContent = fullPrompt;
            document.getElementById('copyBtn').disabled = false;
        }

        // Update stats
        this.updateStats(fullPrompt);
        this.updateQualityScore();
    }

    updateStats(text) {
        const chars = text.length;
        const tokens = Math.ceil(chars / 4);

        document.querySelector('#charStat .stat-value').textContent = chars.toLocaleString();
        document.querySelector('#tokenStat .stat-value').textContent = tokens.toLocaleString();
        document.querySelector('#techniqueStat .stat-value').textContent = this.selectedTechniques.length;

        // Add warning class for high token counts
        const tokenStat = document.getElementById('tokenStat');
        tokenStat.classList.remove('warning', 'danger');
        if (tokens > 2000) {
            tokenStat.classList.add('danger');
        } else if (tokens > 1000) {
            tokenStat.classList.add('warning');
        }
    }

    updateQualityScore() {
        let score = 0;
        const maxScore = 100;

        // Role defined (20 points)
        if (this.promptData.role.trim().length > 20) score += 20;
        else if (this.promptData.role.trim().length > 0) score += 10;

        // Task defined (30 points)
        if (this.promptData.task.trim().length > 50) score += 30;
        else if (this.promptData.task.trim().length > 20) score += 20;
        else if (this.promptData.task.trim().length > 0) score += 10;

        // Context provided (15 points)
        if (this.promptData.context.trim().length > 30) score += 15;
        else if (this.promptData.context.trim().length > 0) score += 8;

        // Output format specified (15 points)
        if (this.promptData.output.trim().length > 20) score += 15;
        else if (this.promptData.output.trim().length > 0) score += 8;

        // Techniques selected (20 points)
        if (this.selectedTechniques.length >= 3) score += 20;
        else if (this.selectedTechniques.length >= 2) score += 15;
        else if (this.selectedTechniques.length >= 1) score += 10;

        const percentage = Math.min(score, maxScore);
        const fill = document.getElementById('qualityFill');
        const scoreEl = document.getElementById('qualityScore');

        fill.style.width = `${percentage}%`;
        scoreEl.textContent = `${percentage}%`;

        // Color based on score
        if (percentage >= 80) {
            fill.style.background = 'var(--success)';
            scoreEl.style.color = 'var(--success)';
        } else if (percentage >= 50) {
            fill.style.background = 'var(--warning)';
            scoreEl.style.color = 'var(--warning)';
        } else {
            fill.style.background = 'var(--danger)';
            scoreEl.style.color = 'var(--danger)';
        }
    }

    showTechniqueModal(techniqueId) {
        const technique = this.techniqueData.get(techniqueId);
        if (!technique) return;

        this.currentModalTechnique = techniqueId;

        document.getElementById('modalTechniqueName').textContent = technique.name;
        document.getElementById('modalCategoryName').textContent = technique.categoryName;

        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <div class="modal-section">
                <h4><i class="fas fa-info-circle"></i> Description</h4>
                <p>${technique.description}</p>
            </div>
            ${technique.useCase ? `
                <div class="modal-section">
                    <h4><i class="fas fa-bullseye"></i> Use Cases</h4>
                    <p>${technique.useCase}</p>
                </div>
            ` : ''}
            ${technique.example ? `
                <div class="modal-section">
                    <h4><i class="fas fa-code"></i> Example</h4>
                    <div class="example-block">${technique.example}</div>
                </div>
            ` : ''}
            ${technique.tips ? `
                <div class="modal-section">
                    <h4><i class="fas fa-lightbulb"></i> Tips</h4>
                    <p>${technique.tips}</p>
                </div>
            ` : ''}
            ${technique.relatedTechniques && technique.relatedTechniques.length > 0 ? `
                <div class="modal-section">
                    <h4><i class="fas fa-link"></i> Related Techniques</h4>
                    <div class="related-techniques-grid">
                        ${technique.relatedTechniques.map(id => {
                            const related = this.techniqueData.get(id);
                            return related ? `<span class="related-technique-chip" data-technique-id="${id}">${related.name}</span>` : '';
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        // Update add button
        const addBtn = document.getElementById('modalAddBtn');
        const isSelected = this.selectedTechniques.includes(techniqueId);
        addBtn.innerHTML = isSelected
            ? '<i class="fas fa-check"></i> Added'
            : '<i class="fas fa-plus"></i> Add to Prompt';
        addBtn.classList.toggle('btn-success', isSelected);
        addBtn.classList.toggle('btn-primary', !isSelected);

        document.getElementById('techniqueModal').classList.add('visible');
    }

    closeModal() {
        document.getElementById('techniqueModal').classList.remove('visible');
        this.currentModalTechnique = null;
    }

    loadTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // Clear current selections
        this.selectedTechniques = [];

        // Load template data
        this.promptData.role = template.role;
        this.promptData.task = template.task;
        this.promptData.context = template.context;
        this.promptData.output = template.output;

        // Update inputs
        document.getElementById('roleInput').value = template.role;
        document.getElementById('taskInput').value = template.task;
        document.getElementById('contextInput').value = template.context;
        document.getElementById('outputInput').value = template.output;

        // Update char counts
        this.updateCharCount('roleInput', template.role.length);
        this.updateCharCount('taskInput', template.task.length);
        this.updateCharCount('contextInput', template.context.length);
        this.updateCharCount('outputInput', template.output.length);

        // Select techniques
        template.techniques.forEach(id => {
            if (this.techniqueData.has(id)) {
                this.selectedTechniques.push(id);
            }
        });

        // Switch to compose tab
        document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('[data-tab="compose"]').classList.add('active');
        document.getElementById('composePanel').classList.add('active');

        // Update UI
        this.renderTechniques();
        this.renderSelectedTechniques();
        this.updatePreview();

        this.showToast(`Loaded template: ${template.name}`, 'success');
    }

    async copyPrompt() {
        const preview = document.getElementById('previewContent');
        const text = preview.textContent;

        if (!text || text.includes('Start typing')) {
            this.showToast('Nothing to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            const btn = document.getElementById('copyBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-primary');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
            }, 2000);

            this.showToast('Prompt copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'error');
        }
    }

    savePrompt() {
        const preview = document.getElementById('previewContent');
        const text = preview.textContent;

        if (!text || text.includes('Start typing')) {
            this.showToast('Nothing to save', 'error');
            return;
        }

        const name = prompt('Enter a name for this prompt:');
        if (!name) return;

        const savedPrompts = JSON.parse(localStorage.getItem('promptBuilder_saved') || '[]');
        savedPrompts.unshift({
            id: Date.now(),
            name,
            prompt: text,
            data: { ...this.promptData },
            techniques: [...this.selectedTechniques],
            timestamp: new Date().toISOString()
        });

        // Keep only last 20
        if (savedPrompts.length > 20) {
            savedPrompts.pop();
        }

        localStorage.setItem('promptBuilder_saved', JSON.stringify(savedPrompts));
        this.showToast('Prompt saved!', 'success');
    }

    exportPrompt() {
        const preview = document.getElementById('previewContent');
        const text = preview.textContent;

        if (!text || text.includes('Start typing')) {
            this.showToast('Nothing to export', 'error');
            return;
        }

        const exportData = {
            prompt: text,
            configuration: { ...this.promptData },
            techniques: this.selectedTechniques.map(id => {
                const t = this.techniqueData.get(id);
                return t ? { id, name: t.name } : null;
            }).filter(Boolean),
            metadata: {
                exported: new Date().toISOString(),
                version: '2.0'
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Prompt exported!', 'success');
    }

    clearAll() {
        if (!confirm('Clear all inputs and selections?')) return;

        this.promptData = { role: '', task: '', context: '', output: '' };
        this.selectedTechniques = [];

        document.getElementById('roleInput').value = '';
        document.getElementById('taskInput').value = '';
        document.getElementById('contextInput').value = '';
        document.getElementById('outputInput').value = '';

        ['role', 'task', 'context', 'output'].forEach(key => {
            this.updateCharCount(`${key}Input`, 0);
        });

        this.renderTechniques();
        this.renderSelectedTechniques();
        this.updatePreview();
        document.getElementById('aiSuggestions').classList.remove('visible');

        this.showToast('All cleared', 'info');
    }

    openDrawer() {
        const savedPrompts = JSON.parse(localStorage.getItem('promptBuilder_saved') || '[]');
        const list = document.getElementById('savedPromptsList');

        if (savedPrompts.length === 0) {
            list.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-bookmark"></i>
                    <p>No saved prompts yet.<br>Save your first prompt to see it here.</p>
                </div>
            `;
        } else {
            list.innerHTML = savedPrompts.map(p => `
                <div class="saved-prompt-item" data-prompt-id="${p.id}">
                    <div class="saved-prompt-name">${p.name}</div>
                    <div class="saved-prompt-date">${new Date(p.timestamp).toLocaleDateString()}</div>
                    <div class="saved-prompt-preview">${p.prompt.substring(0, 100)}...</div>
                </div>
            `).join('');

            // Add click handlers
            list.querySelectorAll('.saved-prompt-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.promptId);
                    const prompt = savedPrompts.find(p => p.id === id);
                    if (prompt) {
                        this.loadSavedPrompt(prompt);
                        this.closeDrawer();
                    }
                });
            });
        }

        document.getElementById('savedDrawer').classList.add('open');
        document.getElementById('drawerOverlay').classList.add('visible');
    }

    closeDrawer() {
        document.getElementById('savedDrawer').classList.remove('open');
        document.getElementById('drawerOverlay').classList.remove('visible');
    }

    loadSavedPrompt(prompt) {
        this.promptData = { ...prompt.data };
        this.selectedTechniques = [...prompt.techniques];

        document.getElementById('roleInput').value = prompt.data.role || '';
        document.getElementById('taskInput').value = prompt.data.task || '';
        document.getElementById('contextInput').value = prompt.data.context || '';
        document.getElementById('outputInput').value = prompt.data.output || '';

        Object.entries(prompt.data).forEach(([key, value]) => {
            this.updateCharCount(`${key}Input`, (value || '').length);
        });

        this.renderTechniques();
        this.renderSelectedTechniques();
        this.updatePreview();

        this.showToast(`Loaded: ${prompt.name}`, 'success');
    }

    loadSavedState() {
        // Auto-save state on changes
        const autoSave = () => {
            localStorage.setItem('promptBuilder_state', JSON.stringify({
                promptData: this.promptData,
                selectedTechniques: this.selectedTechniques
            }));
        };

        // Debounced auto-save
        let saveTimer;
        const debouncedSave = () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(autoSave, 500);
        };

        // Add to update methods
        const originalUpdate = this.updatePreview.bind(this);
        this.updatePreview = () => {
            originalUpdate();
            debouncedSave();
        };

        // Restore state
        try {
            const saved = JSON.parse(localStorage.getItem('promptBuilder_state') || '{}');
            if (saved.promptData) {
                this.promptData = saved.promptData;
                document.getElementById('roleInput').value = saved.promptData.role || '';
                document.getElementById('taskInput').value = saved.promptData.task || '';
                document.getElementById('contextInput').value = saved.promptData.context || '';
                document.getElementById('outputInput').value = saved.promptData.output || '';

                Object.entries(saved.promptData).forEach(([key, value]) => {
                    this.updateCharCount(`${key}Input`, (value || '').length);
                });
            }
            if (saved.selectedTechniques) {
                this.selectedTechniques = saved.selectedTechniques.filter(id => this.techniqueData.has(id));
                this.renderSelectedTechniques();
            }
            this.renderTechniques();
            this.updatePreview();
        } catch (e) {
            console.warn('Could not restore saved state', e);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.promptBuilder = new PromptBuilder();
    window.promptBuilder.init();
});
