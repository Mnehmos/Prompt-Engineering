/**
 * Data Loader for Prompt Engineering Taxonomy
 * Handles loading and displaying technique data
 */

class TaxonomyDataLoader {
    constructor() {
        this.categoriesData = null;
        this.techniquesData = null;
        this.currentView = 'cards'; // Default view: 'cards' or 'list'
        this.currentCategory = null; // Selected category
        this.searchTerm = ''; // Current search term
        // Removed activeCardIndex property as we're showing all cards at once
    }

    /**
     * Initialize the data loader
     */
    async init() {
        try {
            // Load data from JSON files
            await this.loadData();

            // Initialize UI components
            this.initSearch();
            this.initCategoryButtons();
            this.initViewToggle();
            this.initModalHandlers();

            // Display all techniques initially
            this.displayTechniques();

            // Update URL based on initial state
            this.updateURLFromState();

            // Listen for URL changes (history navigation)
            window.addEventListener('popstate', this.handleURLChange.bind(this));
        } catch (error) {
            console.error('Error initializing taxonomy data:', error);
            this.showError('Failed to load taxonomy data. Please try refreshing the page.');
        }
    }

    /**
     * Load techniques and categories data from JSON files
     */
    async loadData() {
        try {
            // Use the utility function to load data with multiple fallback methods
            const basePath = window.APP_CONFIG?.dataBasePath || './';
            const result = await TaxonomyDataUtils.loadDataUniversal(basePath);
            this.categoriesData = result.categoriesData;
            this.techniquesData = result.techniquesData;
            
            console.log(`✅ Successfully loaded complete taxonomy: ${this.categoriesData.categories.length} categories, ${TaxonomyDataUtils.countTechniques(this.techniquesData)} techniques`);
            
            // Check if URL contains search or category parameters
            this.loadStateFromURL();
        } catch (error) {
            console.error('❌ Failed to load taxonomy data:', error);
            this.showError(`Failed to load taxonomy data: ${error.message}. Please ensure the JSON files are accessible.`);
            throw error;
        }
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.getElementById('technique-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim().toLowerCase();
            this.displayTechniques();
            this.updateURLFromState();
            
            // Show/hide clear button
            const clearButton = document.querySelector('.clear-search');
            if (clearButton) {
                clearButton.style.display = this.searchTerm ? 'block' : 'none';
            }
        });
        
        // Clear search button
        const clearButton = document.querySelector('.clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.displayTechniques();
                this.updateURLFromState();
                clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize category filter buttons
     */
    /**
     * Initialize category filter buttons.
     * Ensures that filter buttons' data-category attributes match the category IDs in categoriesData.
     * If a mismatch is detected, a warning is logged to the console.
     */
    initCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-button');
        if (categoryButtons.length === 0) return;

        // Build a set of valid category IDs from the loaded data
        const validCategoryIds = new Set(
            (this.categoriesData?.categories || []).map(cat => cat.id)
        );

        // Check for mismatches between button data-category and known category IDs
        categoryButtons.forEach(btn => {
            if (!validCategoryIds.has(btn.dataset.category)) {
                console.warn(
                    `[TaxonomyDataLoader] Category button with data-category="${btn.dataset.category}" does not match any known category ID.`
                );
            }
        });

        // Helper to update active class on all buttons
        const updateActiveCategoryButtons = () => {
            categoryButtons.forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle current selection
                if (button.dataset.category === this.currentCategory) {
                    this.currentCategory = null; // Deselect
                } else {
                    this.currentCategory = button.dataset.category;
                }
                updateActiveCategoryButtons();
                this.displayTechniques();
                this.updateURLFromState();
            });
        });

        // Set initial active state based on currentCategory
        updateActiveCategoryButtons();

        // Reset filters button
        const resetFiltersButton = document.getElementById('reset-filters');
        if (resetFiltersButton) {
            resetFiltersButton.addEventListener('click', () => {
                // Clear search
                const searchInput = document.getElementById('technique-search');
                if (searchInput) searchInput.value = '';
                this.searchTerm = '';

                // Clear category selection
                this.currentCategory = null;
                updateActiveCategoryButtons();

                this.displayTechniques();
                this.updateURLFromState();

                const clearButton = document.querySelector('.clear-search');
                if (clearButton) clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize view toggle (cards/list)
     */
    initViewToggle() {
        const cardViewButton = document.getElementById('card-view-toggle');
        const listViewButton = document.getElementById('list-view-toggle');
        
        if (!cardViewButton || !listViewButton) return;
        
        // Set initial state
        if (this.currentView === 'cards') {
            cardViewButton.classList.add('active');
        } else {
            listViewButton.classList.add('active');
        }
        
        // Card view toggle
        cardViewButton.addEventListener('click', () => {
            this.currentView = 'cards';
            cardViewButton.classList.add('active');
            listViewButton.classList.remove('active');
            this.displayTechniques();
        });
        
        // List view toggle
        listViewButton.addEventListener('click', () => {
            this.currentView = 'list';
            listViewButton.classList.add('active');
            cardViewButton.classList.remove('active');
            this.displayTechniques();
        });
    }

    /**
     * Initialize modal handlers for technique details
     */
    initModalHandlers() {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;
        
        // Close button
        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close when clicking outside the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close on escape key
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Get filtered techniques based on current search and category
     */
    getFilteredTechniques() {
        if (!this.techniquesData || !this.categoriesData) return [];
        
        let filteredTechniques = [];
        
        // Start by filtering techniques
        this.categoriesData.categories.forEach(category => {
            // If a category is selected and doesn't match, skip
            if (this.currentCategory && this.currentCategory !== category.id) {
                return;
            }
            
            // Find the corresponding techniques in the techniques data
            const categoryInTechData = this.techniquesData.categories.find(c => c.id === category.id);
            if (!categoryInTechData) return;
            
            // Add techniques from this category
            categoryInTechData.techniques.forEach(technique => {
                // Apply search filter if search term exists
                if (this.searchTerm) {
                    // Search in name, description, and aliases
                    const nameMatch = technique.name.toLowerCase().includes(this.searchTerm);
                    const descMatch = technique.description?.toLowerCase().includes(this.searchTerm);
                    const aliasMatch = technique.aliases?.some(alias => 
                        alias.toLowerCase().includes(this.searchTerm)
                    );
                    
                    if (!(nameMatch || descMatch || aliasMatch)) {
                        return;
                    }
                }
                
                // Add category information to the technique
                filteredTechniques.push({
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });
        
        return filteredTechniques;
    }

    /**
     * Display techniques based on current filters and view
     */
    /**
     * Display techniques based on current filters and view.
     */
    displayTechniques() {
        const techniquesContainer = document.getElementById('techniques-container');
        if (!techniquesContainer) return;

        // Get filtered techniques
        const filteredTechniques = this.getFilteredTechniques();

        // Show no results message if no techniques found
        if (filteredTechniques.length === 0) {
            techniquesContainer.innerHTML = `
                <div class="no-results">
                    <p>No techniques found matching your criteria.</p>
                    <button id="reset-filters">Reset Filters</button>
                </div>
            `;

            // Attach event listener to the newly created reset button
            const resetButton = document.getElementById('reset-filters');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    // Clear search
                    const searchInput = document.getElementById('technique-search');
                    if (searchInput) searchInput.value = '';
                    this.searchTerm = '';

                    // Clear category selection
                    document.querySelectorAll('.category-button').forEach(btn =>
                        btn.classList.remove('active')
                    );
                    this.currentCategory = null;

                    this.displayTechniques();
                    this.updateURLFromState();
                });
            }

            return;
        }

        // Clear container
        techniquesContainer.innerHTML = '';

        // Add appropriate class for view type
        techniquesContainer.className = this.currentView === 'cards' ? 'cards-view' : 'list-view';

        // Render techniques based on view type
        if (this.currentView === 'cards') {
            this.renderCardsView(techniquesContainer, filteredTechniques);
        } else {
            this.renderListView(techniquesContainer, filteredTechniques);
        }

        // Add click handlers to technique items
        this.addTechniqueClickHandlers();
    }

    /**
     * Render techniques in cards view
     */
    /**
     * Render techniques in cards view
     * @param {HTMLElement} container
     * @param {Array} techniques
     */
    renderCardsView(container, techniques) {
        // If no cards, nothing to render
        if (techniques.length === 0) return;

        // Render all cards at once (original behavior)
        techniques.forEach(technique => {
            const card = document.createElement('div');
            card.className = 'technique-card';
            card.dataset.id = technique.id;

            // Get icon based on category
            const iconClass = this.getCategoryIcon(technique.categoryId);
            
            // Prepare mini-lesson content if available
            const whenToUse = technique.useCase ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-lightbulb"></i> When to Use</h4>
                    <div class="when-to-use">${technique.useCase}</div>
                </div>
            ` : '';
            
            const example = technique.example ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-code"></i> Example</h4>
                    <div class="example-block">${technique.example}</div>
                </div>
            ` : '';
            
            // Add tips and common mistakes if they exist in the technique data
            const tips = technique.tips ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-check-circle"></i> Tips</h4>
                    <div class="tips-block">${technique.tips}</div>
                </div>
            ` : '';
            
            const mistakes = technique.commonMistakes ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Common Mistakes</h4>
                    <div class="common-mistakes">${technique.commonMistakes}</div>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="card-content">
                    <span class="category-tag">${technique.categoryName}</span>
                    <h3>
                        <div class="technique-icon"><i class="${iconClass}"></i></div>
                        ${technique.name}
                    </h3>
                    <p>${this.truncateText(technique.description, 120)}</p>
                    ${whenToUse}
                    ${example}
                    ${tips}
                    ${mistakes}
                    ${technique.sources ? `
                    <div class="sources">
                        Sources: ${technique.sources.join(', ')}
                    </div>` : ''}
                </div>
            `;

            container.appendChild(card);
            
            // Add click handler directly to each card
            card.addEventListener('click', () => {
                this.showTechniqueDetails(technique.id);
            });
        });

        // Remove any keyboard navigation handlers from previous renders
        if (this._cardNavKeyHandler) {
            window.removeEventListener('keydown', this._cardNavKeyHandler);
            this._cardNavKeyHandler = null;
        }
    }

    /**
     * Render techniques in list view
     */
    renderListView(container, techniques) {
        techniques.forEach(technique => {
            const listItem = document.createElement('div');
            listItem.className = 'technique-list-item';
            listItem.dataset.id = technique.id;
            
            listItem.innerHTML = `
                <div class="technique-list-info">
                    <h3>${technique.name}</h3>
                    <div class="technique-list-details">
                        <!-- Always use the mapped categoryName for the tag to ensure consistency with filter buttons -->
                        <span class="category-tag">${technique.categoryName}</span>
                        ${technique.sources ? `<span>${technique.sources.length} source${technique.sources.length > 1 ? 's' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="technique-list-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }

    /**
     * Add click event handlers to technique items
     */
    addTechniqueClickHandlers() {
        // Card view handlers
        document.querySelectorAll('.technique-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showTechniqueDetails(card.dataset.id);
            });
        });
        
        // List view handlers
        document.querySelectorAll('.technique-list-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showTechniqueDetails(item.dataset.id);
            });
        });
    }

    /**
     * Show technique details in modal
     */
    showTechniqueDetails(techniqueId) {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;

        // Get the filtered/visible techniques list
        const filteredTechniques = this.getFilteredTechniques();
        // Find the index of the current technique in the filtered list
        const currentIndex = filteredTechniques.findIndex(t => t.id === techniqueId);

        // Find the technique and category name as before
        let technique = null;
        let categoryName = '';
        let categoryId = '';
        for (const category of this.techniquesData.categories) {
            const found = category.techniques.find(t => t.id === techniqueId);
            if (found) {
                technique = found;
                categoryId = category.id;
                const categoryData = this.categoriesData.categories.find(c => c.id === category.id);
                categoryName = categoryData ? categoryData.name : category.id;
                break;
            }
        }

        if (!technique) {
            console.error('Technique not found:', techniqueId);
            return;
        }

        // Get icon based on category
        const iconClass = this.getCategoryIcon(categoryId);

        // Populate modal content
        document.getElementById('modal-technique-name').innerHTML = `
            <span class="modal-technique-icon"><i class="${iconClass}"></i></span>
            ${technique.name}
        `;
        document.getElementById('modal-technique-category').textContent = categoryName;

        // Description
        document.getElementById('modal-technique-description').textContent = technique.description;

        // Aliases (if any)
        const aliasesSection = document.getElementById('modal-aliases-section');
        const aliasesContent = document.getElementById('modal-technique-aliases');
        if (technique.aliases && technique.aliases.length > 0) {
            aliasesContent.textContent = technique.aliases.join(', ');
            aliasesSection.style.display = 'block';
        } else {
            aliasesSection.style.display = 'none';
        }

        // Sources
        const sourcesSection = document.getElementById('modal-sources-section');
        const sourcesContent = document.getElementById('modal-technique-sources');
        if (technique.sources && technique.sources.length > 0) {
            sourcesContent.innerHTML = '';
            technique.sources.forEach(source => {
                const li = document.createElement('li');
                li.textContent = source;
                sourcesContent.appendChild(li);
            });
            sourcesSection.style.display = 'block';
        } else {
            sourcesSection.style.display = 'none';
        }

        // Related techniques
        const relatedSection = document.getElementById('modal-related-section');
        const relatedContent = document.getElementById('modal-related-techniques');
        if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
            relatedContent.innerHTML = '';
            technique.relatedTechniques.forEach(relatedId => {
                const span = document.createElement('span');
                span.className = 'related-technique';
                span.dataset.id = relatedId;
                // Find the name of the related technique
                let relatedName = relatedId;
                for (const category of this.techniquesData.categories) {
                    const related = category.techniques.find(t => t.id === relatedId);
                    if (related) {
                        relatedName = related.name;
                        break;
                    }
                }
                span.textContent = relatedName;
                relatedContent.appendChild(span);
            });
            relatedSection.style.display = 'block';
            document.querySelectorAll('.related-technique').forEach(item => {
                item.addEventListener('click', () => {
                    this.showTechniqueDetails(item.dataset.id);
                });
            });
        } else {
            relatedSection.style.display = 'none';
        }

        // Example
        const exampleSection = document.getElementById('modal-example-section');
        const exampleContent = document.getElementById('modal-technique-example');
        if (technique.example) {
            exampleContent.textContent = technique.example;
            exampleSection.style.display = 'block';
            exampleSection.querySelector('h4').innerHTML = '<i class="fas fa-code"></i> Example';
        } else {
            exampleSection.style.display = 'none';
        }

        // Use case
        const useCaseSection = document.getElementById('modal-usecase-section');
        const useCaseContent = document.getElementById('modal-technique-usecase');
        if (technique.useCase) {
            useCaseContent.innerHTML = `<div class="modal-when-to-use">${technique.useCase}</div>`;
            useCaseSection.style.display = 'block';
            useCaseSection.querySelector('h4').innerHTML = '<i class="fas fa-lightbulb"></i> When to Use';
        } else {
            useCaseSection.style.display = 'none';
        }

        // Tips
        const tipsSection = document.getElementById('modal-tips-section');
        if (tipsSection) {
            const tipsContent = document.getElementById('modal-technique-tips');
            if (technique.tips) {
                tipsContent.innerHTML = `<div class="modal-tips-block">${technique.tips}</div>`;
                tipsSection.style.display = 'block';
            } else {
                tipsSection.style.display = 'none';
            }
        }

        // Common Mistakes
        const mistakesSection = document.getElementById('modal-mistakes-section');
        if (mistakesSection) {
            const mistakesContent = document.getElementById('modal-technique-mistakes');
            if (technique.commonMistakes) {
                mistakesContent.innerHTML = `<div class="modal-common-mistakes">${technique.commonMistakes}</div>`;
                mistakesSection.style.display = 'block';
            } else {
                mistakesSection.style.display = 'none';
            }
        }

        // --- Modal Navigation Arrows ---
        // Remove any existing nav container to avoid duplicates
        let navContainer = document.getElementById('modal-nav-arrows');
        if (navContainer) {
            navContainer.remove();
        }
        // Only show arrows if there is more than one visible technique
        if (filteredTechniques.length > 1 && currentIndex !== -1) {
            navContainer = document.createElement('div');
            navContainer.id = 'modal-nav-arrows';
            navContainer.style.display = 'flex';
            navContainer.style.justifyContent = 'space-between';
            navContainer.style.alignItems = 'center';
            navContainer.style.margin = '16px 0 0 0';

            // Left arrow
            const leftBtn = document.createElement('button');
            leftBtn.className = 'modal-nav modal-nav-left';
            leftBtn.innerHTML = '&larr;';
            leftBtn.setAttribute('aria-label', 'Previous technique');
            leftBtn.disabled = currentIndex === 0;
            leftBtn.style.fontSize = '1.5em';
            leftBtn.style.padding = '0.5em 1em';
            leftBtn.style.opacity = leftBtn.disabled ? '0.5' : '1.0';
            leftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex > 0) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex - 1].id);
                }
            });

            // Progress indicator
            const progress = document.createElement('span');
            progress.className = 'modal-nav-progress';
            progress.textContent = `Technique ${currentIndex + 1} of ${filteredTechniques.length}`;
            progress.style.flex = '1';
            progress.style.textAlign = 'center';
            progress.style.fontWeight = 'bold';

            // Right arrow
            const rightBtn = document.createElement('button');
            rightBtn.className = 'modal-nav modal-nav-right';
            rightBtn.innerHTML = '&rarr;';
            rightBtn.setAttribute('aria-label', 'Next technique');
            rightBtn.disabled = currentIndex === filteredTechniques.length - 1;
            rightBtn.style.fontSize = '1.5em';
            rightBtn.style.padding = '0.5em 1em';
            rightBtn.style.opacity = rightBtn.disabled ? '0.5' : '1.0';
            rightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex < filteredTechniques.length - 1) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex + 1].id);
                }
            });

            navContainer.appendChild(leftBtn);
            navContainer.appendChild(progress);
            navContainer.appendChild(rightBtn);

            // Insert navContainer at the end of modal-content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.appendChild(navContainer);
            }
        }

        // Show the modal
        modal.style.display = 'block';
    }

    /**
     * Truncate text to specified length with ellipsis
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Update URL based on current state (for bookmarking)
     */
    updateURLFromState() {
        const searchParams = new URLSearchParams();
        
        if (this.searchTerm) {
            searchParams.set('q', this.searchTerm);
        }
        
        if (this.currentCategory) {
            searchParams.set('category', this.currentCategory);
        }
        
        if (this.currentView !== 'cards') {
            searchParams.set('view', this.currentView);
        }
        
        const newUrl = window.location.pathname + 
            (searchParams.toString() ? '?' + searchParams.toString() : '');
        
        history.pushState({ 
            searchTerm: this.searchTerm,
            category: this.currentCategory,
            view: this.currentView
        }, '', newUrl);
    }

    /**
     * Load state from URL parameters
     */
    loadStateFromURL() {
        const searchParams = new URLSearchParams(window.location.search);
        
        // Get search term
        const queryParam = searchParams.get('q');
        if (queryParam) {
            this.searchTerm = queryParam.toLowerCase();
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = queryParam;
            }
        }
        
        // Get category
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            this.currentCategory = categoryParam;
        }
        
        // Get view
        const viewParam = searchParams.get('view');
        if (viewParam && (viewParam === 'cards' || viewParam === 'list')) {
            this.currentView = viewParam;
        }
    }

    /**
     * Handle URL changes (browser history navigation)
     */
    handleURLChange(event) {
        if (event.state) {
            this.searchTerm = event.state.searchTerm || '';
            this.currentCategory = event.state.category || null;
            this.currentView = event.state.view || 'cards';
            
            // Update search input
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = this.searchTerm;
            }
            
            // Update category buttons
            document.querySelectorAll('.category-button').forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Update view toggle
            const cardViewButton = document.getElementById('card-view-toggle');
            const listViewButton = document.getElementById('list-view-toggle');
            
            if (cardViewButton && listViewButton) {
                if (this.currentView === 'cards') {
                    cardViewButton.classList.add('active');
                    listViewButton.classList.remove('active');
                } else {
                    listViewButton.classList.add('active');
                    cardViewButton.classList.remove('active');
                }
            }
            
            // Refresh the display
            this.displayTechniques();
        } else {
            // Handle case when there's no state (e.g., initial load)
            this.loadStateFromURL();
            this.displayTechniques();
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        const container = document.getElementById('techniques-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                </div>
            `;
        } else {
            console.error(message);
        }
    }
    /**
     * Get appropriate icon class based on category ID
     * @param {string} categoryId
     * @returns {string} Font Awesome icon class
     */
    getCategoryIcon(categoryId) {
        const iconMap = {
            'basic-concepts': 'fas fa-book',
            'reasoning-frameworks': 'fas fa-brain',
            'agent-tool-use': 'fas fa-robot',
            'self-improvement': 'fas fa-chart-line',
            'retrieval-augmentation': 'fas fa-database',
            'prompt-optimization': 'fas fa-sliders-h',
            'multimodal-techniques': 'fas fa-images',
            'specialized-application': 'fas fa-cogs',
            'multi-agent-systems': 'fas fa-users'
        };
        
        return iconMap[categoryId] || 'fas fa-lightbulb';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const taxonomyLoader = new TaxonomyDataLoader();
    await taxonomyLoader.init();
});