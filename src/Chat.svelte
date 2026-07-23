<script lang="ts">
  import { onMount, tick } from "svelte";
  import { renderMarkdown, normalizeText } from "./lib/functions/markdown";
  import Input from "./Input.svelte";
  import {
    copyIcon,
    lightningIcon,
    flexboxIcon,
    serverIcon,
    colorsIcon,
    infoIcon,
  } from "./lib/assets";
  import {
    initializeChatStore,
    messages,
    draftPrompt,
  } from "./lib/stores/chat";
  import {
    selectedPersona,
    enableLayoutPreviews,
  } from "./lib/stores/settings";
  import RuneLayoutPreview from "./RuneLayoutPreview.svelte";
  import { convertLegacyLayout } from "./lib/rune-layout/artifacts";
  import type {
    RuneLayoutArtifact,
    RuneLayoutPart,
    RuneLayoutStatus,
  } from "./lib/rune-layout/types";

  let messagesContainer = $state<HTMLElement>();

  const displayPersonaName = $derived(
    $selectedPersona
      ? $selectedPersona.charAt(0).toUpperCase() +
          $selectedPersona.slice(1)
      : "Jules",
  );

  function scrollToBottom(): void {
    if (!messagesContainer) return;

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  $effect(() => {
    const messageCount = $messages.length;

    if (messageCount > 0) {
      void tick().then(scrollToBottom);
    }
  });

  function selectSuggestion(text: string): void {
    draftPrompt.set(text);
    document.getElementById("input")?.focus();
  }

  onMount(() => {
    void initializeChatStore();
  });

  async function copyBtn(message: any): Promise<void> {
    try {
      const parts = message.parts ?? [];

      let text = parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("\n");

      if (!text) {
        text = message.content ?? "";
      }

      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  function showInfo(message: any): void {
    console.log("Message info:", message);
  }

  function layoutArtifact(
    part: RuneLayoutPart,
    messageId: string,
    partIndex: number,
  ): RuneLayoutArtifact | undefined {
    if ("status" in part && part.status === "ready") {
      return part.artifact;
    }

    if ("status" in part && part.status === "error" && part.artifact) {
      return part.artifact;
    }

    if ("text" in part) {
      try {
        return convertLegacyLayout(
          part.text,
          `legacy-${messageId}-${partIndex}`,
        );
      } catch {
        return undefined;
      }
    }

    return undefined;
  }

  function layoutStatus(
    part: RuneLayoutPart,
    messageId: string,
    partIndex: number,
  ): RuneLayoutStatus {
    if ("status" in part && part.status) {
      return part.status;
    }

    return layoutArtifact(part, messageId, partIndex) ? "ready" : "error";
  }

  function layoutSource(
    part: RuneLayoutPart,
    messageId: string,
    partIndex: number,
  ): string {
    const artifact = layoutArtifact(part, messageId, partIndex);

    if (!artifact) {
      return "text" in part ? part.text : "Layout source unavailable.";
    }

    return [
      artifact.markup,
      artifact.css
        ? `<style>\n${artifact.css}\n</style>`
        : "",
      artifact.script
        ? `<script>\n${artifact.script}\n<\/script>`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }
</script>

<section class="chat-container">
    <div class="messages" bind:this={messagesContainer}>
        {#if $messages.length === 0}
            <div class="welcome-container">
                <h1 class="welcome-title">How can I help you today?</h1>
                <p class="welcome-subtitle">
                    Ask {displayPersonaName} anything or select a suggestion to get
                    started:
                </p>

                <div class="suggestions-grid">
                    <button
                        class="suggestion-card"
                        onclick={() => selectSuggestion("Explain Svelte 5 Runes simply")}
                    >
                        <img
                            src={lightningIcon}
                            alt="Svelte 5"
                            class="card-icon"
                        />
                        <span class="card-title">Explain Svelte 5</span>
                        <span class="card-desc"
                            >Break down Svelte 5 Runes like $state and $derived</span
                        >
                    </button>

                    <button
                        class="suggestion-card"
                        onclick={() =>
                            selectSuggestion(
                                "Help me debug a CSS Flexbox layout",
                            )}
                    >
                        <img
                            src={flexboxIcon}
                            alt="CSS Layoyt"
                            class="card-icon"
                        />
                        <span class="card-title">Debug CSS Flexbox</span>
                        <span class="card-desc"
                            >Fix vertical centering or overflow layout shifts</span
                        >
                    </button>

                    <button
                        class="suggestion-card"
                        onclick={() =>
                            selectSuggestion(
                                "Write a fast Bun server in TypeScript",
                            )}
                    >
                        <img
                            src={serverIcon}
                            alt="Bun Server"
                            class="card-icon"
                        />
                        <span class="card-title">Write Bun Server</span>
                        <span class="card-desc"
                            >Create a backend routing script with Bun.serve</span
                        >
                    </button>

                    <button
                        class="suggestion-card"
                        onclick={() =>
                            selectSuggestion(
                                "Brainstorm clean dark-mode color palettes",
                            )}
                    >
                        <img
                            src={colorsIcon}
                            alt="Color Palette"
                            class="card-icon"
                        />
                        <span class="card-title">Brainstorm Palettes</span>
                        <span class="card-desc"
                            >Generate HSL color tokens for modern designs</span
                        >
                    </button>
                </div>
            </div>
        {:else}
            {#each $messages as message (message.id)}
                <div class="message-wrapper {message.role}">
                    {#if message.parts?.length}
                        {#if message.parts.some((p) => p.type === "reasoning")}
                            <details class="thinking-details">
                                <summary class="thinking-summary">
                                    <span class="thinking-title">
                                        Thought Process
                                    </span>
                                    <span class="chevron"> ▾ </span>
                                </summary>
                                <div class="thinking-content">
                                    {normalizeText(
                                        message.parts
                                            .filter(
                                                (p) => p.type === "reasoning",
                                            )
                                            .map((p) => p.text)
                                            .join(""),
                                    )}
                                </div>
                            </details>
                        {/if}

                        {#each message.parts as part, partIndex}
                            {#if part.type === "text"}
                                {#if part.text.trim()}
                                    <div class="message-bubble">
                                        {@html renderMarkdown(part.text)}
                                    </div>
                                {/if}
                            {:else if part.type === "layout"}
                                {#if $enableLayoutPreviews}
                                    <div class="layouts-container">
                                        <RuneLayoutPreview
                                            artifact={layoutArtifact(
                                                part,
                                                message.id,
                                                partIndex,
                                            )}
                                            status={layoutStatus(
                                                part,
                                                message.id,
                                                partIndex,
                                            )}
                                            progress={"progress" in part
                                                ? part.progress
                                                : 1}
                                            error={"error" in part
                                                ? part.error
                                                : "This stored layout could not be converted safely."}
                                        />
                                    </div>
                                {:else}
                                    <div class="message-bubble">
                                        {@html renderMarkdown(
                                            "```html\n" +
                                                layoutSource(
                                                    part,
                                                    message.id,
                                                    partIndex,
                                                ) +
                                                "\n```",
                                        )}
                                    </div>
                                {/if}
                            {:else if part.type === "warning"}
                                <div class="stream-warning" role="status">
                                    {part.text}
                                </div>
                            {:else if part.type === "attachment"}
                                <div class="attachment-message" title={part.name}>
                                    <span aria-hidden="true">↗</span> {part.name}
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <div class="message-bubble">
                            {#if message.role === "assistant" && !message.content}
                                <div class="typing-indicator">
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                </div>
                            {:else}
                                {@html renderMarkdown(message.content ?? "")}
                            {/if}
                        </div>
                    {/if}

                    <div class="options">
                        <button
                            class="iconBtn"
                            onclick={() => copyBtn(message)}
                        >
                            <img
                                src={copyIcon}
                                alt="Copy Contents"
                                class="iconImg"
                            />
                        </button>
                        <button
                            class="iconBtn"
                            onclick={() => showInfo(message)}
                        >
                            <img
                                src={infoIcon}
                                alt="Message Info"
                                class="iconImg"
                            />
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    <div class="input-area">
        <Input />
    </div>
</section>

<style>
    .iconBtn {
        border: none;
        width: 28px;
        height: 28px;
        background: transparent;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.4;
        transition:
            opacity 0.15s ease,
            background-color 0.15s ease;
        cursor: pointer;
    }

    .iconBtn:hover {
        opacity: 1;
        background-color: var(--color-scrim);
    }

    .iconImg {
        width: 16px;
        height: 16px;
    }

    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;

        background: inherit;
        min-width: 0;
    }

    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-bottom: 4rem;
        scrollbar-width: none;
        gap: 1rem;
    }

    .messages::-webkit-scrollbar {
        display: none;
    }

    .input-area {
        position: sticky;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1rem;
        background: transparent;
        z-index: 20;
    }

    .message-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: flex-end;
    }

    .message-wrapper.user {
        justify-content: flex-end;
    }

    .message-wrapper.assistant {
        align-items: flex-start;
    }

    .thinking-details summary::-webkit-details-marker {
        display: none;
    }
    .thinking-details summary {
        list-style: none;
    }

    .thinking-details {
        max-width: 85%;
        width: 100%;
        margin: 0.4rem 0;
        border-left: 2px solid var(--color-border);
        background: var(--color-scrim-subtle);
        border-radius: 4px;
        font-size: 0.8rem;
        color: var(--color-text-muted);
        transition: border-color 0.2s ease;
    }

    .thinking-details:hover {
        border-left-color: var(--color-primary);
    }

    .thinking-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.35rem 0.6rem;
        cursor: pointer;
        user-select: none;
        font-weight: 500;
    }

    .thinking-summary:hover {
        background: var(--color-scrim);
        color: var(--color-text);
    }

    .thinking-title {
        font-family: inherit;
    }

    .chevron {
        font-size: 0.75rem;
        display: inline-block;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Rotates the chevron when the accordion is open */
    .thinking-details[open] .chevron {
        transform: rotate(180deg);
    }

    .thinking-content {
        padding: 0.5rem 0.6rem;
        white-space: pre-wrap;
        word-wrap: break-word;
        border-top: 1px solid var(--color-border);
        line-height: 1.5;
        color: var(--color-text-muted);
    }

    .message-wrapper.assistant {
        align-items: flex-start;
        gap: 0.25rem;
    }

    .assistant .message-bubble {
        margin-top: 0.35rem;
    }

    .options {
        margin-top: 0.25rem;
        display: flex;
        gap: 3px;
    }

    .message-wrapper .options {
        opacity: 0;
        transition: opacity 0.15s ease;
    }

    .message-wrapper:hover .options {
        opacity: 1;
    }

    .message-bubble {
        max-width: 75%;
        padding: 0.45rem 0.85rem;
        border-radius: 1rem;
        font-size: 0.9375rem;
        line-height: 1.25;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    .user .message-bubble {
        background: var(--color-primary);
        color: var(--color-on-primary);
        border-bottom-right-radius: 0.25rem;
    }

    .assistant .message-bubble {
        background: var(--color-surface-raised);
        color: var(--color-text);
        border-bottom-left-radius: 0.25rem;
        box-shadow: var(--shadow-sm);
    }

    .message-bubble :global(h1),
    .message-bubble :global(h2),
    .message-bubble :global(h3) {
        margin: 0.5rem 0 0.25rem;
        font-size: 1.05em;
        font-weight: 600;
    }

    .message-bubble :global(p) {
        margin: 0.2rem 0;
    }

    .message-bubble :global(p:first-child) {
        margin-top: 0;
    }

    .message-bubble :global(p:last-child) {
        margin-bottom: 0;
    }

    .message-bubble :global(ul),
    .message-bubble :global(ol) {
        margin: 0.35rem 0;
        padding-left: 1.25rem;
    }

    .message-bubble :global(li) {
        margin: 0.15rem 0;
    }

    .message-bubble :global(pre) {
        background: var(--color-code);
        padding: 0.6rem 0.75rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        font-size: 0.85em;
        line-height: 1.4;
        margin: 0.5rem 0;
    }

    .message-bubble :global(code) {
        font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
    }

    .message-bubble :global(p code) {
        background: var(--color-code);
        padding: 0.15rem 0.35rem;
        border-radius: 0.25rem;
        font-size: 0.9em;
    }

    .message-bubble :global(blockquote) {
        margin: 0.5rem 0;
        padding-left: 0.75rem;
        border-left: 3px solid var(--color-primary);
        color: var(--color-text-muted);
        font-style: italic;
    }

    .message-bubble :global(hr) {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 0.75rem 0;
    }

    .message-bubble :global(a) {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .user .message-bubble :global(pre),
    .user .message-bubble :global(p code) {
        background: var(--color-on-primary-subtle);
        color: var(--color-on-primary);
    }

    .user .message-bubble :global(blockquote) {
        border-left-color: var(--color-on-primary-border);
        color: var(--color-on-primary-muted);
    }

    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0.2rem 0;
    }

    .dot {
        width: 6px;
        height: 6px;
        background-color: var(--color-text-subtle);
        border-radius: 50%;
        animation: pulse 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
        animation-delay: -0.32s;
    }

    .dot:nth-child(2) {
        animation-delay: -0.16s;
    }

    @keyframes pulse {
        0%,
        80%,
        100% {
            transform: scale(0.6);
            opacity: 0.4;
        }

        40% {
            transform: scale(1.1);
            opacity: 1;
        }
    }

    .attachment-message {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        max-width: 100%;
        margin-top: 6px;
        padding: 6px 9px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface-sunken);
        color: var(--color-text-muted);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .welcome-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        height: 100%;
        max-width: 600px;
        margin: auto;
        padding: 2rem 1rem;
        gap: 1.5rem;
    }

    .welcome-title {
        font-size: 1.8rem;
        color: var(--color-primary);
        font-weight: 700;
        margin: 0;
    }

    .welcome-subtitle {
        font-size: 1rem;
        color: var(--color-text-muted);
        margin: 0 0 1rem 0;
    }

    .suggestions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        width: 100%;
    }

    @media (max-width: 768px) {
        .welcome-subtitle,
        .suggestions-grid {
            display: none;
        }
    }

    .suggestion-card {
        background: var(--color-surface-raised);
        border: var(--border-thin) solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        box-shadow: var(--shadow-sm);
    }

    .suggestion-card:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .card-icon {
        width: 20px;
        height: 20px;
        margin-bottom: 0.25rem;
        color: var(--color-primary);
    }

    .card-title {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-text);
    }

    .card-desc {
        font-size: 0.8rem;
        color: var(--color-text-muted);
        line-height: 1.3;
    }

    .layouts-container {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 0.5rem;
    }

    .stream-warning {
        max-width: min(100%, 44rem);
        margin-top: 0.35rem;
        border-left: 3px solid var(--color-warning);
        border-radius: 4px;
        padding: 0.45rem 0.65rem;
        background: var(--color-warning-soft);
        color: var(--color-warning-text);
        font-size: 0.75rem;
    }

    @media (max-width: 640px) {
        .messages {
            padding-inline: 0.6rem;
        }
        .message-bubble,
        .thinking-details {
            max-width: 92%;
        }
        .message-wrapper.assistant .layouts-container {
            width: 100%;
        }
    }
</style>
