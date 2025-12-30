/**
 * Technique utility functions
 * 
 * These utilities provide access to the techniques data structure,
 * supporting search, filtering, and relationship navigation.
 */

import type { 
  TechniquesData, 
  TechniqueWithCategory, 
  CategorySummary 
} from '@/types/techniques';

/**
 * Get all techniques flattened from all categories
 * Each technique includes its category information
 */
export function getAllTechniques(data: TechniquesData): TechniqueWithCategory[] {
  const result: TechniqueWithCategory[] = [];
  
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      result.push({
        ...technique,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }
  
  return result;
}

/**
 * Get a single technique by its ID
 * Returns null if not found
 * Case-insensitive matching
 */
export function getTechniqueById(data: TechniquesData, id: string): TechniqueWithCategory | null {
  if (!id) {
    return null;
  }
  
  const lowerCaseId = id.toLowerCase();
  
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      if (technique.id.toLowerCase() === lowerCaseId) {
        return {
          ...technique,
          categoryId: category.id,
          categoryName: category.name,
        };
      }
    }
  }
  
  return null;
}

/**
 * Get all techniques belonging to a specific category
 * Returns empty array if category not found
 */
export function getTechniquesByCategory(data: TechniquesData, categoryId: string): TechniqueWithCategory[] {
  const category = data.categories.find(c => c.id === categoryId);
  
  if (!category) {
    return [];
  }
  
  return category.techniques.map(technique => ({
    ...technique,
    categoryId: category.id,
    categoryName: category.name,
  }));
}

/**
 * Search techniques by name and description
 * Case-insensitive partial matching
 */
export function searchTechniques(data: TechniquesData, query: string): TechniqueWithCategory[] {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return [];
  }
  
  const lowerCaseQuery = trimmedQuery.toLowerCase();
  const results: TechniqueWithCategory[] = [];
  
  for (const category of data.categories) {
    for (const technique of category.techniques) {
      const nameMatch = technique.name.toLowerCase().includes(lowerCaseQuery);
      const descMatch = technique.description.toLowerCase().includes(lowerCaseQuery);
      
      if (nameMatch || descMatch) {
        results.push({
          ...technique,
          categoryId: category.id,
          categoryName: category.name,
        });
      }
    }
  }
  
  return results;
}

/**
 * Get related techniques for a given technique ID
 * Resolves relatedTechniques IDs to full technique objects
 */
export function getRelatedTechniques(data: TechniquesData, techniqueId: string): TechniqueWithCategory[] {
  const technique = getTechniqueById(data, techniqueId);
  
  if (!technique || !technique.relatedTechniques || technique.relatedTechniques.length === 0) {
    return [];
  }
  
  const results: TechniqueWithCategory[] = [];
  
  for (const relatedId of technique.relatedTechniques) {
    const related = getTechniqueById(data, relatedId);
    if (related) {
      results.push(related);
    }
  }
  
  return results;
}

/**
 * Get all categories with summary information
 * Includes technique count per category
 */
export function getCategories(data: TechniquesData): CategorySummary[] {
  return data.categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    techniqueCount: category.techniques.length,
  }));
}

/**
 * Get total count of all techniques across all categories
 */
export function getTechniqueCount(data: TechniquesData): number {
  return data.categories.reduce((total, category) => total + category.techniques.length, 0);
}
