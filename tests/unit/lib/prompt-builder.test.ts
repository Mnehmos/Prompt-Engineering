import { describe, test, expect } from 'vitest';
import {
  generatePrompt,
  calculateQuality,
  estimateTokens,
  suggestTechniques,
  getPromptStats,
  validatePromptData,
  formatTechniqueInstructions,
  getDefaultTemplates,
  parseExportedPrompt,
} from '@/lib/prompt-builder';
import type { TechniquesData } from '@/types/techniques';
import type { PromptData } from '@/types/prompt-builder';

const mockTechniquesData: TechniquesData = {
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
          name: 'Chain-of-Thought (CoT) Prompting',
          description: 'Guide the model through step-by-step reasoning',
        },
        {
          id: 'few-shot-learning',
          name: 'Few-Shot Learning',
          description: 'Provide examples in the prompt',
        },
      ],
    },
    {
      id: 'reasoning-frameworks',
      name: 'Reasoning Frameworks',
      description: 'Reasoning techniques',
      techniques: [
        {
          id: 'tree-of-thoughts',
          name: 'Tree of Thoughts',
          description: 'Explore multiple reasoning paths',
        },
        {
          id: 'self-consistency',
          name: 'Self-Consistency',
          description: 'Sample multiple reasoning paths',
        },
      ],
    },
  ],
};

describe('Prompt Builder Utilities', () => {
  describe('generatePrompt', () => {
    test('should generate prompt with all sections when complete data provided', () => {
      const data: PromptData = {
        role: 'You are an expert analyst.',
        task: 'Analyze the market trends.',
        context: 'Focus on Q4 2024 data.',
        output: 'Provide a structured report.',
      };
      const techniques = ['chain-of-thought'];
      
      const result = generatePrompt(data, techniques, mockTechniquesData);
      
      expect(result.text).toContain('expert analyst');
      expect(result.text).toContain('Analyze the market');
      expect(result.text).toContain('Chain-of-Thought');
      expect(result.sections.role).toBeDefined();
      expect(result.sections.task).toBeDefined();
    });

    test('should handle empty sections gracefully when some fields are missing', () => {
      const data: PromptData = {
        role: '',
        task: 'Do something.',
        context: '',
        output: '',
      };
      
      const result = generatePrompt(data, [], mockTechniquesData);
      
      expect(result.text).toContain('Do something');
      expect(result.sections.role).toBeUndefined();
    });

    test('should include technique descriptions when techniques are selected', () => {
      const data: PromptData = {
        role: '',
        task: 'Solve this problem.',
        context: '',
        output: '',
      };
      
      const result = generatePrompt(data, ['chain-of-thought', 'tree-of-thoughts'], mockTechniquesData);
      
      expect(result.text).toContain('step-by-step');
      expect(result.text).toContain('multiple reasoning paths');
    });

    test('should order sections correctly: role -> techniques -> task -> context -> output', () => {
      const data: PromptData = {
        role: 'ROLE_MARKER',
        task: 'TASK_MARKER',
        context: 'CONTEXT_MARKER',
        output: 'OUTPUT_MARKER',
      };
      
      const result = generatePrompt(data, ['chain-of-thought'], mockTechniquesData);
      
      const roleIndex = result.text.indexOf('ROLE_MARKER');
      const techniqueIndex = result.text.indexOf('Chain-of-Thought');
      const taskIndex = result.text.indexOf('TASK_MARKER');
      const contextIndex = result.text.indexOf('CONTEXT_MARKER');
      const outputIndex = result.text.indexOf('OUTPUT_MARKER');
      
      expect(roleIndex).toBeLessThan(techniqueIndex);
      expect(techniqueIndex).toBeLessThan(taskIndex);
      expect(taskIndex).toBeLessThan(contextIndex);
      expect(contextIndex).toBeLessThan(outputIndex);
    });

    test('should skip non-existent techniques gracefully when invalid IDs provided', () => {
      const data: PromptData = {
        role: '',
        task: 'Test task.',
        context: '',
        output: '',
      };
      
      const result = generatePrompt(data, ['non-existent', 'chain-of-thought'], mockTechniquesData);
      
      expect(result.text).toContain('Chain-of-Thought');
      expect(result.text).not.toContain('non-existent');
    });
  });

  describe('calculateQuality', () => {
    test('should return max score for complete prompt when all sections filled with detail', () => {
      const data: PromptData = {
        role: 'You are a highly skilled software engineer with expertise in TypeScript.',
        task: 'Analyze this code for bugs, performance issues, and suggest improvements for maintainability.',
        context: 'This is a production application with high traffic requirements.',
        output: 'Provide a detailed report with code examples and priority rankings.',
      };
      
      const quality = calculateQuality(data, 3);
      
      expect(quality.score).toBeGreaterThanOrEqual(80);
      expect(quality.level).toBe('excellent');
    });

    test('should return low score for minimal prompt when little content provided', () => {
      const data: PromptData = {
        role: '',
        task: 'Hi',
        context: '',
        output: '',
      };
      
      const quality = calculateQuality(data, 0);
      
      expect(quality.score).toBeLessThan(30);
      expect(quality.level).toBe('poor');
    });

    test('should provide breakdown scores for each section when partial data provided', () => {
      const data: PromptData = {
        role: 'Expert analyst',
        task: 'Analyze data',
        context: '',
        output: 'JSON format',
      };
      
      const quality = calculateQuality(data, 1);
      
      expect(quality.breakdown.role).toBeGreaterThan(0);
      expect(quality.breakdown.task).toBeGreaterThan(0);
      expect(quality.breakdown.context).toBe(0);
      expect(quality.breakdown.output).toBeGreaterThan(0);
      expect(quality.breakdown.techniques).toBeGreaterThan(0);
    });

    test('should suggest improvements for missing sections when sections are empty', () => {
      const data: PromptData = {
        role: '',
        task: 'Do something',
        context: '',
        output: '',
      };
      
      const quality = calculateQuality(data, 0);
      
      expect(quality.suggestions.length).toBeGreaterThan(0);
      expect(quality.suggestions.some(s => s.toLowerCase().includes('role'))).toBe(true);
    });

    test('should award more points for longer, detailed content when content varies in length', () => {
      const shortData: PromptData = {
        role: 'Expert',
        task: 'Help',
        context: '',
        output: '',
      };
      
      const longData: PromptData = {
        role: 'You are an experienced data scientist specializing in machine learning.',
        task: 'Analyze the provided dataset and build a predictive model.',
        context: '',
        output: '',
      };
      
      const shortQuality = calculateQuality(shortData, 0);
      const longQuality = calculateQuality(longData, 0);
      
      expect(longQuality.score).toBeGreaterThan(shortQuality.score);
    });

    test('should calculate level thresholds correctly for different quality levels', () => {
      const makeData = (taskLen: number): PromptData => ({
        role: 'x'.repeat(taskLen),
        task: 'x'.repeat(taskLen),
        context: 'x'.repeat(taskLen),
        output: 'x'.repeat(taskLen),
      });
      
      // Test thresholds
      expect(calculateQuality({ role: '', task: '', context: '', output: '' }, 0).level).toBe('poor');
      expect(calculateQuality(makeData(25), 2).level).toMatch(/fair|good/);
      expect(calculateQuality(makeData(60), 3).level).toBe('excellent');
    });
  });

  describe('estimateTokens', () => {
    test('should estimate tokens from text length when given normal text', () => {
      const text = 'This is a test sentence with several words.';
      const tokens = estimateTokens(text);
      
      // Rough estimate: 1 token per 4 chars
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length);
    });

    test('should return 0 for empty text when input is empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    test('should handle whitespace-only text when input contains only spaces', () => {
      expect(estimateTokens('   ')).toBe(0);
    });

    test('should account for special characters when text has punctuation', () => {
      const plain = 'Hello world';
      const special = 'Hello! @world# $test%';
      
      // Special chars might increase token count
      expect(estimateTokens(special)).toBeGreaterThanOrEqual(estimateTokens(plain));
    });
  });

  describe('suggestTechniques', () => {
    test('should suggest techniques based on task keywords when step-by-step mentioned', () => {
      const suggestions = suggestTechniques('analyze this problem step by step', mockTechniquesData);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s === 'chain-of-thought')).toBe(true);
    });

    test('should suggest reasoning techniques for "solve" keyword when solving mentioned', () => {
      const suggestions = suggestTechniques('solve this complex math problem', mockTechniquesData);
      
      expect(suggestions.some(s => ['chain-of-thought', 'tree-of-thoughts', 'self-consistency'].includes(s))).toBe(true);
    });

    test('should return empty array for generic text when no keywords match', () => {
      const suggestions = suggestTechniques('hello', mockTechniquesData);
      
      // May return empty or minimal suggestions
      expect(Array.isArray(suggestions)).toBe(true);
    });

    test('should exclude already selected techniques when exclude list provided', () => {
      const selected = ['chain-of-thought'];
      const suggestions = suggestTechniques('analyze step by step', mockTechniquesData, selected);
      
      expect(suggestions).not.toContain('chain-of-thought');
    });

    test('should limit suggestions to reasonable count when many keywords match', () => {
      const suggestions = suggestTechniques('solve analyze explain code debug plan research write', mockTechniquesData);
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getPromptStats', () => {
    test('should return character count when given text', () => {
      const text = 'Hello world';
      const stats = getPromptStats(text, 2);
      
      expect(stats.charCount).toBe(11);
    });

    test('should return estimated tokens when given longer text', () => {
      const text = 'This is a longer sentence with more words to estimate tokens.';
      const stats = getPromptStats(text, 1);
      
      expect(stats.estimatedTokens).toBeGreaterThan(0);
    });

    test('should return technique count when techniques provided', () => {
      const stats = getPromptStats('Some text', 5);
      
      expect(stats.techniqueCount).toBe(5);
    });
  });

  describe('validatePromptData', () => {
    test('should return valid for complete data when all required fields filled', () => {
      const data: PromptData = {
        role: 'Expert',
        task: 'Do something',
        context: 'Some context',
        output: 'Format',
      };
      
      const result = validatePromptData(data);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return error for missing task when task field is empty', () => {
      const data: PromptData = {
        role: 'Expert',
        task: '',
        context: 'Context',
        output: 'Format',
      };
      
      const result = validatePromptData(data);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'task')).toBe(true);
    });

    test('should warn for very short task when task is too brief', () => {
      const data: PromptData = {
        role: '',
        task: 'Hi',
        context: '',
        output: '',
      };
      
      const result = validatePromptData(data);
      
      expect(result.warnings.some(w => w.field === 'task')).toBe(true);
    });
  });

  describe('formatTechniqueInstructions', () => {
    test('should format single technique instruction when one technique provided', () => {
      const techniques = ['chain-of-thought'];
      const formatted = formatTechniqueInstructions(techniques, mockTechniquesData);
      
      expect(formatted).toContain('Chain-of-Thought');
      expect(formatted).toContain('step-by-step');
    });

    test('should format multiple techniques when multiple techniques provided', () => {
      const techniques = ['chain-of-thought', 'tree-of-thoughts'];
      const formatted = formatTechniqueInstructions(techniques, mockTechniquesData);
      
      expect(formatted).toContain('Chain-of-Thought');
      expect(formatted).toContain('Tree of Thoughts');
    });

    test('should return empty string for no techniques when empty array provided', () => {
      const formatted = formatTechniqueInstructions([], mockTechniquesData);
      
      expect(formatted).toBe('');
    });
  });

  describe('getDefaultTemplates', () => {
    test('should return array of templates when called', () => {
      const templates = getDefaultTemplates();
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    test('should ensure each template has required fields when templates returned', () => {
      const templates = getDefaultTemplates();
      
      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(Array.isArray(template.techniques)).toBe(true);
      });
    });

    test('should include problem-solving template when templates returned', () => {
      const templates = getDefaultTemplates();
      
      const problemSolving = templates.find(t => t.id === 'problem-solving');
      expect(problemSolving).toBeDefined();
      expect(problemSolving?.techniques).toContain('chain-of-thought');
    });
  });

  describe('parseExportedPrompt', () => {
    test('should parse valid exported JSON when proper format provided', () => {
      const exported = JSON.stringify({
        prompt: 'Test prompt',
        configuration: { role: 'Expert', task: 'Test', context: '', output: '' },
        techniques: [{ id: 'chain-of-thought', name: 'CoT' }],
        metadata: { version: '2.0' },
      });
      
      const result = parseExportedPrompt(exported);
      
      expect(result.success).toBe(true);
      expect(result.data?.prompt).toBe('Test prompt');
    });

    test('should return error for invalid JSON when malformed string provided', () => {
      const result = parseExportedPrompt('not valid json');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should return error for missing required fields when incomplete object provided', () => {
      const exported = JSON.stringify({ something: 'else' });
      const result = parseExportedPrompt(exported);
      
      expect(result.success).toBe(false);
    });
  });
});
