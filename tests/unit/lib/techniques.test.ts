/**
 * Technique Utilities Test Suite
 * 
 * RED PHASE: These tests document expected behavior and MUST FAIL
 * until the implementation is completed in GREEN phase.
 */

import { describe, test, expect } from 'vitest';
import {
  getAllTechniques,
  getTechniqueById,
  getTechniquesByCategory,
  searchTechniques,
  getRelatedTechniques,
  getCategories,
  getTechniqueCount,
} from '@/lib/techniques';
import type { TechniquesData } from '@/types/techniques';

// Mock data for testing - mirrors actual data structure
const mockData: TechniquesData = {
  version: '2.1',
  lastUpdated: '2025-11-04',
  metadata: {
    originalSiteTechniques: 119,
    researchTechniques: 60,
    totalEnhanced: 182,
  },
  categories: [
    {
      id: 'context-engineering',
      name: 'Context Engineering',
      description: 'Managing information flow',
      techniques: [
        {
          id: 'chain-of-thought',
          name: 'Chain-of-Thought (CoT) Prompting',
          description: 'Step-by-step reasoning approach',
          example: "Let's think step by step...",
          relatedTechniques: ['zero-shot-cot', 'few-shot-cot'],
        },
        {
          id: 'context-compression',
          name: 'Context Compression',
          description: 'Compressing context efficiently for LLMs',
          relatedTechniques: ['chain-of-thought'],
        },
      ],
    },
    {
      id: 'reasoning-frameworks',
      name: 'Reasoning Frameworks',
      description: 'Structured reasoning techniques',
      techniques: [
        {
          id: 'zero-shot-cot',
          name: 'Zero-Shot CoT',
          description: 'CoT reasoning without examples',
          relatedTechniques: ['chain-of-thought'],
        },
      ],
    },
  ],
};

// Empty data for edge case testing
const emptyData: TechniquesData = {
  version: '1.0',
  lastUpdated: '2025-01-01',
  metadata: {
    originalSiteTechniques: 0,
    researchTechniques: 0,
    totalEnhanced: 0,
  },
  categories: [],
};

describe('Technique Utilities', () => {
  // ============================================================
  // getAllTechniques
  // ============================================================
  describe('getAllTechniques', () => {
    test('should return flattened array of all techniques from all categories', () => {
      const techniques = getAllTechniques(mockData);
      
      expect(techniques).toHaveLength(3);
      expect(techniques.map(t => t.id)).toContain('chain-of-thought');
      expect(techniques.map(t => t.id)).toContain('context-compression');
      expect(techniques.map(t => t.id)).toContain('zero-shot-cot');
    });

    test('should include categoryId in each technique', () => {
      const techniques = getAllTechniques(mockData);
      const cot = techniques.find(t => t.id === 'chain-of-thought');
      
      expect(cot?.categoryId).toBe('context-engineering');
    });

    test('should include categoryName in each technique', () => {
      const techniques = getAllTechniques(mockData);
      const cot = techniques.find(t => t.id === 'chain-of-thought');
      
      expect(cot?.categoryName).toBe('Context Engineering');
    });

    test('should return empty array when categories array is empty', () => {
      const result = getAllTechniques(emptyData);
      
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should preserve all original technique properties', () => {
      const techniques = getAllTechniques(mockData);
      const cot = techniques.find(t => t.id === 'chain-of-thought');
      
      expect(cot?.name).toBe('Chain-of-Thought (CoT) Prompting');
      expect(cot?.description).toBe('Step-by-step reasoning approach');
      expect(cot?.example).toBe("Let's think step by step...");
      expect(cot?.relatedTechniques).toContain('zero-shot-cot');
    });
  });

  // ============================================================
  // getTechniqueById
  // ============================================================
  describe('getTechniqueById', () => {
    test('should return technique when found by exact ID', () => {
      const technique = getTechniqueById(mockData, 'chain-of-thought');
      
      expect(technique).toBeDefined();
      expect(technique?.name).toBe('Chain-of-Thought (CoT) Prompting');
    });

    test('should return null for non-existent ID', () => {
      const result = getTechniqueById(mockData, 'non-existent-technique');
      
      expect(result).toBeNull();
    });

    test('should be case-insensitive when matching ID', () => {
      const technique = getTechniqueById(mockData, 'CHAIN-OF-THOUGHT');
      
      expect(technique).toBeDefined();
      expect(technique?.id).toBe('chain-of-thought');
    });

    test('should be case-insensitive with mixed case', () => {
      const technique = getTechniqueById(mockData, 'Chain-Of-Thought');
      
      expect(technique).toBeDefined();
    });

    test('should include category information in returned technique', () => {
      const technique = getTechniqueById(mockData, 'zero-shot-cot');
      
      expect(technique?.categoryId).toBe('reasoning-frameworks');
      expect(technique?.categoryName).toBe('Reasoning Frameworks');
    });

    test('should return null for empty string ID', () => {
      const result = getTechniqueById(mockData, '');
      
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // getTechniquesByCategory
  // ============================================================
  describe('getTechniquesByCategory', () => {
    test('should return all techniques in a specific category', () => {
      const techniques = getTechniquesByCategory(mockData, 'context-engineering');
      
      expect(techniques).toHaveLength(2);
      expect(techniques.map(t => t.id)).toContain('chain-of-thought');
      expect(techniques.map(t => t.id)).toContain('context-compression');
    });

    test('should return empty array for non-existent category', () => {
      const result = getTechniquesByCategory(mockData, 'non-existent-category');
      
      expect(result).toEqual([]);
    });

    test('should return techniques with category info attached', () => {
      const techniques = getTechniquesByCategory(mockData, 'reasoning-frameworks');
      
      expect(techniques[0]?.categoryId).toBe('reasoning-frameworks');
      expect(techniques[0]?.categoryName).toBe('Reasoning Frameworks');
    });

    test('should handle category with single technique', () => {
      const techniques = getTechniquesByCategory(mockData, 'reasoning-frameworks');
      
      expect(techniques).toHaveLength(1);
      expect(techniques[0]?.id).toBe('zero-shot-cot');
    });
  });

  // ============================================================
  // searchTechniques
  // ============================================================
  describe('searchTechniques', () => {
    test('should find techniques by partial name match', () => {
      const results = searchTechniques(mockData, 'Chain');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('chain-of-thought');
    });

    test('should find techniques by description content', () => {
      const results = searchTechniques(mockData, 'step-by-step');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('chain-of-thought');
    });

    test('should search case-insensitively', () => {
      const results = searchTechniques(mockData, 'CHAIN');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('chain-of-thought');
    });

    test('should return empty array when no matches found', () => {
      const results = searchTechniques(mockData, 'xyz123nonexistent');
      
      expect(results).toEqual([]);
    });

    test('should find multiple matching techniques', () => {
      // "cot" appears in chain-of-thought name and zero-shot-cot
      const results = searchTechniques(mockData, 'cot');
      
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should include category info in search results', () => {
      const results = searchTechniques(mockData, 'compression');
      
      expect(results[0]?.categoryId).toBe('context-engineering');
    });

    test('should return empty array for empty query', () => {
      const results = searchTechniques(mockData, '');
      
      expect(results).toEqual([]);
    });

    test('should handle whitespace-only query', () => {
      const results = searchTechniques(mockData, '   ');
      
      expect(results).toEqual([]);
    });
  });

  // ============================================================
  // getRelatedTechniques
  // ============================================================
  describe('getRelatedTechniques', () => {
    test('should return related techniques by ID reference', () => {
      const related = getRelatedTechniques(mockData, 'chain-of-thought');
      
      expect(related.map(t => t.id)).toContain('zero-shot-cot');
    });

    test('should return empty array when technique has no relations', () => {
      // Create data with a technique that has no relatedTechniques
      const dataWithIsolated: TechniquesData = {
        ...mockData,
        categories: [
          {
            id: 'test-cat',
            name: 'Test Category',
            description: 'Test',
            techniques: [
              {
                id: 'isolated-technique',
                name: 'Isolated',
                description: 'No relations',
                // No relatedTechniques field
              },
            ],
          },
        ],
      };
      
      const related = getRelatedTechniques(dataWithIsolated, 'isolated-technique');
      
      expect(related).toEqual([]);
    });

    test('should return empty array for non-existent technique ID', () => {
      const related = getRelatedTechniques(mockData, 'non-existent');
      
      expect(related).toEqual([]);
    });

    test('should handle circular references gracefully', () => {
      // chain-of-thought -> zero-shot-cot -> chain-of-thought
      const related = getRelatedTechniques(mockData, 'zero-shot-cot');
      
      expect(related.map(t => t.id)).toContain('chain-of-thought');
    });

    test('should only return techniques that exist in data', () => {
      // chain-of-thought references 'few-shot-cot' which doesn't exist in mockData
      const related = getRelatedTechniques(mockData, 'chain-of-thought');
      
      // Should have zero-shot-cot but not few-shot-cot (doesn't exist)
      expect(related.map(t => t.id)).toContain('zero-shot-cot');
      expect(related.map(t => t.id)).not.toContain('few-shot-cot');
    });

    test('should include category info in related techniques', () => {
      const related = getRelatedTechniques(mockData, 'context-compression');
      
      // context-compression is related to chain-of-thought
      const cot = related.find(t => t.id === 'chain-of-thought');
      expect(cot?.categoryId).toBe('context-engineering');
    });
  });

  // ============================================================
  // getCategories
  // ============================================================
  describe('getCategories', () => {
    test('should return all category metadata', () => {
      const categories = getCategories(mockData);
      
      expect(categories).toHaveLength(2);
      expect(categories[0].id).toBe('context-engineering');
      expect(categories[1].id).toBe('reasoning-frameworks');
    });

    test('should include technique count per category', () => {
      const categories = getCategories(mockData);
      const contextEng = categories.find(c => c.id === 'context-engineering');
      
      expect(contextEng?.techniqueCount).toBe(2);
    });

    test('should include category name in summary', () => {
      const categories = getCategories(mockData);
      
      expect(categories[0].name).toBe('Context Engineering');
    });

    test('should include category description in summary', () => {
      const categories = getCategories(mockData);
      
      expect(categories[0].description).toBe('Managing information flow');
    });

    test('should return empty array for empty data', () => {
      const categories = getCategories(emptyData);
      
      expect(categories).toEqual([]);
    });

    test('should calculate correct technique count for each category', () => {
      const categories = getCategories(mockData);
      const reasoningFW = categories.find(c => c.id === 'reasoning-frameworks');
      
      expect(reasoningFW?.techniqueCount).toBe(1);
    });
  });

  // ============================================================
  // getTechniqueCount
  // ============================================================
  describe('getTechniqueCount', () => {
    test('should return total count of all techniques', () => {
      const count = getTechniqueCount(mockData);
      
      expect(count).toBe(3);
    });

    test('should return 0 for empty data', () => {
      const count = getTechniqueCount(emptyData);
      
      expect(count).toBe(0);
    });

    test('should count techniques across all categories', () => {
      // mockData has 2 in context-engineering + 1 in reasoning-frameworks = 3
      const count = getTechniqueCount(mockData);
      
      expect(count).toBe(3);
    });

    test('should handle single category with multiple techniques', () => {
      const singleCategoryData: TechniquesData = {
        ...emptyData,
        categories: [
          {
            id: 'single',
            name: 'Single',
            description: 'Single category',
            techniques: [
              { id: 't1', name: 'T1', description: 'D1' },
              { id: 't2', name: 'T2', description: 'D2' },
              { id: 't3', name: 'T3', description: 'D3' },
            ],
          },
        ],
      };
      
      expect(getTechniqueCount(singleCategoryData)).toBe(3);
    });
  });
});
