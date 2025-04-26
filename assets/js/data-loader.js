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
            // Load categories first
            const categoriesResponse = await fetch('/data/processed/technique_categories.json');
            this.categoriesData = await categoriesResponse.json();
            
            // Load techniques
            const techniquesResponse = await fetch('/data/processed/techniques.json');
            this.techniquesData = await techniquesResponse.json();
            
            // Check if URL contains search or category parameters
            this.loadStateFromURL();
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error('Failed to load taxonomy data');
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
    initCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-button');
        if (categoryButtons.length === 0) return;
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle current selection
                if (button.dataset.category === this.currentCategory) {
                    this.currentCategory = null; // Deselect
                    button.classList.remove('active');
                } else {
                    // Remove active class from all buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Set new category and add active class
                    this.currentCategory = button.dataset.category;
                    button.classList.add('active');
                }
                
                this.displayTechniques();
                this.updateURLFromState();
            });
            
            // Set initial active state based on URL
            if (button.dataset.category === this.currentCategory) {
                button.classList.add('active');
            }
        });
        
        // Reset filters button
        const resetFiltersButton = document.getElementById('reset-filters');
        if (resetFiltersButton) {
            resetFiltersButton.addEventListener('click', () => {
                // Clear search
                const searchInput = document.getElementById('technique-search');
                if (searchInput) searchInput.value = '';
                this.searchTerm = '';
                
                // Clear category selection
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.currentCategory = null;
                
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
    renderCardsView(container, techniques) {
        techniques.forEach(technique => {
            const card = document.createElement('div');
            card.className = 'technique-card';
            card.dataset.id = technique.id;
            
            card.innerHTML = `
                <span class="category-tag">${technique.categoryName}</span>
                <h3>${technique.name}</h3>
                <p>${this.truncateText(technique.description, 150)}</p>
                ${technique.sources ? `
                <div class="sources">
                    Sources: ${technique.sources.join(', ')}
                </div>` : ''}
            `;
            
            container.appendChild(card);
        });
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
        
        // Find the technique
        let technique = null;
        let categoryName = '';
        
        // Search for technique across all categories
        for (const category of this.techniquesData.categories) {
            const found = category.techniques.find(t => t.id === techniqueId);
            if (found) {
                technique = found;
                // Find the category name from categories data
                const categoryData = this.categoriesData.categories.find(c => c.id === category.id);
                categoryName = categoryData ? categoryData.name : category.id;
                break;
            }
        }
        
        if (!technique) {
            console.error('Technique not found:', techniqueId);
            return;
        }
        
        // Populate modal content
        document.getElementById('modal-technique-name').textContent = technique.name;
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
                let relatedName = relatedId; // Default to ID if name not found
                
                // Search for the related technique across all categories
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
            
            // Add click handlers to related techniques
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
        } else {
            exampleSection.style.display = 'none';
        }
        
        // Use case
        const useCaseSection = document.getElementById('modal-usecase-section');
        const useCaseContent = document.getElementById('modal-technique-usecase');
        
        if (technique.useCase) {
            useCaseContent.textContent = technique.useCase;
            useCaseSection.style.display = 'block';
        } else {
            useCaseSection.style.display = 'none';
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const taxonomyLoader = new TaxonomyDataLoader();
    taxonomyLoader.init();
});