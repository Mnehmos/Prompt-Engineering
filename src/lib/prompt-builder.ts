import type { TechniquesData } from '@/types/techniques';
import type {
  PromptData,
  PromptQuality,
  PromptStats,
  PromptTemplate,
  GeneratedPrompt,
} from '@/types/prompt-builder';

/**
 * Finds a technique by ID across all categories in the techniques data
 */
function findTechnique(
  techniqueId: string,
  techniquesData: TechniquesData
): { id: string; name: string; description: string } | undefined {
  for (const category of techniquesData.categories) {
    const found = category.techniques.find((t) => t.id === techniqueId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/**
 * Generate a complete prompt from prompt data, selected techniques, and technique definitions
 */
export function generatePrompt(
  data: PromptData,
  techniques: string[],
  techniquesData: TechniquesData
): GeneratedPrompt {
  const sections: GeneratedPrompt['sections'] = {};
  const parts: string[] = [];

  // 1. Role section (if provided)
  if (data.role && data.role.trim()) {
    sections.role = data.role;
    parts.push(data.role);
  }

  // 2. Techniques section (if any techniques selected)
  if (techniques.length > 0) {
    const techniqueInstructions = formatTechniqueInstructions(techniques, techniquesData);
    if (techniqueInstructions) {
      sections.techniques = techniqueInstructions;
      parts.push(techniqueInstructions);
    }
  }

  // 3. Task section (if provided)
  if (data.task && data.task.trim()) {
    sections.task = data.task;
    parts.push(data.task);
  }

  // 4. Context section (if provided)
  if (data.context && data.context.trim()) {
    sections.context = data.context;
    parts.push(data.context);
  }

  // 5. Output section (if provided)
  if (data.output && data.output.trim()) {
    sections.output = data.output;
    parts.push(data.output);
  }

  return {
    text: parts.join('\n\n'),
    sections,
  };
}

/**
 * Calculate quality score for prompt data
 */
export function calculateQuality(data: PromptData, techniqueCount: number): PromptQuality {
  const breakdown = {
    role: 0,        // 0-20
    task: 0,        // 0-30
    context: 0,     // 0-15
    output: 0,      // 0-15
    techniques: 0,  // 0-20
  };

  const suggestions: string[] = [];

  // Role score (0-20): based on length and content
  if (data.role && data.role.trim()) {
    const roleLen = data.role.trim().length;
    if (roleLen >= 50) {
      breakdown.role = 20;
    } else if (roleLen >= 20) {
      breakdown.role = 15;
    } else if (roleLen >= 10) {
      breakdown.role = 10;
    } else {
      breakdown.role = 5;
    }
  } else {
    suggestions.push('Add a role description to give the AI context about who it should be.');
  }

  // Task score (0-30): most important section
  if (data.task && data.task.trim()) {
    const taskLen = data.task.trim().length;
    if (taskLen >= 60) {
      breakdown.task = 30;
    } else if (taskLen >= 30) {
      breakdown.task = 20;
    } else if (taskLen >= 10) {
      breakdown.task = 15;
    } else {
      breakdown.task = 5;
    }
  } else {
    suggestions.push('Add a clear task description.');
  }

  // Context score (0-15)
  if (data.context && data.context.trim()) {
    const contextLen = data.context.trim().length;
    if (contextLen >= 40) {
      breakdown.context = 15;
    } else if (contextLen >= 20) {
      breakdown.context = 10;
    } else {
      breakdown.context = 5;
    }
  } else {
    suggestions.push('Add context to provide background information.');
  }

  // Output score (0-15)
  if (data.output && data.output.trim()) {
    const outputLen = data.output.trim().length;
    if (outputLen >= 30) {
      breakdown.output = 15;
    } else if (outputLen >= 15) {
      breakdown.output = 10;
    } else {
      breakdown.output = 5;
    }
  } else {
    suggestions.push('Specify the expected output format.');
  }

  // Techniques score (0-20)
  if (techniqueCount >= 3) {
    breakdown.techniques = 20;
  } else if (techniqueCount === 2) {
    breakdown.techniques = 15;
  } else if (techniqueCount === 1) {
    breakdown.techniques = 10;
  } else {
    suggestions.push('Consider adding techniques to improve prompt effectiveness.');
  }

  const score = breakdown.role + breakdown.task + breakdown.context + breakdown.output + breakdown.techniques;

  let level: PromptQuality['level'];
  if (score >= 80) {
    level = 'excellent';
  } else if (score >= 50) {
    level = 'good';
  } else if (score >= 30) {
    level = 'fair';
  } else {
    level = 'poor';
  }

  return {
    score,
    level,
    breakdown,
    suggestions,
  };
}

/**
 * Estimate token count from text (rough approximation: ~4 chars per token)
 */
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) {
    return 0;
  }
  // Rough estimate: 1 token per 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Suggest techniques based on keywords in the task text
 */
export function suggestTechniques(
  taskText: string,
  techniquesData: TechniquesData,
  excludeIds?: string[]
): string[] {
  const text = taskText.toLowerCase();
  const suggestions: string[] = [];
  const exclude = new Set(excludeIds || []);

  // Keyword-to-technique mapping
  const keywordMap: Record<string, string[]> = {
    'step by step': ['chain-of-thought'],
    'step-by-step': ['chain-of-thought'],
    'analyze': ['chain-of-thought', 'tree-of-thoughts'],
    'solve': ['chain-of-thought', 'tree-of-thoughts', 'self-consistency'],
    'reason': ['chain-of-thought', 'self-consistency'],
    'example': ['few-shot-learning'],
    'examples': ['few-shot-learning'],
    'compare': ['tree-of-thoughts'],
    'multiple': ['tree-of-thoughts', 'self-consistency'],
  };

  // Check each keyword and add matching techniques
  for (const [keyword, techniques] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      for (const techniqueId of techniques) {
        if (!exclude.has(techniqueId) && !suggestions.includes(techniqueId)) {
          // Verify technique exists in data
          if (findTechnique(techniqueId, techniquesData)) {
            suggestions.push(techniqueId);
          }
        }
      }
    }
  }

  // Limit to 5 suggestions
  return suggestions.slice(0, 5);
}

/**
 * Get stats about the generated prompt text
 */
export function getPromptStats(text: string, techniqueCount: number): PromptStats {
  return {
    charCount: text.length,
    estimatedTokens: estimateTokens(text),
    techniqueCount,
  };
}

/**
 * Validate prompt data and return errors/warnings
 */
export function validatePromptData(data: PromptData): {
  valid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];
  const warnings: { field: string; message: string }[] = [];

  // Task is required
  if (!data.task || !data.task.trim()) {
    errors.push({ field: 'task', message: 'Task is required' });
  } else if (data.task.trim().length < 5) {
    warnings.push({ field: 'task', message: 'Task is very short, consider adding more detail' });
  }

  // Optional fields - just check for very short content
  if (data.role && data.role.trim() && data.role.trim().length < 5) {
    warnings.push({ field: 'role', message: 'Role is very short' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format technique instructions for inclusion in the prompt
 */
export function formatTechniqueInstructions(
  techniqueIds: string[],
  techniquesData: TechniquesData
): string {
  if (!techniqueIds || techniqueIds.length === 0) {
    return '';
  }

  const instructions: string[] = [];

  for (const id of techniqueIds) {
    const technique = findTechnique(id, techniquesData);
    if (technique) {
      instructions.push(`**${technique.name}**: ${technique.description}`);
    }
  }

  return instructions.join('\n\n');
}

/**
 * Get default prompt templates
 */
export function getDefaultTemplates(): PromptTemplate[] {
  return [
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'Template for solving complex problems with structured reasoning',
      techniques: ['chain-of-thought', 'tree-of-thoughts'],
      role: 'You are an expert problem solver.',
      task: 'Analyze the given problem and provide a solution.',
      context: '',
      output: 'Provide a clear, step-by-step solution.',
    },
    {
      id: 'code-review',
      name: 'Code Review',
      description: 'Template for reviewing and improving code',
      techniques: ['chain-of-thought'],
      role: 'You are a senior software engineer.',
      task: 'Review the provided code for bugs, performance issues, and best practices.',
      context: '',
      output: 'Provide feedback with specific suggestions and code examples.',
    },
    {
      id: 'creative-writing',
      name: 'Creative Writing',
      description: 'Template for generating creative content',
      techniques: ['few-shot-learning'],
      role: 'You are a creative writer.',
      task: 'Write engaging content based on the given prompt.',
      context: '',
      output: 'Produce well-structured, engaging text.',
    },
  ];
}

/**
 * Parse an exported prompt JSON back into structured data
 */
export function parseExportedPrompt(json: string): {
  success: boolean;
  data?: {
    prompt: string;
    configuration: PromptData;
    techniques: { id: string; name: string }[];
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(json);

    // Validate required fields
    if (!parsed.prompt || typeof parsed.prompt !== 'string') {
      return { success: false, error: 'Missing or invalid prompt field' };
    }

    if (!parsed.configuration || typeof parsed.configuration !== 'object') {
      return { success: false, error: 'Missing or invalid configuration field' };
    }

    if (!parsed.techniques || !Array.isArray(parsed.techniques)) {
      return { success: false, error: 'Missing or invalid techniques field' };
    }

    return {
      success: true,
      data: {
        prompt: parsed.prompt,
        configuration: parsed.configuration,
        techniques: parsed.techniques,
      },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to parse JSON',
    };
  }
}
