/**
 * Graph type definitions for D3 visualization
 *
 * These types define the structure for the relationship graph
 * where nodes are techniques and edges represent relationships.
 */

/**
 * Represents a node in the relationship graph (a technique)
 */
export interface GraphNode {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  connectionCount: number;
  size: number;  // Calculated based on connections
  x?: number;    // D3 will populate these
  y?: number;
}

/**
 * Represents an edge/link between two techniques
 */
export interface GraphLink {
  source: string;  // technique id
  target: string;  // technique id
  value: number;   // link weight (default 1)
}

/**
 * Complete graph data structure for D3 visualization
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Statistics about the graph for display purposes
 */
export interface GraphStats {
  totalNodes: number;
  totalLinks: number;
  avgConnections: number;
  mostConnected: { id: string; name: string; connections: number } | null;
  leastConnected: { id: string; name: string; connections: number } | null;
  isolatedNodes: number;  // Nodes with 0 connections
}

/**
 * Filter options for the graph visualization
 */
export interface GraphFilter {
  categories?: string[];
  minConnections?: number;
  searchQuery?: string;
}
