/**
 * Data Loader for Prompt Engineering Taxonomy
 * 
 * Handles loading and processing the taxonomy data
 */

class TaxonomyDataLoader {
    constructor() {
        this.data = null;
        this.categories = [];
        this.techniques = [];
        this.isLoading = true;
        this.loadError = null;
    }

    /**
     * Load the taxonomy data from the JSON file
     */
    async loadData() {
        try {
            const response = await fetch('./data/techniques.json');
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
            }
            
            this.data = await response.json();
            this.processData();
            this.isLoading = false;
            return this.data;
        } catch (error) {
            console.error('Error loading taxonomy data:', error);
            this.loadError = error.message;
            this.isLoading = false;
            throw error;
        }
    }

    /**
     * Process the loaded data into useful formats
     */
    processData() {
        if (!this.data) return;

        // Extract categories
        this.categories = this.data.categories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            techniqueCount: category.techniques.length
        }));

        // Extract all techniques into a flat array
        this.techniques = [];
        this.data.categories.forEach(category => {
            category.techniques.forEach(technique => {
                this.techniques.push({
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });
    }

    /**
     * Get all categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Get all techniques
     */
    getAllTechniques() {
        return this.techniques;
    }

    /**
     * Get techniques filtered by category
     */
    getTechniquesByCategory(categoryId) {
        return this.techniques.filter(technique => technique.categoryId === categoryId);
    }

    /**
     * Get a technique by its ID
     */
    getTechniqueById(id) {
        return this.techniques.find(technique => technique.id === id);
    }

    /**
     * Search techniques by query string
     */
    searchTechniques(query) {
        if (!query) return this.techniques;
        
        const searchTerm = query.toLowerCase();
        return this.techniques.filter(technique => {
            // Search in name
            if (technique.name.toLowerCase().includes(searchTerm)) return true;
            
            // Search in description
            if (technique.description.toLowerCase().includes(searchTerm)) return true;
            
            // Search in category
            if (technique.categoryName.toLowerCase().includes(searchTerm)) return true;
            
            // Search in sources
            if (technique.sources && technique.sources.some(source => 
                source.toLowerCase().includes(searchTerm))) return true;
            
            // Search in related techniques
            if (technique.relatedTechniques && technique.relatedTechniques.some(related => 
                related.toLowerCase().includes(searchTerm))) return true;
                
            return false;
        });
    }
}

// Create and export a singleton instance
const taxonomyData = new TaxonomyDataLoader();