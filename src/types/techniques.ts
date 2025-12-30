/**
 * Technique type definitions
 * 
 * These types match the structure in data/processed/techniques.json
 * and are used by the technique utility functions.
 */

export interface Technique {
  id: string;
  name: string;
  description: string;
  aliases?: string[];
  example?: string;
  sources?: string[];
  useCase?: string;
  tips?: string;
  commonMistakes?: string;
  relatedTechniques?: string[];
}

export interface TechniqueWithCategory extends Technique {
  categoryId: string;
  categoryName: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  techniques: Technique[];
}

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  techniqueCount: number;
}

export interface TechniquesData {
  version: string;
  lastUpdated: string;
  metadata: {
    originalSiteTechniques: number;
    researchTechniques: number;
    totalEnhanced: number;
  };
  categories: Category[];
}
