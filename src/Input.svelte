<script lang="ts">
  import {
    initializeChatStore,
    messages,
    type Message,
    renameChat,
    activeChatId,
    draftPrompt,
  } from "./lib/stores/chat";

  import {
    selectedModel,
    selectedPersona,
    customSystemPrompt,
    customModelId,
    maxTokens,
  } from "./lib/stores/settings";

  import { sendMessageIcon } from "./lib/assets";
  import { apiKey } from "./lib/stores/api-key";
  import { get } from "svelte/store";
  import { tick } from "svelte";

  const API_URL = "/api/chat";
  const OPEN_THINKING_TAG = "<thinking>";
  const CLOSE_THINKING_TAG = "</thinking>";

  let textareaRef: HTMLTextAreaElement;
  let message = "";
  let loading = false;

  draftPrompt.subscribe((value) => {
    if (value) {
      message = value;
      draftPrompt.set("");
      void tick().then(autoResize);
    }
  });

  function autoResize() {
    if (!textareaRef) return;
    textareaRef.style.height = "auto";
    textareaRef.style.height = `${textareaRef.scrollHeight}px`;
  }

  async function send() {
    if (!message.trim()) return;
    await initializeChatStore();

    const currentApiKey = get(apiKey);
    if (!currentApiKey) {
      alert("Please set your HCAI API Key in settings first");
      return;
    }

    const userContent = message;

    const currentMsgs = get(messages);
    const isFirstMessage = currentMsgs.length === 0;

    messages.update((msgs) => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: userContent }],
        timestamp: new Date().toISOString(),
      },
    ]);

    if (isFirstMessage) {
      const activeId = get(activeChatId);
      if (activeId) {
        void (async () => {
          try {
            const res = await fetch("/api/summarize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: userContent,
                apiKey: currentApiKey,
              }),
            });
            const { title } = await res.json();
            if (title) {
              void renameChat(activeId, title);
            }
          } catch (err) {
            console.error("Failed to generate AI title:", err);
          }
        })();
      }
    }

    message = "";
    if (textareaRef) {
      textareaRef.style.height = "auto";
    }

    loading = true;
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

    try {
      const currentMessages = get_messages();

      const modelVal = get(selectedModel);
      const activeModel = modelVal === "custom" ? get(customModelId) : modelVal;

      const activePersona = get(selectedPersona);
      const activePrompt = get(customSystemPrompt);
      const activeMaxTokens = get(maxTokens);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          apiKey: currentApiKey,
          model: activeModel,
          persona: activePersona,
          customPrompt: activePrompt,
          maxTokens: activeMaxTokens ? Number(activeMaxTokens) : undefined,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Request failed with ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Empty response body from server");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        const { thinking, text } = parseContent(fullContent);
        updateAssistantParts(assistantId, thinking, text);
      }

      const flushChunk = decoder.decode();
      if (flushChunk) {
        fullContent += flushChunk;
      }

      if (!fullContent.trim()) {
        throw new Error("Model returned an empty response");
      }

      const { thinking, text } = parseContent(fullContent);
      updateAssistantParts(assistantId, thinking, text);
    } catch (error) {
      console.error("Chat error:", error);
      const errorText =
        error instanceof Error ? error.message : "Unknown chat error";
      updateAssistantParts(
        assistantId,
        "",
        `Sorry, I couldn't get a response. ${errorText}`,
      );
    } finally {
      loading = false;
    }
  }

  function parseContent(content: string): { thinking: string; text: string } {
    const thinkingParts: string[] = [];
    const textParts: string[] = [];
    let cursor = 0;

    while (cursor < content.length) {
      const openIndex = content.indexOf(OPEN_THINKING_TAG, cursor);

      if (openIndex === -1) {
        textParts.push(content.slice(cursor));
        break;
      }

      textParts.push(content.slice(cursor, openIndex));
      const thinkingStart = openIndex + OPEN_THINKING_TAG.length;
      const closeIndex = content.indexOf(CLOSE_THINKING_TAG, thinkingStart);

      if (closeIndex === -1) {
        // Stream is still in thinking mode: surface partial reasoning immediately.
        thinkingParts.push(content.slice(thinkingStart));
        break;
      }

      thinkingParts.push(content.slice(thinkingStart, closeIndex));
      cursor = closeIndex + CLOSE_THINKING_TAG.length;
    }

    return {
      thinking: thinkingParts.join(""),
      text: textParts.join(""),
    };
  }

  function updateAssistantParts(id: string, thinking: string, text: string) {
    messages.update((msgs) => {
      const updated = [...msgs];
      const assistantMsg = updated.find((m) => m.id === id);

      if (!assistantMsg) return updated;

      assistantMsg.parts = [];

      if (thinking) {
        assistantMsg.parts.push({ type: "reasoning", text: thinking });
      }

      if (text) {
        assistantMsg.parts.push({ type: "text", text });
      }

      return updated;
    });
  }

  function get_messages() {
    const msgs = get(messages);
    return msgs.flatMap((msg: Message) => {
      const parts = msg.parts || [];
      const textContent = parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("") || msg.content || "";

      if (!textContent) return [];

      return [
        {
          role: msg.role,
          content: textContent,
        },
      ];
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        send();
      }
    }
  }
</script>

<div class="chat-input">
  <textarea
    bind:this={textareaRef}
    name="input"
    id="input"
    placeholder="Type a message..."
    bind:value={message}
    on:input={autoResize}
    on:keydown={handleKeydown}
    disabled={loading}
    rows="1"
  ></textarea>

  <button class="send-btn" on:click={send} disabled={loading}>
    <img src={sendMessageIcon} alt="Send Message" />
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

  .chat-input textarea {
    flex: 1;

    border: none;
    outline: none;
    background: transparent;

    font-size: 14px;
    color: #222;
    resize: none;
  }

  .chat-input textarea::placeholder {
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
  .chat-input textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .send-btn img {
    width: 18px;
    height: 18px;
  }
</style>
