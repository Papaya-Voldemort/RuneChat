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
  import PopUp from "./PopUp.svelte";
  import type { UploadedAttachment } from "./PopUp.svelte";

  let isPopUpOpen = false;
  let attachments: UploadedAttachment[] = [];

  function togglePopUp() {
    isPopUpOpen = !isPopUpOpen;
  }

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
    const outgoingAttachments = attachments;

    const currentMsgs = get(messages);
    const isFirstMessage = currentMsgs.length === 0;

    messages.update((msgs) => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        role: "user",
        parts: [
          { type: "text", text: userContent },
          ...outgoingAttachments.map((attachment) => ({ type: "attachment" as const, ...attachment })),
        ],
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
    attachments = [];
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
        attachments: outgoingAttachments,
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
      }, fetch, (usage) => {
        messages.update((msgs) => msgs.map((msg) =>
          msg.id === assistantId ? { ...msg, usage } : msg,
        ));
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
    messages.update((msgs) => msgs.map((message) =>
      message.id === id ? { ...message, parts: nextParts } : message,
    ));
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
        if (part.type === "attachment") {
          content.push(`\n\n[Attached file: ${part.name}]\n${part.content}\n[End attached file]`);
        }
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

  function addAttachment(attachment: UploadedAttachment): void {
    attachments = [...attachments, attachment];
  }

  function removeAttachment(index: number): void {
    attachments = attachments.filter((_, attachmentIndex) => attachmentIndex !== index);
  }
</script>

<div class="chat-input-wrapper">
    {#if isPopUpOpen}
      <PopUp onClose={() => (isPopUpOpen = false)} onAttachment={addAttachment} />
    {/if}

    {#if attachments.length}
      <div class="attachment-list" aria-label="Attached files">
        {#each attachments as attachment, index}
          <span class="attachment-chip">{attachment.name}<button type="button" onclick={() => removeAttachment(index)} aria-label={`Remove ${attachment.name}`}>×</button></span>
        {/each}
      </div>
    {/if}
    <div class="chat-input">
        <button
          class="add-btn"
          disabled={loading}
          onclick={togglePopUp}
          aria-expanded={isPopUpOpen}
          aria-label="Add tools or upload media"
        >
          <img src={addIcon} alt="" />
        </button>
        <textarea
          bind:this={textareaRef}
          name="input"
          id="input"
          placeholder="Type a message..."
          bind:value={message}
          oninput={autoResize}
          onkeydown={handleKeydown}
          disabled={loading}
          rows="1"
        ></textarea>

        <button class="send-btn" onclick={send} disabled={loading}>
          <img src={sendMessageIcon} alt="Send Message" />
        </button>
    </div>

</div>


<style>
  .chat-input {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 10px 12px;

    background: var(--color-bg);
    border: var(--border-thin) solid var(--color-border);
    border-radius: var(--radius-md);

    box-shadow: var(--shadow-md);

    width: 100%;
    max-width: 600px;
  }

  .chat-input textarea {
    flex: 1;

    border: none;
    outline: none;
    background: transparent;

    font-size: 14px;
    color: var(--color-text);
    resize: none;
  }

  .chat-input textarea::placeholder {
    color: var(--color-text-subtle);
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    border-radius: var(--radius-sm);
    border: var(--border-thin) solid var(--color-border);

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
    color: var(--color-text-muted);
    cursor: pointer;

    transition: all 0.15s ease;
  }

  .add-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text);
  }

  .add-btn:active {
    transform: scale(0.95);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-btn[aria-expanded="true"] { background: var(--color-primary-soft); border-color: var(--color-primary); transform: rotate(45deg); }

  .chat-input-wrapper {
    position: relative;
    width: 100%;
    max-width: 600px;
  }

  .chat-input {
    max-width: none;
  }

  .attachment-list { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 0 8px; }
  .attachment-chip { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 5px 6px 5px 9px; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-surface-raised); color: var(--color-text-muted); font-size: 12px; }
  .attachment-chip button { display: grid; place-items: center; width: 18px; height: 18px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: 16px; line-height: 1; }.attachment-chip button:hover { background: var(--color-surface-hover); color: var(--color-text); }

</style>
