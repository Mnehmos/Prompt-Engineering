import { defineCollection, z } from 'astro:content';

/**
 * Technique schema - validates individual technique entries
 */
const techniqueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  aliases: z.array(z.string()).optional(),
  example: z.string().optional(),
  sources: z.array(z.string()).optional(),
  useCase: z.string().optional(),
  tips: z.string().optional(),
  commonMistakes: z.string().optional(),
  relatedTechniques: z.array(z.string()).optional(),
});

/**
 * Category schema - validates category entries containing techniques
 */
const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  techniques: z.array(techniqueSchema),
});

/**
 * Techniques collection - validates the complete techniques data file
 * Data type collection for JSON files
 */
const techniques = defineCollection({
  type: 'data',
  schema: z.object({
    version: z.string(),
    lastUpdated: z.string(),
    metadata: z.object({
      originalSiteTechniques: z.number(),
      researchTechniques: z.number(),
      totalEnhanced: z.number(),
    }),
    categories: z.array(categorySchema),
  }),
});

export const collections = { techniques };
