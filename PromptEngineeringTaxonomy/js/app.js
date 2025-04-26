/**
 * Main application script for Prompt Engineering Taxonomy
 * 
 * Handles UI interactions, rendering, filtering, and search functionality
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const techniquesContainer = document.getElementById('techniques-container');
    const categoryButtons = document.querySelector('.category-buttons');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    const modal = document.getElementById('technique-modal');
    const closeModal = document.querySelector('.close');
    const viewToggleButtons = document.querySelectorAll('.view-toggle');
    
    // State
    let currentView = 'card'; // 'card' or 'list'
    let currentCategoryFilter = null;
    let currentSearchTerm = '';
    
    // Initialize application
    init();
    
    /**
     * Initialize the application
     */
    async function init() {
        try {
            // Load data
            await taxonomyData.loadData();
            
            // Render UI components
            renderCategoryButtons();
            renderTechniques(taxonomyData.getAllTechniques());
            
            // Add event listeners
            setupEventListeners();
        } catch (error) {
            showError(`Failed to load taxonomy data: ${error.message}`);
        }
    }
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Category filter buttons
        categoryButtons.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-button')) {
                const categoryId = e.target.dataset.category;
                
                // Deactivate all buttons
                document.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // If clicking the same category, clear filter
                if (categoryId === currentCategoryFilter) {
                    currentCategoryFilter = null;
                } else {
                    // Activate selected button
                    e.target.classList.add('active');
                    currentCategoryFilter = categoryId;
                }
                
                // Apply filters
                applyFilters();
            }
        });
        
        // Search input
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim();
            clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
            applyFilters();
        });
        
        // Clear search button
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            clearSearchBtn.style.display = 'none';
            applyFilters();
        });
        
        // View toggle buttons
        viewToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const viewMode = button.dataset.view;
                
                // Update toggle button state
                viewToggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update view
                currentView = viewMode;
                applyFilters(); // Re-render with new view
            });
        });
        
        // Modal close button
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Technique card/list item click
        techniquesContainer.addEventListener('click', (e) => {
            const techniqueCard = e.target.closest('.technique-card, .technique-list-item');
            if (techniqueCard) {
                const techniqueId = techniqueCard.dataset.id;
                showTechniqueDetails(techniqueId);
            }
        });
        
        // Related technique click in modal
        document.getElementById('modal-related-techniques').addEventListener('click', (e) => {
            if (e.target.classList.contains('related-technique')) {
                const techniqueId = e.target.dataset.id;
                showTechniqueDetails(techniqueId);
            }
        });
    }
    
    /**
     * Apply current filters (category and search) and re-render
     */
    function applyFilters() {
        let filteredTechniques = taxonomyData.getAllTechniques();
        
        // Apply category filter
        if (currentCategoryFilter) {
            filteredTechniques = taxonomyData.getTechniquesByCategory(currentCategoryFilter);
        }
        
        // Apply search filter
        if (currentSearchTerm) {
            filteredTechniques = taxonomyData.searchTechniques(currentSearchTerm);
        }
        
        // Render filtered techniques
        renderTechniques(filteredTechniques);
    }
    
    /**
     * Render category filter buttons
     */
    function renderCategoryButtons() {
        const categories = taxonomyData.getCategories();
        
        // Add "All" button
        const allButton = document.createElement('button');
        allButton.classList.add('category-button', 'active');
        allButton.textContent = 'All Categories';
        allButton.dataset.category = 'all';
        categoryButtons.appendChild(allButton);
        
        // Add category buttons
        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-button');
            button.textContent = `${category.name} (${category.techniqueCount})`;
            button.dataset.category = category.id;
            categoryButtons.appendChild(button);
        });
    }
    
    /**
     * Render techniques based on current view mode
     */
    function renderTechniques(techniques) {
        // Clear container
        techniquesContainer.innerHTML = '';
        
        // If no techniques, show message
        if (techniques.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No techniques found matching your search criteria.</p>
                <button id="reset-filters">Reset Filters</button>
            `;
            techniquesContainer.appendChild(noResults);
            
            // Add event listener to reset button
            document.getElementById('reset-filters').addEventListener('click', () => {
                // Reset search
                searchInput.value = '';
                currentSearchTerm = '';
                clearSearchBtn.style.display = 'none';
                
                // Reset category filter
                currentCategoryFilter = null;
                document.querySelectorAll('.category-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector('[data-category="all"]').classList.add('active');
                
                // Apply changes
                applyFilters();
            });
            
            return;
        }
        
        // Create container based on view mode
        const container = document.createElement('div');
        container.className = currentView === 'card' ? 'cards-view' : 'list-view';
        techniquesContainer.appendChild(container);
        
        // Render techniques
        techniques.forEach(technique => {
            if (currentView === 'card') {
                container.appendChild(createTechniqueCard(technique));
            } else {
                container.appendChild(createTechniqueListItem(technique));
            }
        });
    }
    
    /**
     * Create a technique card for card view
     */
    function createTechniqueCard(technique) {
        const card = document.createElement('div');
        card.className = 'technique-card';
        card.dataset.id = technique.id;
        
        card.innerHTML = `
            <h3>${technique.name}</h3>
            <span class="category-tag">${technique.categoryName}</span>
            <p>${technique.description}</p>
            <div class="sources">
                <span>Source${technique.sources.length > 1 ? 's' : ''}:</span> 
                ${technique.sources.join(', ')}
            </div>
        `;
        
        return card;
    }
    
    /**
     * Create a technique list item for list view
     */
    function createTechniqueListItem(technique) {
        const item = document.createElement('div');
        item.className = 'technique-list-item';
        item.dataset.id = technique.id;
        
        item.innerHTML = `
            <div class="technique-list-info">
                <h3>${technique.name}</h3>
                <div class="technique-list-details">
                    <span class="category-tag">${technique.categoryName}</span>
                    <span class="sources">Source${technique.sources.length > 1 ? 's' : ''}: ${technique.sources.join(', ')}</span>
                </div>
            </div>
            <div class="technique-list-action">
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
        
        return item;
    }
    
    /**
     * Show technique details in modal
     */
    function showTechniqueDetails(techniqueId) {
        const technique = taxonomyData.getTechniqueById(techniqueId);
        if (!technique) return;
        
        // Find the category this technique belongs to
        const category = taxonomyData.getCategories().find(cat => cat.id === technique.categoryId);
        
        // Populate modal content
        document.getElementById('modal-technique-name').textContent = technique.name;
        document.querySelector('.technique-category').textContent = category.name;
        document.getElementById('modal-technique-description').textContent = technique.description;
        
        // Populate sources
        const sourcesList = document.getElementById('modal-technique-sources');
        sourcesList.innerHTML = '';
        technique.sources.forEach(source => {
            const li = document.createElement('li');
            li.textContent = source;
            sourcesList.appendChild(li);
        });
        
        // Populate related techniques
        const relatedContainer = document.getElementById('modal-related-techniques');
        relatedContainer.innerHTML = '';
        
        if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
            technique.relatedTechniques.forEach(relatedId => {
                const related = taxonomyData.getTechniqueById(relatedId);
                if (related) {
                    const relatedElement = document.createElement('div');
                    relatedElement.className = 'related-technique';
                    relatedElement.textContent = related.name;
                    relatedElement.dataset.id = related.id;
                    relatedContainer.appendChild(relatedElement);
                }
            });
        } else {
            relatedContainer.innerHTML = '<p>No related techniques specified.</p>';
        }
        
        // Display modal
        modal.style.display = 'block';
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        techniquesContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
});