<script lang="ts">
  import { messages, type Message } from "./lib/stores/chat";
  import { get } from "svelte/store";

  let message = "";
  let loading = false;

  async function send() {
    if (!message.trim()) return;

    const userContent = message;
    messages.update((msgs) => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: userContent }],
        timestamp: new Date().toISOString(),
      },
    ]);

    message = "";
    loading = true;

    try {
      const currentMessages = get_messages();
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!res.body) {
        loading = false;
        return;
      }

      const assistantId = crypto.randomUUID();
      
      messages.update((msgs) => [
        ...msgs,
        {
          id: assistantId,
          role: "assistant",
          parts: [],
          timestamp: new Date().toISOString(),
        },
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let inThinking = false;
      let thinkingContent = "";
      let textContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Check for thinking tags and parse in real-time
        let processedUpTo = 0;

        while (true) {
          if (!inThinking) {
            const thinkingStart = buffer.indexOf("<thinking>", processedUpTo);
            if (thinkingStart !== -1) {
              // Add any text before thinking tag
              if (thinkingStart > processedUpTo) {
                textContent += buffer.substring(processedUpTo, thinkingStart);
              }
              inThinking = true;
              processedUpTo = thinkingStart + "<thinking>".length;
              continue;
            } else {
              // No thinking tag found, accumulate as text
              textContent += buffer.substring(processedUpTo);
              processedUpTo = buffer.length;
              break;
            }
          } else {
            const thinkingEnd = buffer.indexOf("</thinking>", processedUpTo);
            if (thinkingEnd !== -1) {
              // Extract thinking content
              thinkingContent += buffer.substring(processedUpTo, thinkingEnd);
              inThinking = false;
              processedUpTo = thinkingEnd + "</thinking>".length;
              continue;
            } else {
              // Thinking not closed yet, accumulate
              thinkingContent += buffer.substring(processedUpTo);
              processedUpTo = buffer.length;
              break;
            }
          }
        }

        // Remove processed content from buffer
        buffer = buffer.substring(processedUpTo);

        // Update UI with current thinking and text
        messages.update((msgs) => {
          const updated = [...msgs];
          const assistantMsg = updated.find((m) => m.id === assistantId);
          if (assistantMsg) {
            assistantMsg.parts = [];
            if (thinkingContent) {
              assistantMsg.parts.push({ type: "reasoning", text: thinkingContent });
            }
            if (textContent) {
              assistantMsg.parts.push({ type: "text", text: textContent });
            }
          }
          return updated;
        });
      }

      // Handle any remaining buffer content
      if (buffer) {
        if (inThinking) {
          thinkingContent += buffer;
        } else {
          textContent += buffer;
        }

        messages.update((msgs) => {
          const updated = [...msgs];
          const assistantMsg = updated.find((m) => m.id === assistantId);
          if (assistantMsg) {
            assistantMsg.parts = [];
            if (thinkingContent) {
              assistantMsg.parts.push({ type: "reasoning", text: thinkingContent });
            }
            if (textContent) {
              assistantMsg.parts.push({ type: "text", text: textContent });
            }
          }
          return updated;
        });
      }
    } finally {
      loading = false;
    }
  }

  function get_messages() {
    const msgs = get(messages);
    return msgs.map((msg: Message) => ({
      role: msg.role,
      content: msg.parts.map((p) => p.text).join(""),
    }));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !loading) {
      send();
    }
  }
</script>

<div class="chat-input">
  <input
    type="text"
    name="input"
    id="input"
    placeholder="Type a message..."
    bind:value={message}
    on:keydown={handleKeydown}
    disabled={loading}
  />

  <button class="send-btn" on:click={send} disabled={loading}>
    <img src="src/images/SendMessage.svg" alt="Send Message" />
  </button>
</div>

<style>
  .chat-input {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 10px 12px;

    background: var(--color-bg);
    border: var(--border-thin) solid var(--color-border-muted);
    border-radius: var(--radius-md);

    box-shadow: 0 2px 6px var(--color-shadow);

    width: 100%;
    max-width: 600px;
  }

  .chat-input input {
    flex: 1;

    border: none;
    outline: none;
    background: transparent;

    font-size: 14px;
    color: #222;
  }

  .chat-input input::placeholder {
    color: #999;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border-radius: var(--radius-sm);
    border: var(--border-thin) solid var(--color-border-muted);

    background: var(--color-bg);
    cursor: pointer;

    transition: all 0.15s ease;
  }

  .send-btn:hover {
    background: var(--color-bg-hover);
  }

  .send-btn:active {
    transform: scale(0.95);
  }

  .send-btn:disabled,
  .chat-input input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-btn img {
    width: 18px;
    height: 18px;
  }
</style>
