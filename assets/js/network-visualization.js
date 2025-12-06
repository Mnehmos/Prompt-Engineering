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
        this.linkStrength = 0.3;
        this.nodeDistance = 250;
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
    // Asynchronous init to fetch data from JSON files
    async init() {
        try {
            // Show loading indicator if it exists
            const loadingElement = document.querySelector('.visualization-loading');
            if (loadingElement) {
                loadingElement.style.display = 'flex';
            }
            
            // Load data from JSON files
            await this.loadData();

            // Initialize the visualization
            this.setupVisualization();

            // Add event listeners
            this.addEventListeners();

            // Hide loading indicator if it exists
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
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
            // Use the utility function to load data with multiple fallback methods
            const basePath = window.APP_CONFIG?.dataBasePath || './';
            const result = await TaxonomyDataUtils.loadDataUniversal(basePath);
            this.categoriesData = result.categoriesData;
            this.techniquesData = result.techniquesData;
            
            console.log(`✅ Network Visualization: Successfully loaded complete taxonomy: ${this.categoriesData.categories.length} categories, ${TaxonomyDataUtils.countTechniques(this.techniquesData)} techniques`);
            
            // Debug: Check if secure-agent-architectures category exists
            const secureAgentCategory = this.categoriesData.categories.find(cat => cat.id === 'secure-agent-architectures');
            if (secureAgentCategory) {
                console.log(`🔒 Found Secure Agent Architectures category: ${secureAgentCategory.techniques.length} techniques`);
                console.log(`🔒 Techniques:`, secureAgentCategory.techniques);
            } else {
                console.warn('⚠️ Secure Agent Architectures category not found in categoriesData');
            }
            
            const secureAgentTechniquesCategory = this.techniquesData.categories.find(cat => cat.id === 'secure-agent-architectures');
            if (secureAgentTechniquesCategory) {
                console.log(`🔒 Found Secure Agent Architectures in techniquesData: ${secureAgentTechniquesCategory.techniques.length} techniques`);
                console.log(`🔒 First technique:`, secureAgentTechniquesCategory.techniques[0]?.name);
            } else {
                console.warn('⚠️ Secure Agent Architectures category not found in techniquesData');
            }
            
            // Process data into nodes and links
            this.processData();
        } catch (error) {
            console.error('❌ Network Visualization: Failed to load taxonomy data:', error);
            throw new Error('Failed to load data from JSON files');
        }
    }

    /**
     * Fallback loadData method using embedded data (kept for reference but not used)
     */
    async loadDataFallback() {
        try {
            // All data is now loaded via TaxonomyDataUtils.loadDataUniversal()
            // No embedded data needed
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error('Failed to load data from JSON files');
        }
    }

    /**
     * Process data into nodes and links for the visualization
     */
    /**
     * Process data into nodes and links for the visualization
     */
    processData() {
        this.nodes = [];
        this.links = [];
        
        // Create a map of category IDs to colors with a better color scheme
        const categoryColors = {};
        const colorScheme = d3.schemeTableau10; // Using Tableau's color scheme for better distinction
        this.categoriesData.categories.forEach((category, index) => {
            categoryColors[category.id] = colorScheme[index % colorScheme.length];
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
                    index: nodeIndex++,
                    // Track connection count for node sizing
                    connectionCount: 0
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
                        // Increment connection count for both nodes
                        node.connectionCount++;
                        targetNode.connectionCount++;
                        
                        this.links.push({
                            source: node.id,
                            target: relatedId,
                            value: 1, // Link strength
                            // Determine if this is bidirectional
                            bidirectional: targetNode.relatedTechniques &&
                                          targetNode.relatedTechniques.includes(node.id)
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
        
        // Create links with markers for directionality
        // First define arrow markers
        this.graph.append("defs").selectAll("marker")
            .data(["end", "end-bidirectional"])
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", d => d === "end-bidirectional" ? "#666" : "#999")
            .attr("d", "M0,-5L10,0L0,5");

        // Create links
        this.link = this.graph.append('g')
            .attr('class', 'links')
            .selectAll('path')  // Using paths instead of lines for curved links
            .data(this.links)
            .enter()
            .append('path')
            .attr('stroke', d => d.bidirectional ? '#666' : '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
            .attr('fill', 'none')
            .attr('marker-end', d => d.bidirectional ? "url(#end-bidirectional)" : "url(#end)");
        
        // Create nodes with scaled sizes based on connections
        this.node = this.graph.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('r', d => 5 + (d.connectionCount * 1.2))  // Scale by connection count
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('id', d => `node-${d.id}`)
            .attr('data-id', d => d.id)
            .on('click', this.handleNodeClick.bind(this))
            .on('mouseover', this.handleNodeMouseOver.bind(this))
            .on('mouseout', this.handleNodeMouseOut.bind(this))
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
            .force('charge', d3.forceManyBody().strength(-400))
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
        
        // Add related papers section
        if (node.sources && node.sources.length > 0) {
            content += `<div class="detail-section">
                <h4>Related Papers</h4>
                <ul class="sources-list">
                    ${node.sources.map(source => `<li>${source}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        details.innerHTML = content;
        
        // Calculate bidirectional links
        const linksTo = []; // Outgoing: this node links to these
        const linkedFrom = []; // Incoming: these nodes link to this node
        
        // Outgoing links (what this node explicitly references)
        if (node.relatedTechniques && node.relatedTechniques.length > 0) {
            node.relatedTechniques.forEach(relatedId => {
                const relatedNode = this.nodes.find(n => n.id === relatedId);
                if (relatedNode) {
                    linksTo.push(relatedNode);
                }
            });
        }
        
        // Incoming links (other nodes that reference this one)
        this.nodes.forEach(otherNode => {
            if (otherNode.id !== node.id && 
                otherNode.relatedTechniques && 
                otherNode.relatedTechniques.includes(node.id)) {
                // Check if it's not already in linksTo (avoid duplicates in bidirectional)
                if (!linksTo.find(n => n.id === otherNode.id)) {
                    linkedFrom.push(otherNode);
                }
            }
        });
        
        // Build related techniques section with bidirectional awareness
        relatedList.innerHTML = '';
        
        // Links To section (outgoing)
        if (linksTo.length > 0) {
            const linksToSection = document.createElement('div');
            linksToSection.className = 'links-to-section';
            linksToSection.innerHTML = `<div class="related-section-header"><i class="fas fa-arrow-right"></i> Links to</div>`;
            
            linksTo.forEach(relatedNode => {
                const relatedItem = this.createRelatedItem(relatedNode);
                linksToSection.appendChild(relatedItem);
            });
            relatedList.appendChild(linksToSection);
        }
        
        // Linked From section (incoming)
        if (linkedFrom.length > 0) {
            const linkedFromSection = document.createElement('div');
            linkedFromSection.className = 'linked-from-section';
            linkedFromSection.innerHTML = `<div class="related-section-header"><i class="fas fa-arrow-left"></i> Linked from</div>`;
            
            linkedFrom.forEach(relatedNode => {
                const relatedItem = this.createRelatedItem(relatedNode);
                linkedFromSection.appendChild(relatedItem);
            });
            relatedList.appendChild(linkedFromSection);
        }
        
        // Empty state
        if (linksTo.length === 0 && linkedFrom.length === 0) {
            relatedList.innerHTML = '<p class="empty-state">No connections to other techniques.</p>';
        }
    }

    /**
     * Create a clickable related item element
     */
    createRelatedItem(relatedNode) {
        const relatedItem = document.createElement('div');
        relatedItem.className = 'related-item';
        relatedItem.dataset.id = relatedNode.id;
        
        const colorDot = document.createElement('span');
        colorDot.className = 'related-color-dot';
        colorDot.style.backgroundColor = relatedNode.color;
        
        const relatedName = document.createElement('span');
        relatedName.className = 'related-name';
        relatedName.textContent = relatedNode.name;
        
        const navArrow = document.createElement('span');
        navArrow.className = 'nav-arrow';
        navArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        relatedItem.appendChild(colorDot);
        relatedItem.appendChild(relatedName);
        relatedItem.appendChild(navArrow);
        
        // Add click event
        relatedItem.addEventListener('click', () => {
            this.highlightNode(relatedNode.id);
        });
        
        return relatedItem;
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
        
        console.log(`🎯 Filtering by category: ${categoryId}`);
        
        if (categoryId === 'all') {
            // Show all nodes and links
            this.node.style('display', 'block');
            this.nodeLabels.style('display', 'block');
            
            // Show links that connect visible nodes
            this.link.style('display', d => 'block');
            
            console.log(`✅ Showing all ${this.nodes.length} nodes and ${this.links.length} links`);
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
            
            console.log(`📊 Found ${categoryNodeIds.size} nodes in category "${categoryId}":`, Array.from(categoryNodeIds));
            
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
            
            console.log(`🔗 Total connected nodes (including category + related): ${connectedNodeIds.size}`);
            
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
            
            // Count visible links
            let visibleLinks = 0;
            this.link.each(function(d) {
                if (d3.select(this).style('display') !== 'none') {
                    visibleLinks++;
                }
            });
            
            console.log(`👁️ Showing ${connectedNodeIds.size} nodes and ${visibleLinks} links for category "${categoryId}"`);
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
        
        // Export image button
        const exportButton = document.getElementById('export-image');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportAsImage();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('technique-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.searchTechniques(searchInput.value);
            });
        }
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Search techniques by name
     */
    searchTechniques(query) {
        if (!query || query.trim() === '') {
            // Reset all nodes and links to visible
            this.node.style('display', 'block');
            this.nodeLabels.style('display', 'block');
            this.link.style('display', 'block');
            return;
        }
        
        query = query.toLowerCase();
        
        // Find matching nodes
        const matchingNodeIds = new Set();
        this.nodes.forEach(node => {
            if (node.name.toLowerCase().includes(query) ||
                (node.aliases && node.aliases.some(alias => alias.toLowerCase().includes(query)))) {
                matchingNodeIds.add(node.id);
            }
        });
        
        // Show matching nodes and their direct connections
        this.node.style('display', d => matchingNodeIds.has(d.id) ? 'block' : 'none');
        this.nodeLabels.style('display', d => matchingNodeIds.has(d.id) ? 'block' : 'none');
        
        // Show links between visible nodes
        this.link.style('display', d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            
            return matchingNodeIds.has(sourceId) && matchingNodeIds.has(targetId) ? 'block' : 'none';
        });
        
        // Restart simulation
        this.simulation.alpha(0.3).restart();
    }
    
    /**
     * Export current view as an image
     */
    exportAsImage() {
        try {
            // Create a clone of the SVG
            const svgElement = document.getElementById('relationship-visualization');
            const svgClone = svgElement.cloneNode(true);
            
            // Set background color
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'white');
            svgClone.insertBefore(rect, svgClone.firstChild);
            
            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            // Create image from SVG
            const img = new Image();
            img.onload = function() {
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = svgElement.clientWidth;
                canvas.height = svgElement.clientHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw image to canvas
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                // Convert to PNG and download
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = 'technique-relationships.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Failed to export image. Please try again.');
        }
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
    /**
     * Update positions on each simulation tick
     */
    tick() {
        // Update link paths - curved if bidirectional
        this.link.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = d.bidirectional ? Math.sqrt(dx * dx + dy * dy) * 1.5 : 0;
            
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        this.node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        this.nodeLabels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }
    
    /**
     * Handle mouse over event on nodes
     */
    handleNodeMouseOver(event, d) {
        // Create tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'node-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000);
            
        tooltip.html(`<strong>${d.name}</strong><br>${this.getCategoryName(d.categoryId)}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.9);
            
        // Store tooltip reference on the node
        d.tooltip = tooltip;
        
        // Highlight node and its connections
        this.node.attr('opacity', n => this.isConnected(d, n) ? 1 : 0.3);
        this.link.attr('opacity', l =>
            (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1
        );
        this.nodeLabels.attr('opacity', n => this.isConnected(d, n) ? 1 : 0.3);
    }
    
    /**
     * Handle mouse out event on nodes
     */
    handleNodeMouseOut(event, d) {
        // Remove tooltip
        if (d.tooltip) {
            d.tooltip.transition()
                .duration(200)
                .style('opacity', 0)
                .remove();
            d.tooltip = null;
        }
        
        // Reset opacity
        this.node.attr('opacity', 1);
        this.link.attr('opacity', 0.6);
        this.nodeLabels.attr('opacity', 1);
    }
    
    /**
     * Check if two nodes are connected
     */
    isConnected(a, b) {
        if (a.id === b.id) return true; // Same node
        
        // Check if there's a link between them
        return this.links.some(l =>
            (l.source.id === a.id && l.target.id === b.id) ||
            (l.source.id === b.id && l.target.id === a.id)
        );
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