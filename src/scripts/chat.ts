/**
 * Chat Controller - Client-side logic for RAG chat interface
 * Handles message submission, API calls, and demo mode responses
 */

interface SearchResult {
  text: string;
  score: number;
  chunk_id: string;
}

interface ChatConfig {
  apiEndpoint?: string | null;
  demoMode: boolean;
}

interface DemoResponse {
  content: string;
  sources?: SearchResult[];
}

class ChatController {
  private messagesContainer!: HTMLElement;
  private form!: HTMLFormElement;
  private input!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private config!: ChatConfig;
  
  // Demo responses for when no backend is available
  private demoResponses: Record<string, DemoResponse> = {
    'chain of thought': {
      content: `**Chain-of-Thought (CoT) Prompting** is a technique that elicits step-by-step reasoning before the final answer.

**How it works:**
1. Provide examples showing reasoning steps
2. Ask the model to "think step by step"
3. The model breaks down complex problems into logical steps

**Example:**
\`\`\`
Q: If there are 3 cars in the parking lot and 2 more arrive, how many are there?
A: Let me think step by step.
- Started with 3 cars
- 2 more arrived  
- 3 + 2 = 5
Therefore, there are 5 cars.
\`\`\`

**Related techniques:** Self-Consistency, Tree-of-Thoughts, Zero-Shot CoT`,
      sources: [
        { text: 'Chain-of-thought prompting elicits reasoning in large language models by providing demonstration examples with intermediate steps...', score: 0.94, chunk_id: 'cot-001' },
        { text: 'Zero-shot chain-of-thought uses the simple prompt "Let\'s think step by step" to trigger reasoning without examples...', score: 0.87, chunk_id: 'cot-002' }
      ]
    },
    
    'few-shot': {
      content: `**Few-Shot Learning** involves providing a few examples in the prompt to guide the model's behavior.

**Best practices:**
- Use 3-5 high-quality examples
- Ensure diverse coverage of edge cases
- Match the format you want in outputs
- Order examples from simple to complex

**Example:**
\`\`\`
Translate to French:
English: Hello → French: Bonjour
English: Goodbye → French: Au revoir
English: Thank you → French: [Model completes]
\`\`\`

**When to use:** Classification, formatting, translation, structured outputs

**Related techniques:** Zero-Shot, One-Shot, Many-Shot`,
      sources: [
        { text: 'Few-shot prompting provides the model with a small number of examples to demonstrate the desired task format...', score: 0.92, chunk_id: 'few-001' },
        { text: 'Example selection significantly impacts few-shot performance. Diverse, high-quality demonstrations improve generalization...', score: 0.85, chunk_id: 'few-002' }
      ]
    },
    
    'code generation': {
      content: `**Best Techniques for Code Generation:**

1. **Structured Output Prompting**
   - Define clear function signatures
   - Specify input/output types
   - Include edge case requirements

2. **Chain-of-Thought for Logic**
   - Break down algorithm steps
   - Explain the approach before coding
   - Handle complex logic incrementally

3. **Few-Shot with Examples**
   - Provide similar code patterns
   - Show coding style preferences
   - Include test cases as examples

4. **ReAct Pattern**
   - Reason about the problem
   - Write code
   - Test mentally, iterate

**Pro tip:** Always specify the language, framework, and any constraints upfront.`,
      sources: [
        { text: 'Code generation benefits from explicit specification of programming language, target framework, and coding conventions...', score: 0.89, chunk_id: 'code-001' },
        { text: 'Structured prompts with function signatures and type annotations significantly improve code quality and reduce errors...', score: 0.84, chunk_id: 'code-002' }
      ]
    },

    'zero-shot': {
      content: `**Zero-Shot Prompting** is the simplest form of prompting where you directly instruct the model without providing examples.

**Key principles:**
- Clear, specific instructions
- Explicit output format requirements
- Role or persona assignment when helpful

**Example:**
\`\`\`
Classify the sentiment of this review as positive, negative, or neutral:
"The product arrived on time but the quality was disappointing."
\`\`\`

**When to use:**
- Simple, well-defined tasks
- When examples might bias the output
- Exploratory or creative tasks

**Related:** Few-Shot, Zero-Shot CoT, Instruction Prompting`,
      sources: [
        { text: 'Zero-shot prompting relies on the model\'s pre-trained knowledge to perform tasks without task-specific examples...', score: 0.91, chunk_id: 'zero-001' }
      ]
    },
    
    'default': {
      content: `I found several relevant techniques in our knowledge base. The most commonly used prompt engineering techniques include:

1. **Chain-of-Thought (CoT)** - Elicits step-by-step reasoning
2. **Few-Shot Learning** - Provides examples to guide behavior
3. **Zero-Shot Prompting** - Direct instructions without examples
4. **Self-Consistency** - Multiple reasoning paths for better accuracy
5. **ReAct** - Reasoning + Acting for complex tasks
6. **Tree-of-Thoughts** - Explores multiple reasoning branches
7. **Retrieval-Augmented Generation (RAG)** - Enhances with external knowledge

Would you like me to explain any specific technique in detail? Try asking about:
- "What is chain of thought prompting?"
- "How do I use few-shot learning?"
- "What techniques work best for code generation?"`,
      sources: []
    }
  };

  constructor() {
    const messagesContainer = document.querySelector('[data-testid="chat-messages"]');
    const form = document.querySelector('[data-testid="chat-form"]');
    const input = document.querySelector('[data-testid="chat-input"]');
    const submitBtn = document.querySelector('[data-testid="chat-submit"]');
    
    if (!messagesContainer || !form || !input || !submitBtn) {
      console.error('Chat: Required elements not found');
      return;
    }
    
    this.messagesContainer = messagesContainer as HTMLElement;
    this.form = form as HTMLFormElement;
    this.input = input as HTMLInputElement;
    this.submitBtn = submitBtn as HTMLButtonElement;
    
    // Check for API endpoint from page config
    const configEl = document.getElementById('chat-config');
    this.config = configEl ? JSON.parse(configEl.textContent || '{}') : { demoMode: true };
    
    this.attachListeners();
  }

  private attachListeners(): void {
    // Form submission
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (!query) return;
      
      this.addMessage('user', query);
      this.input.value = '';
      this.setLoading(true);
      
      await this.search(query);
    });
    
    // Suggestion buttons
    document.querySelectorAll('[data-suggestion]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const suggestion = (btn as HTMLElement).dataset.suggestion;
        if (suggestion) {
          this.input.value = suggestion;
          this.input.focus();
        }
      });
    });
    
    // Enter key handling (already handled by form submit)
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Form will handle this
      }
    });
  }

  private async search(query: string): Promise<void> {
    this.showTypingIndicator();
    
    try {
      if (this.config.demoMode || !this.config.apiEndpoint) {
        // Demo mode - show pre-defined responses
        await this.delay(600 + Math.random() * 600);
        const response = this.getDemoResponse(query);
        this.removeTypingIndicator();
        this.addMessage('assistant', response.content, response.sources);
      } else {
        // Real API call
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, top_k: 5 }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        this.removeTypingIndicator();
        
        if (data.results && data.results.length > 0) {
          const formattedContent = this.formatApiResults(data.results, query);
          this.addMessage('assistant', formattedContent, data.results);
        } else {
          this.addMessage('assistant', "I couldn't find specific information about that. Try rephrasing your question or ask about a different technique.");
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      this.removeTypingIndicator();
      this.addMessage('assistant', '⚠️ Sorry, I encountered an error while searching. Please try again or check your connection.');
    } finally {
      this.setLoading(false);
    }
  }

  private getDemoResponse(query: string): DemoResponse {
    const q = query.toLowerCase();
    
    // Match specific topics
    if (q.includes('chain') && (q.includes('thought') || q.includes('cot'))) {
      return this.demoResponses['chain of thought'];
    }
    if (q.includes('few') && q.includes('shot')) {
      return this.demoResponses['few-shot'];
    }
    if (q.includes('zero') && q.includes('shot')) {
      return this.demoResponses['zero-shot'];
    }
    if (q.includes('code') && (q.includes('generat') || q.includes('writ'))) {
      return this.demoResponses['code generation'];
    }
    
    // Default response for other queries
    return this.demoResponses['default'];
  }

  private formatApiResults(results: SearchResult[], query: string): string {
    if (!results || results.length === 0) {
      return "I couldn't find specific information about that. Try rephrasing your question.";
    }
    
    // Use the top result as the main answer
    const topResult = results[0];
    return `Based on our knowledge base, here's what I found about "${query}":\n\n${topResult.text}`;
  }

  private addMessage(role: 'user' | 'assistant', content: string, sources?: SearchResult[]): void {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    // Avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'message-avatar';
    avatarEl.innerHTML = role === 'assistant' 
      ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>`;
    
    // Content
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.innerHTML = this.formatMarkdown(content);
    
    // Sources (for assistant messages)
    if (role === 'assistant' && sources && sources.length > 0) {
      const sourcesHtml = `
        <details class="sources">
          <summary>📚 Sources (${sources.length})</summary>
          <ul>
            ${sources.map(s => `
              <li>
                <span class="score">${Math.round(s.score * 100)}%</span>
                <span class="text">${this.escapeHtml(s.text.slice(0, 150))}...</span>
              </li>
            `).join('')}
          </ul>
        </details>
      `;
      contentEl.innerHTML += sourcesHtml;
    }
    
    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  private formatMarkdown(text: string): string {
    // Basic markdown formatting
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private showTypingIndicator(): void {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant typing';
    indicator.id = 'typing-indicator';
    
    const avatarEl = document.createElement('div');
    avatarEl.className = 'message-avatar';
    avatarEl.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.innerHTML = '<span>●</span><span>●</span><span>●</span>';
    
    indicator.appendChild(avatarEl);
    indicator.appendChild(contentEl);
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  private removeTypingIndicator(): void {
    document.getElementById('typing-indicator')?.remove();
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTo({
      top: this.messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }

  private setLoading(loading: boolean): void {
    this.submitBtn.disabled = loading;
    this.input.disabled = loading;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
function initChat(): void {
  new ChatController();
}

// Support both initial load and Astro view transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

document.addEventListener('astro:after-swap', initChat);

export { ChatController };
