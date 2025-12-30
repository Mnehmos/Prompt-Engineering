/**
 * Chat Controller - Client-side logic for RAG chat interface
 * Connects to Railway RAG server via SSE streaming
 */

interface SearchResult {
  text: string;
  score: number;
  chunk_id: string;
  source_name?: string;
}

interface ChatConfig {
  apiEndpoint?: string | null;
  demoMode: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

class ChatController {
  private messagesContainer!: HTMLElement;
  private form!: HTMLFormElement;
  private input!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private statusHint!: HTMLElement | null;
  private config!: ChatConfig;
  private conversationId: string | null = null;
  private messages: Message[] = [];

  constructor() {
    const messagesContainer = document.querySelector(
      '[data-testid="chat-messages"]'
    );
    const form = document.querySelector('[data-testid="chat-form"]');
    const input = document.querySelector('[data-testid="chat-input"]');
    const submitBtn = document.querySelector('[data-testid="chat-submit"]');

    if (!messagesContainer || !form || !input || !submitBtn) {
      console.error("Chat: Required elements not found");
      return;
    }

    this.messagesContainer = messagesContainer as HTMLElement;
    this.form = form as HTMLFormElement;
    this.input = input as HTMLInputElement;
    this.submitBtn = submitBtn as HTMLButtonElement;
    this.statusHint = document.getElementById("status-hint");

    // Check for API endpoint from page config
    const configEl = document.getElementById("chat-config");
    this.config = configEl
      ? JSON.parse(configEl.textContent || "{}")
      : { demoMode: true };

    this.attachListeners();
  }

  private attachListeners(): void {
    // Form submission
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (!query) return;

      this.addMessage("user", query);
      this.messages.push({ role: "user", content: query });
      this.input.value = "";
      this.setLoading(true);

      await this.chat(query);
    });

    // Suggestion buttons
    document.querySelectorAll("[data-suggestion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const suggestion = (btn as HTMLElement).dataset.suggestion;
        if (suggestion) {
          this.input.value = suggestion;
          this.input.focus();
        }
      });
    });
  }

  private async chat(question: string): Promise<void> {
    if (this.config.demoMode || !this.config.apiEndpoint) {
      // Demo mode - show placeholder
      this.addMessage(
        "assistant",
        "Demo mode is disabled. Please configure the API endpoint."
      );
      this.setLoading(false);
      return;
    }

    // Create streaming message element
    const messageEl = this.createStreamingMessage();
    const contentEl = messageEl.querySelector(
      ".message-content"
    ) as HTMLElement;

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversation_id: this.conversationId,
          messages: this.messages.slice(-10), // Last 10 messages for context
          top_k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let sources: SearchResult[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "sources") {
                sources = data.sources || [];
              } else if (data.type === "delta") {
                fullContent += data.text;
                contentEl.innerHTML = this.formatMarkdown(fullContent);
                this.scrollToBottom();
              } else if (data.type === "done") {
                this.conversationId =
                  data.conversation_id || this.conversationId;
                this.messages.push({ role: "assistant", content: fullContent });
              } else if (data.type === "error") {
                throw new Error(data.error || "Unknown error");
              }
            } catch (parseErr) {
              // Skip unparseable lines
            }
          }
        }
      }

      // Add sources after streaming completes
      if (sources.length > 0) {
        this.appendSources(contentEl, sources);
      }
    } catch (error) {
      console.error("Chat error:", error);
      contentEl.innerHTML = `<p>⚠️ ${error instanceof Error ? error.message : "Failed to get response"}</p>`;
    } finally {
      this.setLoading(false);
    }
  }

  private createStreamingMessage(): HTMLElement {
    const messageEl = document.createElement("div");
    messageEl.className = "message assistant";

    const avatarEl = document.createElement("div");
    avatarEl.className = "message-avatar";
    avatarEl.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>`;

    const contentEl = document.createElement("div");
    contentEl.className = "message-content";
    contentEl.innerHTML = '<span class="streaming-cursor">▌</span>';

    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    return messageEl;
  }

  private addMessage(
    role: "user" | "assistant",
    content: string,
    sources?: SearchResult[]
  ): void {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}`;

    const avatarEl = document.createElement("div");
    avatarEl.className = "message-avatar";
    avatarEl.innerHTML =
      role === "assistant"
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

    const contentEl = document.createElement("div");
    contentEl.className = "message-content";
    contentEl.innerHTML = this.formatMarkdown(content);

    if (role === "assistant" && sources && sources.length > 0) {
      this.appendSources(contentEl, sources);
    }

    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  private appendSources(contentEl: HTMLElement, sources: SearchResult[]): void {
    // Extract a searchable term from source text (first few meaningful words)
    const getSearchTerm = (s: SearchResult): string => {
      const text = s.source_name || s.text;
      // Extract first 3-4 words as a search term
      const words = text.split(/\s+/).slice(0, 4).join(' ');
      return encodeURIComponent(words);
    };

    const sourcesHtml = `
      <details class="sources">
        <summary>📚 Sources (${sources.length})</summary>
        <ul>
          ${sources
            .slice(0, 5)
            .map(
              (s) => `
            <li>
              <span class="score">${Math.round(s.score * 100)}%</span>
              <a href="/taxonomy?q=${getSearchTerm(s)}" class="source-link" target="_blank" rel="noopener">
                ${this.escapeHtml((s.source_name || s.text).slice(0, 100))}...
              </a>
            </li>
          `
            )
            .join("")}
        </ul>
      </details>
    `;
    contentEl.insertAdjacentHTML("beforeend", sourcesHtml);
  }

  private formatMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTo({
      top: this.messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  private setLoading(loading: boolean): void {
    this.submitBtn.disabled = loading;
    this.input.disabled = loading;
    if (this.statusHint) {
      this.statusHint.textContent = loading
        ? "Thinking..."
        : "Powered by RAG • Responses stream in real-time";
    }
  }
}

// Initialize when DOM is ready
function initChat(): void {
  new ChatController();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChat);
} else {
  initChat();
}

document.addEventListener("astro:after-swap", initChat);

export { ChatController };
