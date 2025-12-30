/**
 * Chat Controller - Client-side logic for RAG chat interface
 * Connects to Railway RAG server via SSE streaming
 */



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
    this.warmup();
  }

  private async warmup(): Promise<void> {
    if (this.config.demoMode || !this.config.apiEndpoint) return;
    
    try {
      // Use the base URL (derive from apiEndpoint) + /health
      // Endpoint is usually .../chat, so replace it
      const healthUrl = this.config.apiEndpoint.replace(/\/chat$/, '/health');
      console.log("Warming up server...", healthUrl);
      await fetch(healthUrl, { method: "GET" });
      console.log("Server warmed up");
    } catch (e) {
      console.warn("Warmup failed:", e);
    }
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

  private async chat(question: string, retryCount = 0): Promise<void> {
    const MAX_RETRIES = 2;
    
    if (this.config.demoMode || !this.config.apiEndpoint) {
      // Demo mode - show placeholder
      this.addMessage(
        "assistant",
        "Demo mode is disabled. Please configure the API endpoint."
      );
      this.setLoading(false);
      return;
    }

    // Create streaming message element (only on first try)
    let messageEl: HTMLElement;
    let contentEl: HTMLElement;
    
    if (retryCount === 0) {
      messageEl = this.createStreamingMessage();
      contentEl = messageEl.querySelector(".message-content") as HTMLElement;
    } else {
      // On retry, reuse the existing message element
      const messages = this.messagesContainer.querySelectorAll('.message.assistant');
      messageEl = messages[messages.length - 1] as HTMLElement;
      contentEl = messageEl.querySelector(".message-content") as HTMLElement;
      contentEl.innerHTML = '<span class="retry-indicator">⏳ Retrying...</span>';
    }

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
              // console.log("Received chunk:", data.type); // Debug log

              if (data.type === "delta") {
                if (data.text) {
                  fullContent += data.text;
                  contentEl.innerHTML = this.formatMarkdown(fullContent);
                  this.scrollToBottom();
                }
              } else if (data.type === "done") {
                // console.log("Stream done. Full content length:", fullContent.length);
                this.conversationId =
                  data.conversation_id || this.conversationId;
                
                // Check for empty response
                if (data.empty_response && retryCount < MAX_RETRIES) {
                  console.warn(`Empty response flag set, retrying (${retryCount + 1}/${MAX_RETRIES})`);
                  return this.chat(question, retryCount + 1);
                }
                
                if (fullContent) {
                  this.messages.push({ role: "assistant", content: fullContent });
                }
              } else if (data.type === "error") {
                console.error("Server reported error:", data.error);
                throw new Error(data.error || "Unknown error");
              }
            } catch (parseErr) {
              console.warn("Failed to parse chunk:", jsonStr.substring(0, 50), parseErr);
            }
          }
        }
      }

      // If we got here with no content, try again
      if (!fullContent && retryCount < MAX_RETRIES) {
        console.warn(`No content received, retrying (${retryCount + 1}/${MAX_RETRIES})`);
        return this.chat(question, retryCount + 1);
      }
      
      // If still no content after retries, show error
      if (!fullContent) {
        contentEl.innerHTML = `<p>⚠️ The AI service is warming up. Please try again in a moment.</p>`;
      }

      // Add sources after streaming completes
      // Sources feature removed
    } catch (error) {
      console.error("Chat error:", error);
      
      // Retry on error if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.warn(`Error occurred, retrying (${retryCount + 1}/${MAX_RETRIES})`);
        return this.chat(question, retryCount + 1);
      }
      
      contentEl.innerHTML = `<p>⚠️ ${error instanceof Error ? error.message : "Failed to get response"}. Please try again.</p>`;
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
    content: string
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


    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  private formatMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
      .replace(/- (.*?)<br>/g, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
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
