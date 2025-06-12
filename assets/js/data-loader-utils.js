/**
 * Utility functions for loading taxonomy data
 * Handles both HTTP and file:// protocol scenarios
 */

class TaxonomyDataUtils {
    static async loadData() {
        try {
            // First, try to load via fetch (works with HTTP)
            const [categoriesResponse, techniquesResponse] = await Promise.all([
                fetch('data/processed/technique_categories.json'),
                fetch('data/processed/techniques.json')
            ]);

            if (categoriesResponse.ok && techniquesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                const techniquesData = await techniquesResponse.json();
                console.log(`✅ Loaded data via fetch: ${categoriesData.categories.length} categories, ${this.countTechniques(techniquesData)} techniques`);
                return { categoriesData, techniquesData };
            }
        } catch (error) {
            console.log('📂 Fetch failed (likely file:// protocol), trying alternative loading...');
        }

        // For file:// protocol, we need to load via script injection
        return await this.loadViaScriptInjection();
    }

    static async loadViaScriptInjection() {
        try {
            // Load categories
            const categoriesData = await this.loadJSONViaScript('data/processed/technique_categories.json', 'taxonomyCategories');
            
            // Load techniques
            const techniquesData = await this.loadJSONViaScript('data/processed/techniques.json', 'taxonomyTechniques');
            
            console.log(`✅ Loaded data via script injection: ${categoriesData.categories.length} categories, ${this.countTechniques(techniquesData)} techniques`);
            return { categoriesData, techniquesData };
        } catch (error) {
            console.error('❌ Failed to load data via script injection:', error);
            throw new Error('Failed to load taxonomy data. Please ensure the JSON files are accessible.');
        }
    }

    static loadJSONViaScript(url, globalVarName) {
        return new Promise((resolve, reject) => {
            // Create a temporary script element
            const script = document.createElement('script');
            script.type = 'text/javascript';
            
            // Create a unique callback name
            const callbackName = globalVarName + '_callback_' + Date.now();
            
            // Set up the callback
            window[callbackName] = (data) => {
                // Clean up
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(data);
            };

            script.onerror = () => {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error(`Failed to load ${url}`));
            };

            // Load the JSON file as JSONP-style
            script.src = url + '?callback=' + callbackName;
            
            // For file:// protocol, we'll try a different approach
            if (location.protocol === 'file:') {
                // Fetch the file content directly (this might work in some browsers)
                fetch(url)
                    .then(response => response.text())
                    .then(text => {
                        try {
                            const data = JSON.parse(text);
                            window[callbackName](data);
                        } catch (parseError) {
                            reject(parseError);
                        }
                    })
                    .catch(fetchError => {
                        // If fetch fails, try loading via script with modified approach
                        script.onload = () => {
                            // Check if the global variable was set
                            if (window[globalVarName]) {
                                window[callbackName](window[globalVarName]);
                                delete window[globalVarName];
                            } else {
                                reject(new Error(`Global variable ${globalVarName} not found`));
                            }
                        };
                        document.head.appendChild(script);
                    });
            } else {
                document.head.appendChild(script);
            }
        });
    }

    static countTechniques(techniquesData) {
        if (!techniquesData || !techniquesData.categories) return 0;
        return techniquesData.categories.reduce((total, category) => {
            return total + (category.techniques ? category.techniques.length : 0);
        }, 0);
    }

    /**
     * For file:// protocol compatibility, create a simple JSON loader that doesn't rely on fetch
     */
    static async loadJSONDirectly(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.overrideMimeType('application/json');
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) { // 0 for file:// protocol
                        try {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                }
            };
            xhr.send(null);
        });
    }

    /**
     * Universal data loader that tries multiple methods
     */
    static async loadDataUniversal() {
        const methods = [
            // Method 1: Standard fetch
            async () => {
                const [categoriesResponse, techniquesResponse] = await Promise.all([
                    fetch('data/processed/technique_categories.json'),
                    fetch('data/processed/techniques.json')
                ]);
                return {
                    categoriesData: await categoriesResponse.json(),
                    techniquesData: await techniquesResponse.json()
                };
            },
            
            // Method 2: XMLHttpRequest (better for file:// protocol)
            async () => {
                const [categoriesData, techniquesData] = await Promise.all([
                    this.loadJSONDirectly('data/processed/technique_categories.json'),
                    this.loadJSONDirectly('data/processed/techniques.json')
                ]);
                return { categoriesData, techniquesData };
            }
        ];

        for (const [index, method] of methods.entries()) {
            try {
                const result = await method();
                console.log(`✅ Loaded data using method ${index + 1}: ${result.categoriesData.categories.length} categories, ${this.countTechniques(result.techniquesData)} techniques`);
                return result;
            } catch (error) {
                console.log(`❌ Method ${index + 1} failed:`, error.message);
                if (index === methods.length - 1) {
                    throw new Error('All data loading methods failed. Please ensure JSON files are accessible.');
                }
            }
        }
    }
}

// Export for use in other modules
window.TaxonomyDataUtils = TaxonomyDataUtils;