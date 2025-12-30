/**
 * Graph Utilities Tests (RED Phase)
 * 
 * Comprehensive tests for the relationship graph visualization utilities.
 * These tests cover building graph data from techniques, filtering,
 * calculating statistics, and managing colors.
 */

import { describe, test, expect } from 'vitest';
import {
  buildGraphData,
  filterGraph,
  getConnectedNodes,
  calculateNodeSize,
  getGraphStats,
  getCategoryColors,
} from '@/lib/graph';
import type { TechniquesData } from '@/types/techniques';
import type { GraphData, GraphFilter } from '@/types/graph';

// Mock data structure matching techniques.json format
const mockData: TechniquesData = {
  version: '2.1',
  lastUpdated: '2025-11-04',
  metadata: { originalSiteTechniques: 119, researchTechniques: 60, totalEnhanced: 182 },
  categories: [
    {
      id: 'context-engineering',
      name: 'Context Engineering',
      description: 'Managing information flow',
      techniques: [
        {
          id: 'chain-of-thought',
          name: 'Chain-of-Thought',
          description: 'Step-by-step reasoning',
          relatedTechniques: ['zero-shot-cot', 'few-shot-cot'],
        },
        {
          id: 'context-compression',
          name: 'Context Compression',
          description: 'Compressing context',
          relatedTechniques: ['chain-of-thought'],
        },
      ],
    },
    {
      id: 'reasoning-frameworks',
      name: 'Reasoning Frameworks',
      description: 'Reasoning techniques',
      techniques: [
        {
          id: 'zero-shot-cot',
          name: 'Zero-Shot CoT',
          description: 'CoT without examples',
          relatedTechniques: ['chain-of-thought'],
        },
        {
          id: 'few-shot-cot',
          name: 'Few-Shot CoT',
          description: 'CoT with examples',
          relatedTechniques: ['chain-of-thought', 'zero-shot-cot'],
        },
        {
          id: 'isolated-technique',
          name: 'Isolated Technique',
          description: 'No relations',
          relatedTechniques: [],
        },
      ],
    },
  ],
};

describe('Graph Utilities', () => {
  describe('buildGraphData', () => {
    test('should create nodes for all techniques', () => {
      const graph = buildGraphData(mockData);
      expect(graph.nodes).toHaveLength(5);
      expect(graph.nodes.map(n => n.id)).toContain('chain-of-thought');
      expect(graph.nodes.map(n => n.id)).toContain('isolated-technique');
    });

    test('should create bidirectional links from relatedTechniques', () => {
      const graph = buildGraphData(mockData);
      // chain-of-thought relates to zero-shot-cot and few-shot-cot
      // zero-shot-cot relates back to chain-of-thought
      // Links should be deduplicated
      expect(graph.links.length).toBeGreaterThan(0);
    });

    test('should deduplicate links (A->B and B->A become one link)', () => {
      const graph = buildGraphData(mockData);
      const cotToZero = graph.links.filter(
        l => (l.source === 'chain-of-thought' && l.target === 'zero-shot-cot') ||
             (l.source === 'zero-shot-cot' && l.target === 'chain-of-thought')
      );
      expect(cotToZero).toHaveLength(1);
    });

    test('should include category info in nodes', () => {
      const graph = buildGraphData(mockData);
      const cot = graph.nodes.find(n => n.id === 'chain-of-thought');
      expect(cot?.categoryId).toBe('context-engineering');
      expect(cot?.categoryName).toBe('Context Engineering');
    });

    test('should calculate connection count for each node', () => {
      const graph = buildGraphData(mockData);
      const cot = graph.nodes.find(n => n.id === 'chain-of-thought');
      // chain-of-thought connects to: zero-shot-cot, few-shot-cot, context-compression
      expect(cot?.connectionCount).toBeGreaterThanOrEqual(2);
    });

    test('should set size property based on connectionCount', () => {
      const graph = buildGraphData(mockData);
      const cot = graph.nodes.find(n => n.id === 'chain-of-thought');
      const isolated = graph.nodes.find(n => n.id === 'isolated-technique');
      expect(cot?.size).toBeGreaterThan(isolated?.size ?? 0);
    });

    test('should handle empty data', () => {
      const emptyData: TechniquesData = { 
        ...mockData, 
        categories: [] 
      };
      const graph = buildGraphData(emptyData);
      expect(graph.nodes).toEqual([]);
      expect(graph.links).toEqual([]);
    });

    test('should ignore links to non-existent techniques', () => {
      const dataWithBadLink: TechniquesData = {
        ...mockData,
        categories: [{
          id: 'test',
          name: 'Test',
          description: 'Test',
          techniques: [{
            id: 'test-tech',
            name: 'Test Tech',
            description: 'Test',
            relatedTechniques: ['non-existent-tech'],
          }],
        }],
      };
      const graph = buildGraphData(dataWithBadLink);
      expect(graph.links).toHaveLength(0);
    });

    test('should handle techniques without relatedTechniques field', () => {
      const dataWithMissingField: TechniquesData = {
        ...mockData,
        categories: [{
          id: 'test',
          name: 'Test',
          description: 'Test',
          techniques: [{
            id: 'test-tech',
            name: 'Test Tech',
            description: 'Test',
            // No relatedTechniques field
          }],
        }],
      };
      const graph = buildGraphData(dataWithMissingField);
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].connectionCount).toBe(0);
    });

    test('should set link value to 1 by default', () => {
      const graph = buildGraphData(mockData);
      expect(graph.links.every(l => l.value === 1)).toBe(true);
    });
  });

  describe('filterGraph', () => {
    test('should filter by category', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { categories: ['context-engineering'] };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes).toHaveLength(2);
      expect(filtered.nodes.every(n => n.categoryId === 'context-engineering')).toBe(true);
    });

    test('should filter by multiple categories', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { categories: ['context-engineering', 'reasoning-frameworks'] };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes).toHaveLength(5);
    });

    test('should filter by minimum connections', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { minConnections: 2 };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes.every(n => n.connectionCount >= 2)).toBe(true);
    });

    test('should filter by search query (name match)', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { searchQuery: 'cot' };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes.length).toBeGreaterThan(0);
      expect(filtered.nodes.every(n => n.name.toLowerCase().includes('cot'))).toBe(true);
    });

    test('should perform case-insensitive search', () => {
      const graph = buildGraphData(mockData);
      const filterLower: GraphFilter = { searchQuery: 'chain' };
      const filterUpper: GraphFilter = { searchQuery: 'CHAIN' };
      const filteredLower = filterGraph(graph, filterLower);
      const filteredUpper = filterGraph(graph, filterUpper);
      expect(filteredLower.nodes.length).toBe(filteredUpper.nodes.length);
    });

    test('should remove orphaned links when nodes are filtered', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { categories: ['context-engineering'] };
      const filtered = filterGraph(graph, filter);
      // Links should only connect nodes that are in the filtered set
      const nodeIds = new Set(filtered.nodes.map(n => n.id));
      filtered.links.forEach(link => {
        expect(nodeIds.has(link.source)).toBe(true);
        expect(nodeIds.has(link.target)).toBe(true);
      });
    });

    test('should combine multiple filters (AND logic)', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { 
        categories: ['reasoning-frameworks'],
        searchQuery: 'cot'
      };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes.every(n => 
        n.categoryId === 'reasoning-frameworks' && 
        n.name.toLowerCase().includes('cot')
      )).toBe(true);
    });

    test('should return empty graph when no nodes match filters', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = { searchQuery: 'nonexistent-technique-xyz' };
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes).toEqual([]);
      expect(filtered.links).toEqual([]);
    });

    test('should return full graph when filter is empty', () => {
      const graph = buildGraphData(mockData);
      const filter: GraphFilter = {};
      const filtered = filterGraph(graph, filter);
      expect(filtered.nodes.length).toBe(graph.nodes.length);
      expect(filtered.links.length).toBe(graph.links.length);
    });
  });

  describe('getConnectedNodes', () => {
    test('should return directly connected node IDs', () => {
      const graph = buildGraphData(mockData);
      const connected = getConnectedNodes(graph, 'chain-of-thought');
      expect(connected).toContain('zero-shot-cot');
      expect(connected).toContain('few-shot-cot');
    });

    test('should not include the source node', () => {
      const graph = buildGraphData(mockData);
      const connected = getConnectedNodes(graph, 'chain-of-thought');
      expect(connected).not.toContain('chain-of-thought');
    });

    test('should return empty array for isolated nodes', () => {
      const graph = buildGraphData(mockData);
      const connected = getConnectedNodes(graph, 'isolated-technique');
      expect(connected).toEqual([]);
    });

    test('should return empty array for non-existent node', () => {
      const graph = buildGraphData(mockData);
      const connected = getConnectedNodes(graph, 'non-existent');
      expect(connected).toEqual([]);
    });

    test('should find connections regardless of link direction', () => {
      const graph = buildGraphData(mockData);
      // If chain-of-thought -> zero-shot-cot exists
      // then getConnectedNodes(zero-shot-cot) should include chain-of-thought
      const connectedFromCoT = getConnectedNodes(graph, 'chain-of-thought');
      const connectedFromZero = getConnectedNodes(graph, 'zero-shot-cot');
      
      if (connectedFromCoT.includes('zero-shot-cot')) {
        expect(connectedFromZero).toContain('chain-of-thought');
      }
    });

    test('should return unique node IDs (no duplicates)', () => {
      const graph = buildGraphData(mockData);
      const connected = getConnectedNodes(graph, 'chain-of-thought');
      const uniqueConnected = [...new Set(connected)];
      expect(connected.length).toBe(uniqueConnected.length);
    });
  });

  describe('calculateNodeSize', () => {
    test('should return larger size for more connected nodes', () => {
      const highConnections = calculateNodeSize(10);
      const lowConnections = calculateNodeSize(1);
      expect(highConnections).toBeGreaterThan(lowConnections);
    });

    test('should return minimum size for zero connections', () => {
      const size = calculateNodeSize(0);
      expect(size).toBeGreaterThan(0);
    });

    test('should clamp size within reasonable bounds', () => {
      const hugeConnections = calculateNodeSize(1000);
      expect(hugeConnections).toBeLessThanOrEqual(50); // Max size
      expect(hugeConnections).toBeGreaterThanOrEqual(5);  // Min size
    });

    test('should return consistent values for same input', () => {
      const size1 = calculateNodeSize(5);
      const size2 = calculateNodeSize(5);
      expect(size1).toBe(size2);
    });

    test('should scale proportionally within bounds', () => {
      const small = calculateNodeSize(2);
      const medium = calculateNodeSize(5);
      const large = calculateNodeSize(8);
      expect(medium).toBeGreaterThan(small);
      expect(large).toBeGreaterThan(medium);
    });

    test('should handle negative numbers by treating as zero', () => {
      const negativeSize = calculateNodeSize(-5);
      const zeroSize = calculateNodeSize(0);
      expect(negativeSize).toBe(zeroSize);
    });
  });

  describe('getGraphStats', () => {
    test('should return correct total counts', () => {
      const graph = buildGraphData(mockData);
      const stats = getGraphStats(graph);
      expect(stats.totalNodes).toBe(5);
      expect(stats.totalLinks).toBeGreaterThan(0);
    });

    test('should identify most connected node', () => {
      const graph = buildGraphData(mockData);
      const stats = getGraphStats(graph);
      expect(stats.mostConnected).not.toBeNull();
      expect(stats.mostConnected?.id).toBe('chain-of-thought');
    });

    test('should identify least connected node (non-isolated)', () => {
      const graph = buildGraphData(mockData);
      const stats = getGraphStats(graph);
      expect(stats.leastConnected).not.toBeNull();
      // Should be a node with connections, but the fewest
    });

    test('should identify isolated nodes', () => {
      const graph = buildGraphData(mockData);
      const stats = getGraphStats(graph);
      expect(stats.isolatedNodes).toBe(1); // isolated-technique
    });

    test('should calculate average connections', () => {
      const graph = buildGraphData(mockData);
      const stats = getGraphStats(graph);
      expect(stats.avgConnections).toBeGreaterThanOrEqual(0);
      expect(typeof stats.avgConnections).toBe('number');
    });

    test('should handle empty graph', () => {
      const emptyGraph: GraphData = { nodes: [], links: [] };
      const stats = getGraphStats(emptyGraph);
      expect(stats.totalNodes).toBe(0);
      expect(stats.totalLinks).toBe(0);
      expect(stats.avgConnections).toBe(0);
      expect(stats.mostConnected).toBeNull();
      expect(stats.leastConnected).toBeNull();
      expect(stats.isolatedNodes).toBe(0);
    });

    test('should return correct average for simple graph', () => {
      // Build a known graph to verify calculation
      const simpleGraph: GraphData = {
        nodes: [
          { id: 'a', name: 'A', categoryId: 'cat', categoryName: 'Cat', connectionCount: 2, size: 10 },
          { id: 'b', name: 'B', categoryId: 'cat', categoryName: 'Cat', connectionCount: 1, size: 8 },
          { id: 'c', name: 'C', categoryId: 'cat', categoryName: 'Cat', connectionCount: 1, size: 8 },
        ],
        links: [
          { source: 'a', target: 'b', value: 1 },
          { source: 'a', target: 'c', value: 1 },
        ],
      };
      const stats = getGraphStats(simpleGraph);
      // Total connections: 2 + 1 + 1 = 4, divided by 3 nodes = ~1.33
      expect(stats.avgConnections).toBeCloseTo(4 / 3, 1);
    });
  });

  describe('getCategoryColors', () => {
    test('should return consistent color for each category', () => {
      const colors = getCategoryColors(mockData);
      expect(colors['context-engineering']).toBeDefined();
      expect(colors['reasoning-frameworks']).toBeDefined();
    });

    test('should return same color for same category ID', () => {
      const colors1 = getCategoryColors(mockData);
      const colors2 = getCategoryColors(mockData);
      expect(colors1['context-engineering']).toBe(colors2['context-engineering']);
    });

    test('should return different colors for different categories', () => {
      const colors = getCategoryColors(mockData);
      expect(colors['context-engineering']).not.toBe(colors['reasoning-frameworks']);
    });

    test('should return valid hex color codes', () => {
      const colors = getCategoryColors(mockData);
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(colors).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    test('should return empty object for empty data', () => {
      const emptyData: TechniquesData = { ...mockData, categories: [] };
      const colors = getCategoryColors(emptyData);
      expect(Object.keys(colors)).toHaveLength(0);
    });

    test('should handle many categories without color collisions', () => {
      const manyCategories: TechniquesData = {
        ...mockData,
        categories: Array.from({ length: 10 }, (_, i) => ({
          id: `category-${i}`,
          name: `Category ${i}`,
          description: `Description ${i}`,
          techniques: [],
        })),
      };
      const colors = getCategoryColors(manyCategories);
      const uniqueColors = new Set(Object.values(colors));
      expect(uniqueColors.size).toBe(10); // All colors should be unique
    });
  });
});
