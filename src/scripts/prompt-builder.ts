/**
 * Prompt Builder Client-Side Controller
 * Handles all interactive functionality for the prompt builder page
 */

import type { TechniquesData } from '@/types/techniques';
import type { PromptData, PromptQuality, GeneratedPrompt } from '@/types/prompt-builder';
import { generatePrompt, calculateQuality, estimateTokens } from '@/lib/prompt-builder';

// Debounce utility
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Main controller class for the prompt builder
 */
class PromptBuilderController {
  // DOM Elements - using definite assignment assertion since they're set in initializeElements()
  private roleInput!: HTMLInputElement;
  private taskInput!: HTMLTextAreaElement;
  private contextInput!: HTMLTextAreaElement;
  private outputInput!: HTMLTextAreaElement;
  private previewContent!: HTMLElement;
  private tokenCount!: HTMLElement;
  private qualityScore!: HTMLElement;
  private selectedTechniquesContainer!: HTMLElement;
  private techniqueSearch!: HTMLInputElement;
  private techniqueList!: HTMLElement;
  private noResults!: HTMLElement;
  private copyButton!: HTMLButtonElement;
  private exportButton!: HTMLButtonElement;
  private clearButton!: HTMLButtonElement;

  // State
  private selectedTechniques: string[] = [];
  private techniquesData: TechniquesData | null = null;

  constructor() {
    this.initializeElements();
    this.loadTechniquesData();
    this.attachEventListeners();
    this.updatePreview();
  }

  /**
   * Initialize DOM element references
   */
  private initializeElements(): void {
    // Form inputs
    this.roleInput = document.querySelector('[data-testid="role-input"]') as HTMLInputElement;
    this.taskInput = document.querySelector('[data-testid="task-input"]') as HTMLTextAreaElement;
    this.contextInput = document.querySelector('[data-testid="context-input"]') as HTMLTextAreaElement;
    this.outputInput = document.querySelector('[data-testid="output-input"]') as HTMLTextAreaElement;

    // Preview elements
    this.previewContent = document.querySelector('[data-testid="preview-content"]') as HTMLElement;
    this.tokenCount = document.querySelector('[data-testid="token-count"]') as HTMLElement;
    this.qualityScore = document.querySelector('[data-testid="quality-score"]') as HTMLElement;

    // Technique elements
    this.selectedTechniquesContainer = document.querySelector('[data-testid="selected-techniques"]') as HTMLElement;
    this.techniqueSearch = document.querySelector('[data-testid="technique-search"]') as HTMLInputElement;
    this.techniqueList = document.querySelector('[data-testid="technique-list"]') as HTMLElement;
    this.noResults = document.querySelector('.no-results') as HTMLElement;

    // Action buttons
    this.copyButton = document.querySelector('[data-testid="copy-button"]') as HTMLButtonElement;
    this.exportButton = document.querySelector('[data-testid="export-button"]') as HTMLButtonElement;
    this.clearButton = document.querySelector('[data-testid="clear-button"]') as HTMLButtonElement;
  }

  /**
   * Load techniques data from embedded JSON
   */
  private loadTechniquesData(): void {
    const dataScript = document.getElementById('techniques-data');
    if (dataScript) {
      try {
        this.techniquesData = JSON.parse(dataScript.textContent || '{}') as TechniquesData;
      } catch (e) {
        console.error('Failed to parse techniques data:', e);
      }
    }
  }

  /**
   * Attach all event listeners
   */
  private attachEventListeners(): void {
    // Debounced input handlers for form fields
    const debouncedUpdate = debounce(() => this.updatePreview(), 200);

    [this.roleInput, this.taskInput, this.contextInput, this.outputInput].forEach((el) => {
      if (el) {
        el.addEventListener('input', debouncedUpdate);
      }
    });

    // Technique search
    if (this.techniqueSearch) {
      this.techniqueSearch.addEventListener('input', () => this.handleTechniqueSearch());
      
      // Clear search button
      const clearSearch = document.querySelector('.clear-search');
      if (clearSearch) {
        clearSearch.addEventListener('click', () => {
          this.techniqueSearch.value = '';
          this.handleTechniqueSearch();
        });
      }
    }

    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        this.handleCategoryFilter(target.dataset.category || 'all');
        
        // Update active state
        document.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
        target.classList.add('active');
      });
    });

    // Technique selection
    document.querySelectorAll('[data-testid="technique-select-card"]').forEach((card) => {
      card.addEventListener('click', () => {
        const techniqueId = (card as HTMLElement).dataset.techniqueId;
        if (techniqueId) {
          this.toggleTechnique(techniqueId);
        }
      });
    });

    // Template cards
    document.querySelectorAll('[data-testid="template-card"]').forEach((card) => {
      card.addEventListener('click', () => this.loadTemplate(card as HTMLElement));
    });

    // Action buttons
    if (this.copyButton) {
      this.copyButton.addEventListener('click', () => this.copyToClipboard());
    }

    if (this.exportButton) {
      this.exportButton.addEventListener('click', () => this.exportPrompt());
    }

    if (this.clearButton) {
      this.clearButton.addEventListener('click', () => this.clearAll());
    }
  }

  /**
   * Get current prompt data from form
   */
  private getPromptData(): PromptData {
    return {
      role: this.roleInput?.value || '',
      task: this.taskInput?.value || '',
      context: this.contextInput?.value || '',
      output: this.outputInput?.value || '',
    };
  }

  /**
   * Update the preview panel with generated prompt
   */
  private updatePreview(): void {
    const data = this.getPromptData();

    if (!this.techniquesData) {
      this.previewContent.innerHTML = '<p class="preview-placeholder">Loading techniques data...</p>';
      return;
    }

    // Generate prompt
    const result: GeneratedPrompt = generatePrompt(data, this.selectedTechniques, this.techniquesData);

    // Update preview content with syntax highlighting
    if (result.text.trim()) {
      this.previewContent.innerHTML = this.formatPreviewHTML(result);
    } else {
      this.previewContent.innerHTML = `
        <p class="preview-placeholder">
          Start building your prompt by filling in the form fields and selecting techniques.
          Your generated prompt will appear here in real-time.
        </p>
      `;
    }

    // Update token count
    const tokens = estimateTokens(result.text);
    if (this.tokenCount) {
      const tokenValue = this.tokenCount.querySelector('.stat-value');
      if (tokenValue) {
        tokenValue.textContent = tokens.toString();
      } else {
        this.tokenCount.innerHTML = `<span class="stat-icon">📊</span><span class="stat-value">${tokens}</span> tokens`;
      }
    }

    // Update quality score
    const quality: PromptQuality = calculateQuality(data, this.selectedTechniques.length);
    if (this.qualityScore) {
      const scoreValue = this.qualityScore.querySelector('.stat-value');
      if (scoreValue) {
        scoreValue.textContent = quality.score.toString();
      } else {
        this.qualityScore.innerHTML = `<span class="stat-icon">⭐</span><span class="stat-value">${quality.score}</span>/100`;
      }

      // Update quality level class
      this.qualityScore.classList.remove('poor', 'fair', 'good', 'excellent');
      this.qualityScore.classList.add(quality.level);
    }
  }

  /**
   * Format the preview with syntax highlighting
   */
  private formatPreviewHTML(result: GeneratedPrompt): string {
    const sections: string[] = [];

    if (result.sections.role) {
      sections.push(`
        <div class="section-block section-role">
          <span class="section-label">Role</span>
          ${this.escapeHTML(result.sections.role)}
        </div>
      `);
    }

    if (result.sections.techniques) {
      sections.push(`
        <div class="section-block section-techniques">
          <span class="section-label">Techniques</span>
          ${this.escapeHTML(result.sections.techniques)}
        </div>
      `);
    }

    if (result.sections.task) {
      sections.push(`
        <div class="section-block section-task">
          <span class="section-label">Task</span>
          ${this.escapeHTML(result.sections.task)}
        </div>
      `);
    }

    if (result.sections.context) {
      sections.push(`
        <div class="section-block section-context">
          <span class="section-label">Context</span>
          ${this.escapeHTML(result.sections.context)}
        </div>
      `);
    }

    if (result.sections.output) {
      sections.push(`
        <div class="section-block section-output">
          <span class="section-label">Output Format</span>
          ${this.escapeHTML(result.sections.output)}
        </div>
      `);
    }

    return sections.join('');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Handle technique search input
   */
  private handleTechniqueSearch(): void {
    const query = this.techniqueSearch?.value.toLowerCase().trim() || '';
    const cards = document.querySelectorAll('[data-testid="technique-select-card"]');
    let visibleCount = 0;

    cards.forEach((card) => {
      const element = card as HTMLElement;
      const name = element.dataset.techniqueName?.toLowerCase() || '';
      const description = element.dataset.techniqueDescription?.toLowerCase() || '';

      if (!query || name.includes(query) || description.includes(query)) {
        element.classList.remove('hidden');
        visibleCount++;
      } else {
        element.classList.add('hidden');
      }
    });

    // Show/hide no results message
    if (this.noResults) {
      this.noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (this.techniqueList) {
      this.techniqueList.style.display = visibleCount === 0 ? 'none' : 'flex';
    }
  }

  /**
   * Handle category filter
   */
  private handleCategoryFilter(categoryId: string): void {
    const cards = document.querySelectorAll('[data-testid="technique-select-card"]');

    cards.forEach((card) => {
      const element = card as HTMLElement;
      const cardCategory = element.dataset.categoryId;

      if (categoryId === 'all' || cardCategory === categoryId) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });

    // Clear search when changing category
    if (this.techniqueSearch) {
      this.techniqueSearch.value = '';
    }
  }

  /**
   * Toggle technique selection
   */
  private toggleTechnique(techniqueId: string): void {
    const index = this.selectedTechniques.indexOf(techniqueId);
    const card = document.querySelector(`[data-testid="technique-select-card"][data-technique-id="${techniqueId}"]`);

    if (index === -1) {
      // Add technique
      this.selectedTechniques.push(techniqueId);
      card?.classList.add('selected');
    } else {
      // Remove technique
      this.selectedTechniques.splice(index, 1);
      card?.classList.remove('selected');
    }

    this.renderSelectedTechniques();
    this.updatePreview();
  }

  /**
   * Render selected techniques tags
   */
  private renderSelectedTechniques(): void {
    if (!this.selectedTechniquesContainer) return;

    if (this.selectedTechniques.length === 0) {
      this.selectedTechniquesContainer.innerHTML = `
        <p class="empty-state">No techniques selected. Click techniques from the left panel to add them.</p>
      `;
      return;
    }

    const tags = this.selectedTechniques.map((id) => {
      const card = document.querySelector(`[data-testid="technique-select-card"][data-technique-id="${id}"]`) as HTMLElement;
      const name = card?.dataset.techniqueName || id;

      return `
        <span class="selected-technique-tag" data-testid="selected-technique-tag" data-technique-id="${id}">
          ${this.escapeHTML(name)}
          <button type="button" class="remove-btn" aria-label="Remove ${name}">×</button>
        </span>
      `;
    }).join('');

    this.selectedTechniquesContainer.innerHTML = tags;

    // Add remove listeners
    this.selectedTechniquesContainer.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = (btn as HTMLElement).closest('[data-technique-id]') as HTMLElement;
        const techniqueId = tag?.dataset.techniqueId;
        if (techniqueId) {
          this.toggleTechnique(techniqueId);
        }
      });
    });
  }

  /**
   * Load a template
   */
  private loadTemplate(templateCard: HTMLElement): void {
    const role = templateCard.dataset.templateRole || '';
    const task = templateCard.dataset.templateTask || '';
    const context = templateCard.dataset.templateContext || '';
    const output = templateCard.dataset.templateOutput || '';
    const techniques = JSON.parse(templateCard.dataset.templateTechniques || '[]') as string[];

    // Fill form fields
    if (this.roleInput) this.roleInput.value = role;
    if (this.taskInput) this.taskInput.value = task;
    if (this.contextInput) this.contextInput.value = context;
    if (this.outputInput) this.outputInput.value = output;

    // Clear and set techniques
    this.selectedTechniques = [];
    document.querySelectorAll('[data-testid="technique-select-card"].selected').forEach((card) => {
      card.classList.remove('selected');
    });

    techniques.forEach((id) => {
      if (!this.selectedTechniques.includes(id)) {
        this.selectedTechniques.push(id);
        const card = document.querySelector(`[data-testid="technique-select-card"][data-technique-id="${id}"]`);
        card?.classList.add('selected');
      }
    });

    this.renderSelectedTechniques();
    this.updatePreview();
  }

  /**
   * Copy prompt to clipboard
   */
  private async copyToClipboard(): Promise<void> {
    if (!this.techniquesData) return;

    const data = this.getPromptData();
    const result = generatePrompt(data, this.selectedTechniques, this.techniquesData);

    try {
      await navigator.clipboard.writeText(result.text);
      this.showToast('Copied to clipboard!', 'success');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = result.text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('Copied to clipboard!', 'success');
    }
  }

  /**
   * Export prompt as JSON or text
   */
  private exportPrompt(): void {
    if (!this.techniquesData) return;

    const data = this.getPromptData();
    const result = generatePrompt(data, this.selectedTechniques, this.techniquesData);

    // Get technique names for export
    const techniqueDetails = this.selectedTechniques.map((id) => {
      const card = document.querySelector(`[data-testid="technique-select-card"][data-technique-id="${id}"]`) as HTMLElement;
      return {
        id,
        name: card?.dataset.techniqueName || id,
      };
    });

    const exportData = {
      prompt: result.text,
      configuration: data,
      techniques: techniqueDetails,
      exportedAt: new Date().toISOString(),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Prompt exported!', 'success');
  }

  /**
   * Clear all fields
   */
  private clearAll(): void {
    if (!confirm('Are you sure you want to clear all fields?')) {
      return;
    }

    // Clear form fields
    if (this.roleInput) this.roleInput.value = '';
    if (this.taskInput) this.taskInput.value = '';
    if (this.contextInput) this.contextInput.value = '';
    if (this.outputInput) this.outputInput.value = '';

    // Clear techniques
    this.selectedTechniques = [];
    document.querySelectorAll('[data-testid="technique-select-card"].selected').forEach((card) => {
      card.classList.remove('selected');
    });

    this.renderSelectedTechniques();
    this.updatePreview();
    this.showToast('All fields cleared', 'info');
  }

  /**
   * Show a toast notification
   */
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${type === 'success' ? 'var(--color-success)' : type === 'error' ? 'var(--color-error)' : 'var(--interactive-default)'};
      color: white;
      border-radius: var(--radius-md);
      font-size: var(--font-sm);
      font-weight: var(--font-medium);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

/**
 * Initialize the prompt builder
 */
export function initPromptBuilder(): void {
  new PromptBuilderController();

  // Add toast animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
