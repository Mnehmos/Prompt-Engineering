/**
 * Graph utilities for D3 relationship visualization
 * 
 * These functions transform technique data into graph structures
 * suitable for D3 force-directed network visualization.
 */

import type { TechniquesData } from '@/types/techniques';
import type { GraphData, GraphFilter, GraphNode, GraphStats } from '@/types/graph';

// Color palette for categories
const COLOR_PALETTE = [
  '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#5e60ce',
  '#7400b8', '#6930c3', '#64dfdf', '#80ffdb', '#72efdd',
  '#52b788', '#40916c', '#2d6a4f', '#1b4332', '#d62828',
  '#f77f00', '#fcbf49', '#eae2b7', '#003049', '#669bbc',
];

/**
 * Calculate visual node size based on connection count
 * More connections = larger node
 * 
 * @param connectionCount - Number of connections the node has
 * @returns Size value for visualization (clamped between min and max)
 */
export function calculateNodeSize(connectionCount: number): number {
  // Handle negative numbers by treating as zero
  const safeCount = Math.max(0, connectionCount);
  // Formula: min(50, max(5, 5 + connectionCount * 3))
  return Math.min(50, Math.max(5, 5 + safeCount * 3));
}

/**
 * Build graph data from techniques data
 * Creates nodes for all techniques and links from relatedTechniques
 * 
 * @param data - The full techniques data
 * @returns Graph data with nodes and links
 */
export function buildGraphData(data: TechniquesData): GraphData {
  const nodes: GraphNode[] = [];
  const links: { source: string; target: string; value: number }[] = [];
  
  // First pass: create a map of all technique IDs for validation
  const techniqueMap = new Map<string, { categoryId: string; categoryName: string; name: string }>();
  
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      techniqueMap.set(technique.id, {
        categoryId: category.id,
        categoryName: category.name,
        name: technique.name,
      });
    }
  }
  
  // Track links to deduplicate bidirectional connections
  const linkSet = new Set<string>();
  
  // Second pass: build nodes and collect links
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      // Process related techniques to create links
      const relatedTechniques = technique.relatedTechniques ?? [];
      
      for (const relatedId of relatedTechniques) {
        // Only create link if target exists
        if (techniqueMap.has(relatedId)) {
          // Create a canonical key to deduplicate A->B and B->A
          const ids = [technique.id, relatedId].sort();
          const linkKey = `${ids[0]}::${ids[1]}`;
          
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);
            links.push({
              source: ids[0],
              target: ids[1],
              value: 1,
            });
          }
        }
      }
    }
  }
  
  // Third pass: calculate connection counts and create nodes
  const connectionCounts = new Map<string, number>();
  
  // Initialize all counts to 0
  for (const id of techniqueMap.keys()) {
    connectionCounts.set(id, 0);
  }
  
  // Count connections from links
  for (const link of links) {
    connectionCounts.set(link.source, (connectionCounts.get(link.source) ?? 0) + 1);
    connectionCounts.set(link.target, (connectionCounts.get(link.target) ?? 0) + 1);
  }
  
  // Create nodes
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      const connectionCount = connectionCounts.get(technique.id) ?? 0;
      
      nodes.push({
        id: technique.id,
        name: technique.name,
        categoryId: category.id,
        categoryName: category.name,
        connectionCount,
        size: calculateNodeSize(connectionCount),
      });
    }
  }
  
  return { nodes, links };
}

/**
 * Filter a graph by categories, minimum connections, or search query
 * 
 * @param graph - The graph to filter
 * @param filter - Filter criteria
 * @returns Filtered graph with matching nodes and valid links
 */
export function filterGraph(graph: GraphData, filter: GraphFilter): GraphData {
  // Start with all nodes
  let filteredNodes = [...graph.nodes];
  
  // Filter by categories if provided
  if (filter.categories && filter.categories.length > 0) {
    const categorySet = new Set(filter.categories);
    filteredNodes = filteredNodes.filter(node => categorySet.has(node.categoryId));
  }
  
  // Filter by minimum connections if provided
  if (filter.minConnections !== undefined) {
    filteredNodes = filteredNodes.filter(node => node.connectionCount >= filter.minConnections!);
  }
  
  // Filter by search query if provided (case-insensitive name match)
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filteredNodes = filteredNodes.filter(node => node.name.toLowerCase().includes(query));
  }
  
  // Build set of remaining node IDs
  const nodeIdSet = new Set(filteredNodes.map(n => n.id));
  
  // Filter links to only include those connecting remaining nodes
  const filteredLinks = graph.links.filter(
    link => nodeIdSet.has(link.source) && nodeIdSet.has(link.target)
  );
  
  return { nodes: filteredNodes, links: filteredLinks };
}

/**
 * Get all node IDs connected to a given node
 * 
 * @param graph - The graph to search
 * @param nodeId - The source node ID
 * @returns Array of connected node IDs (excluding the source)
 */
export function getConnectedNodes(graph: GraphData, nodeId: string): string[] {
  const connected = new Set<string>();
  
  for (const link of graph.links) {
    if (link.source === nodeId) {
      connected.add(link.target);
    } else if (link.target === nodeId) {
      connected.add(link.source);
    }
  }
  
  // Don't include the source node itself
  connected.delete(nodeId);
  
  return Array.from(connected);
}

/**
 * Calculate statistics about a graph
 * 
 * @param graph - The graph to analyze
 * @returns Statistics including totals, averages, and extremes
 */
export function getGraphStats(graph: GraphData): GraphStats {
  const totalNodes = graph.nodes.length;
  const totalLinks = graph.links.length;
  
  if (totalNodes === 0) {
    return {
      totalNodes: 0,
      totalLinks: 0,
      avgConnections: 0,
      mostConnected: null,
      leastConnected: null,
      isolatedNodes: 0,
    };
  }
  
  // Calculate totals and find extremes
  let totalConnections = 0;
  let mostConnected: GraphNode | null = null;
  let leastConnected: GraphNode | null = null;
  let isolatedNodes = 0;
  
  for (const node of graph.nodes) {
    totalConnections += node.connectionCount;
    
    if (node.connectionCount === 0) {
      isolatedNodes++;
    } else {
      // Track most and least connected among non-isolated nodes
      if (!mostConnected || node.connectionCount > mostConnected.connectionCount) {
        mostConnected = node;
      }
      if (!leastConnected || node.connectionCount < leastConnected.connectionCount) {
        leastConnected = node;
      }
    }
  }
  
  const avgConnections = totalConnections / totalNodes;
  
  return {
    totalNodes,
    totalLinks,
    avgConnections,
    mostConnected: mostConnected 
      ? { id: mostConnected.id, name: mostConnected.name, connections: mostConnected.connectionCount }
      : null,
    leastConnected: leastConnected
      ? { id: leastConnected.id, name: leastConnected.name, connections: leastConnected.connectionCount }
      : null,
    isolatedNodes,
  };
}

/**
 * Generate consistent colors for categories
 * 
 * @param data - The techniques data containing categories
 * @returns Map of category ID to color hex code
 */
export function getCategoryColors(data: TechniquesData): Record<string, string> {
  const colors: Record<string, string> = {};
  
  for (let i = 0; i < data.categories.length; i++) {
    const category = data.categories[i];
    // Use modulo to cycle through palette if more categories than colors
    colors[category.id] = COLOR_PALETTE[i % COLOR_PALETTE.length];
  }
  
  return colors;
}
