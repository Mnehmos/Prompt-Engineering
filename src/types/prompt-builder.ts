export interface PromptData {
  role: string;
  task: string;
  context: string;
  output: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  techniques: string[];  // technique IDs
  role: string;
  task: string;
  context: string;
  output: string;
}

export interface PromptQuality {
  score: number;         // 0-100
  level: 'poor' | 'fair' | 'good' | 'excellent';
  breakdown: {
    role: number;        // 0-20
    task: number;        // 0-30
    context: number;     // 0-15
    output: number;      // 0-15
    techniques: number;  // 0-20
  };
  suggestions: string[];
}

export interface PromptStats {
  charCount: number;
  estimatedTokens: number;
  techniqueCount: number;
}

export interface SavedPrompt {
  id: string;
  name: string;
  prompt: string;
  data: PromptData;
  techniques: string[];
  timestamp: string;
}

export interface GeneratedPrompt {
  text: string;
  sections: {
    role?: string;
    techniques?: string;
    task?: string;
    context?: string;
    output?: string;
  };
}

export interface KeywordSuggestion {
  keyword: string;
  matchedTechniques: string[];
}
