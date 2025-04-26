/**
 * Network Visualization Script for Technique Relationships
 * Creates a force-directed graph visualization using D3.js
 */

class TechniqueNetworkVisualization {
    constructor() {
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.svg = null;
        this.link = null;
        this.node = null;
        this.width = 0;
        this.height = 0;
        this.linkStrength = 0.5;
        this.nodeDistance = 150;
        this.selectedCategory = 'all';
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.selectedNode = null;
        this.categoriesData = null;
        this.techniquesData = null;
        this.zoom = null;
    }

    /**
     * Initialize the visualization
     */
    async init() {
        try {
            // Load data from JSON files
            await this.loadData();
            
            // Initialize the visualization
            this.setupVisualization();
            
            // Add event listeners
            this.addEventListeners();
            
            // Hide loading indicator
            document.querySelector('.visualization-loading').style.display = 'none';
        } catch (error) {
            console.error('Error initializing network visualization:', error);
            this.showError('Failed to load visualization data. Please try refreshing the page.');
        }
    }

    /**
     * Load data from JSON files
     */
    async loadData() {
        try {
            // Load categories first
            const categoriesResponse = await fetch('/data/processed/technique_categories.json');
            this.categoriesData = await categoriesResponse.json();
            
            // Load techniques
            const techniquesResponse = await fetch('/data/processed/techniques.json');
            this.techniquesData = await techniquesResponse.json();
            
            // Process data into nodes and links
            this.processData();
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error('Failed to load taxonomy data');
        }
    }

    /**
     * Process data into nodes and links for the visualization
     */
    processData() {
        this.nodes = [];
        this.links = [];
        
        // Create a map of category IDs to colors
        const categoryColors = {};
        this.categoriesData.categories.forEach((category, index) => {
            categoryColors[category.id] = this.colorScale(index);
        });
        
        // Process each technique into a node
        let nodeIndex = 0;
        this.techniquesData.categories.forEach(category => {
            const categoryId = category.id;
            
            category.techniques.forEach(technique => {
                // Create node for this technique
                this.nodes.push({
                    id: technique.id,
                    name: technique.name,
                    categoryId: categoryId,
                    color: categoryColors[categoryId],
                    description: technique.description,
                    sources: technique.sources,
                    aliases: technique.aliases,
                    useCase: technique.useCase,
                    example: technique.example,
                    relatedTechniques: technique.relatedTechniques || [],
                    index: nodeIndex++
                });
            });
        });
        
        // Add links based on related techniques
        this.nodes.forEach(node => {
            if (node.relatedTechniques && node.relatedTechniques.length > 0) {
                node.relatedTechniques.forEach(relatedId => {
                    // Find the related node
                    const targetNode = this.nodes.find(n => n.id === relatedId);
                    if (targetNode) {
                        this.links.push({
                            source: node.id,
                            target: relatedId,
                            value: 1 // Link strength
                        });
                    }
                });
            }
        });
    }

    /**
     * Setup D3.js visualization
     */
    setupVisualization() {
        const container = document.getElementById('relationship-visualization');
        if (!container) return;
        
        // Get dimensions
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        // Create SVG
        this.svg = d3.select('#relationship-visualization')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .call(this.setupZoom());
        
        // Add a background rect to capture zoom events
        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');
        
        // Create a group for all graph elements
        this.graph = this.svg.append('g')
            .attr('class', 'graph');
        
        // Create links
        this.link = this.graph.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value));
        
        // Create nodes
        this.node = this.graph.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('r', d => 5 + (d.relatedTechniques.length * 0.5))
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('id', d => `node-${d.id}`)
            .attr('data-id', d => d.id)
            .on('click', this.handleNodeClick.bind(this))
            .call(this.setupDrag());
        
        // Add node labels
        this.nodeLabels = this.graph.append('g')
            .attr('class', 'node-labels')
            .selectAll('text')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('dy', 4)
            .attr('dx', d => 8 + (d.relatedTechniques.length * 0.5))
            .text(d => d.name)
            .attr('font-size', '10px')
            .attr('font-family', 'Inter, sans-serif')
            .style('pointer-events', 'none');
        
        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links).id(d => d.id).distance(this.nodeDistance))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.01))
            .force('y', d3.forceY(this.height / 2).strength(0.01))
            .force('collision', d3.forceCollide().radius(d => 10 + (d.relatedTechniques.length * 0.5)))
            .on('tick', this.tick.bind(this));
    }

    /**
     * Setup zoom behavior
     */
    setupZoom() {
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.graph.attr('transform', event.transform);
            });
        
        return this.zoom;
    }

    /**
     * Setup drag behavior for nodes
     */
    setupDrag() {
        return d3.drag()
            .on('start', this.dragstarted.bind(this))
            .on('drag', this.dragged.bind(this))
            .on('end', this.dragended.bind(this));
    }

    /**
     * Handle node click
     */
    handleNodeClick(event, d) {
        // Highlight the selected node
        this.node.attr('stroke', n => n.id === d.id ? '#000' : '#fff')
                 .attr('stroke-width', n => n.id === d.id ? 2.5 : 1.5);
        
        // Store selected node
        this.selectedNode = d;
        
        // Update details panel
        this.updateDetailsPanel(d);
    }

    /**
     * Update details panel with selected node information
     */
    updateDetailsPanel(node) {
        const detailsPanel = document.querySelector('.technique-detail-panel');
        const title = document.getElementById('detail-panel-title');
        const details = document.getElementById('technique-details');
        const relatedList = document.getElementById('related-techniques-list');
        
        if (!detailsPanel || !title || !details || !relatedList) return;
        
        // Show panel
        detailsPanel.classList.add('active');
        
        // Set title
        title.textContent = node.name;
        
        // Set details
        let content = `<div class="technique-category">${this.getCategoryName(node.categoryId)}</div>`;
        
        content += `<p class="description">${node.description || 'No description available.'}</p>`;
        
        if (node.aliases && node.aliases.length > 0) {
            content += `<div class="detail-section">
                <h4>Also Known As</h4>
                <p>${node.aliases.join(', ')}</p>
            </div>`;
        }
        
        if (node.useCase) {
            content += `<div class="detail-section">
                <h4>Use Case</h4>
                <p>${node.useCase}</p>
            </div>`;
        }
        
        if (node.example) {
            content += `<div class="detail-section">
                <h4>Example</h4>
                <div class="example-code">${node.example}</div>
            </div>`;
        }
        
        if (node.sources && node.sources.length > 0) {
            content += `<div class="detail-section">
                <h4>Sources</h4>
                <ul class="sources-list">
                    ${node.sources.map(source => `<li>${source}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        details.innerHTML = content;
        
        // Set related techniques
        relatedList.innerHTML = '';
        
        if (node.relatedTechniques && node.relatedTechniques.length > 0) {
            node.relatedTechniques.forEach(relatedId => {
                const relatedNode = this.nodes.find(n => n.id === relatedId);
                if (relatedNode) {
                    const relatedItem = document.createElement('div');
                    relatedItem.className = 'related-item';
                    relatedItem.dataset.id = relatedId;
                    
                    const colorDot = document.createElement('span');
                    colorDot.className = 'related-color-dot';
                    colorDot.style.backgroundColor = relatedNode.color;
                    
                    const relatedName = document.createElement('span');
                    relatedName.className = 'related-name';
                    relatedName.textContent = relatedNode.name;
                    
                    relatedItem.appendChild(colorDot);
                    relatedItem.appendChild(relatedName);
                    relatedList.appendChild(relatedItem);
                    
                    // Add click event
                    relatedItem.addEventListener('click', () => {
                        // Find and highlight node
                        this.highlightNode(relatedId);
                    });
                }
            });
        } else {
            relatedList.innerHTML = '<p class="empty-state">No related techniques.</p>';
        }
    }

    /**
     * Get category name from category ID
     */
    getCategoryName(categoryId) {
        if (!this.categoriesData) return categoryId;
        
        const category = this.categoriesData.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    /**
     * Highlight a node by ID
     */
    highlightNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            // Highlight in graph
            this.node.attr('stroke', n => n.id === nodeId ? '#000' : '#fff')
                     .attr('stroke-width', n => n.id === nodeId ? 2.5 : 1.5);
            
            // Update details panel
            this.updateDetailsPanel(node);
            
            // Center view on node
            const nodeElement = document.getElementById(`node-${nodeId}`);
            if (nodeElement) {
                this.centerOnNode(node);
            }
        }
    }

    /**
     * Center view on a specific node
     */
    centerOnNode(node) {
        const transform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .scale(1.2)
            .translate(-node.x, -node.y);
        
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, transform);
    }

    /**
     * Filter nodes and links by category
     */
    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;
        
        if (categoryId === 'all') {
            // Show all nodes and links
            this.node.style('display', 'block');
            this.nodeLabels.style('display', 'block');
            
            // Show links that connect visible nodes
            this.link.style('display', d => 'block');
        } else {
            // Show nodes in the selected category and their direct connections
            const connectedNodeIds = new Set();
            
            // First pass: identify all nodes in the selected category
            const categoryNodeIds = new Set();
            this.nodes.forEach(node => {
                if (node.categoryId === categoryId) {
                    categoryNodeIds.add(node.id);
                }
            });
            
            // Second pass: add all nodes directly connected to the selected category
            this.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                
                if (categoryNodeIds.has(sourceId)) {
                    connectedNodeIds.add(targetId);
                }
                if (categoryNodeIds.has(targetId)) {
                    connectedNodeIds.add(sourceId);
                }
            });
            
            // Add all category nodes to connected nodes
            categoryNodeIds.forEach(id => connectedNodeIds.add(id));
            
            // Show/hide nodes
            this.node.style('display', d => 
                connectedNodeIds.has(d.id) ? 'block' : 'none'
            );
            
            this.nodeLabels.style('display', d => 
                connectedNodeIds.has(d.id) ? 'block' : 'none'
            );
            
            // Show links where both source and target are visible
            this.link.style('display', d => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                
                return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId) ? 'block' : 'none';
            });
        }
        
        // Restart simulation with visible nodes only
        this.simulation.alpha(0.3).restart();
    }

    /**
     * Update force layout parameters
     */
    updateForceLayout() {
        // Update link strength
        this.simulation.force('link').strength(this.linkStrength);
        
        // Update node distance
        this.simulation.force('link').distance(this.nodeDistance);
        
        // Restart simulation
        this.simulation.alpha(0.3).restart();
    }

    /**
     * Reset the visualization layout
     */
    resetLayout() {
        // Reset zoom
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity);
        
        // Reset positions
        this.simulation
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.1))
            .force('y', d3.forceY(this.height / 2).strength(0.1))
            .alpha(1)
            .restart();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const container = document.getElementById('relationship-visualization');
        if (!container) return;
        
        // Update dimensions
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        // Update SVG dimensions
        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height]);
        
        // Update background rect
        this.svg.select('rect')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // Update force center
        this.simulation
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.01))
            .force('y', d3.forceY(this.height / 2).strength(0.01))
            .alpha(0.3)
            .restart();
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active class
                document.querySelectorAll('.category-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                
                // Filter by category
                this.filterByCategory(button.dataset.category);
            });
        });
        
        // Link strength slider
        const linkStrengthSlider = document.getElementById('link-strength');
        if (linkStrengthSlider) {
            linkStrengthSlider.addEventListener('input', () => {
                this.linkStrength = linkStrengthSlider.value / 10;
                this.updateForceLayout();
            });
        }
        
        // Node distance slider
        const nodeDistanceSlider = document.getElementById('node-distance');
        if (nodeDistanceSlider) {
            nodeDistanceSlider.addEventListener('input', () => {
                this.nodeDistance = parseInt(nodeDistanceSlider.value);
                this.updateForceLayout();
            });
        }
        
        // Reset layout button
        const resetButton = document.getElementById('reset-layout');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetLayout();
            });
        }
        
        // Close details panel
        const closePanel = document.getElementById('close-panel');
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                document.querySelector('.technique-detail-panel').classList.remove('active');
                
                // Remove highlight from nodes
                this.node.attr('stroke', '#fff')
                         .attr('stroke-width', 1.5);
                
                this.selectedNode = null;
            });
        }
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Handle drag start
     */
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    /**
     * Handle drag
     */
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    /**
     * Handle drag end
     */
    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    /**
     * Update positions on each simulation tick
     */
    tick() {
        this.link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        this.node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        this.nodeLabels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.querySelector('.visualization-container');
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
    const networkVisualization = new TechniqueNetworkVisualization();
    networkVisualization.init();
});