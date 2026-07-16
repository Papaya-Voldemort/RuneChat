<script lang="ts">
  import {
    initializeChatStore,
    messages,
    type Message,
    type MessagePart,
    renameChat,
    activeChatId,
    draftPrompt,
    isStreaming,
  } from "./lib/stores/chat";

  import {
    selectedModel,
    selectedPersona,
    customSystemPrompt,
    customModelId,
    maxTokens,
    userProfileName,
    userProfileAbout,
    enableLayoutPreviews,
  } from "./lib/stores/settings";

  import { sendMessageIcon, addIcon } from "./lib/assets";
  import { apiKey } from "./lib/stores/api-key";
  import { get } from "svelte/store";
  import { tick } from "svelte";
  import { streamChatRequest } from "./lib/functions/chat-stream";
  import { compactArtifactMarker, convertLegacyLayout } from "./lib/rune-layout/artifacts";
  import type { RuneLayoutArtifact, RuneLayoutCatalog } from "./lib/rune-layout/types";

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
    isStreaming.set(true);
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
      const { providerMessages, artifacts } = getRequestContext(assistantId);

      const modelVal = get(selectedModel);
      const activeModel = modelVal === "custom" ? get(customModelId) : modelVal;

      const activePersona = get(selectedPersona);
      const activePrompt = get(customSystemPrompt);
      const activeMaxTokens = get(maxTokens);

      await streamChatRequest({
        messages: providerMessages,
        artifacts,
        apiKey: currentApiKey,
        model: activeModel,
        persona: activePersona,
        customPrompt: activePrompt,
        maxTokens: activeMaxTokens ? Number(activeMaxTokens) : undefined,
        userProfileName: get(userProfileName),
        userProfileAbout: get(userProfileAbout),
        enableLayoutPreviews: get(enableLayoutPreviews),
      }, (parts) => {
        updateAssistantParts(assistantId, parts);
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorText =
        error instanceof Error ? error.message : "Unknown chat error";
      updateAssistantParts(assistantId, [{
        type: "text",
        text: `Sorry, I couldn't get a response. ${errorText}`,
      }]);
    } finally {
      loading = false;
      isStreaming.set(false);
    }
  }

  function updateAssistantParts(id: string, nextParts: MessagePart[]) {
    messages.update((msgs) => {
      const updated = [...msgs];
      const assistantMsg = updated.find((m) => m.id === id);

      if (!assistantMsg) return updated;
      assistantMsg.parts = nextParts;
      return updated;
    });
  }

  function getRequestContext(assistantId: string): {
    providerMessages: Array<{ role: string; content: string }>;
    artifacts: RuneLayoutCatalog;
  } {
    const msgs = get(messages);
    const artifacts: RuneLayoutCatalog = {};
    const providerMessages = msgs.flatMap((msg: Message) => {
      const parts = msg.parts || [];
      const content: string[] = [];

      for (const part of parts) {
        if (part.type === "text") content.push(part.text);
        if (part.type !== "layout") continue;
        let artifact: RuneLayoutArtifact | undefined;
        if ("status" in part && part.status === "ready") artifact = part.artifact;
        if ("text" in part && typeof part.text === "string") {
          try {
            artifact = convertLegacyLayout(part.text, `legacy-${msg.id}-${Object.keys(artifacts).length}`);
          } catch {
            artifact = undefined;
          }
        }
        if (artifact) {
          if (!(artifact.id in artifacts) && Object.keys(artifacts).length >= 20) {
            const oldestId = Object.keys(artifacts)[0];
            if (oldestId) delete artifacts[oldestId];
          }
          artifacts[artifact.id] = artifact;
          content.push(compactArtifactMarker(artifact));
        }
      }

      const textContent = content.join("") || msg.content || "";
      if (!textContent || msg.id === assistantId) return [];

      return [{ role: msg.role, content: textContent }];
    });
    return { providerMessages, artifacts };
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
  <button class="add-btn" disabled={loading}>
      <img src={addIcon} alt="Add tools or upload media" />
  </button>
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

    .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;
    flex-shrink: 0;

    border-radius: var(--radius-sm);
    border: var(--border-thin) solid var(--color-border-muted);

    background: var(--color-bg);
    color: var(--color-border-muted);
    cursor: pointer;

    transition: all 0.15s ease;
  }

  .add-btn:hover {
    background: var(--color-bg-hover);
    color: #222;
  }

  .add-btn:active {
    transform: scale(0.95);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-icon {
    width: 16px;
    height: 16px;
  }

</style>
