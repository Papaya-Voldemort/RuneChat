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
  } from "./lib/assets";
  import {
    initializeChatStore,
    messages,
    draftPrompt,
  } from "./lib/stores/chat";
  import { selectedPersona, enableLayoutPreviews } from "./lib/stores/settings";
  import RuneLayoutPreview from "./RuneLayoutPreview.svelte";

  let messagesContainer: HTMLElement;

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  $: if ($messages) {
    tick().then(scrollToBottom);
  }

  $: displayPersonaName = $selectedPersona
    ? $selectedPersona.charAt(0).toUpperCase() + $selectedPersona.slice(1)
    : "Jules";

  function selectSuggestion(text: string) {
    draftPrompt.set(text);
    // Find the input element and focus it
    document.getElementById("input")?.focus();
  }

  onMount(() => {
    void initializeChatStore();
  });

  async function copyBtn(message: any) {
    try {
      const parts = message.parts || [];
      let text = parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("\n");
      if (!text) {
        text = message.content || "";
      }
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<section class="chat-container">
  <div class="messages" bind:this={messagesContainer}>
    {#if $messages.length === 0}
      <div class="welcome-container">
        <h1 class="welcome-title">How can I help you today?</h1>
        <p class="welcome-subtitle">
          Ask {displayPersonaName} anything or select a suggestion to get started:
        </p>

        <div class="suggestions-grid">
          <button
            class="suggestion-card"
            on:click={() => selectSuggestion("Explain Svelte 5 Runes simply")}
          >
            <img src={lightningIcon} alt="Svelte 5" class="card-icon" />
            <span class="card-title">Explain Svelte 5</span>
            <span class="card-desc"
              >Break down Svelte 5 Runes like $state and $derived</span
            >
          </button>

          <button
            class="suggestion-card"
            on:click={() =>
              selectSuggestion("Help me debug a CSS Flexbox layout")}
          >
            <img src={flexboxIcon} alt="CSS Layoyt" class="card-icon" />
            <span class="card-title">Debug CSS Flexbox</span>
            <span class="card-desc"
              >Fix vertical centering or overflow layout shifts</span
            >
          </button>

          <button
            class="suggestion-card"
            on:click={() =>
              selectSuggestion("Write a fast Bun server in TypeScript")}
          >
            <img src={serverIcon} alt="Bun Server" class="card-icon" />
            <span class="card-title">Write Bun Server</span>
            <span class="card-desc"
              >Create a backend routing script with Bun.serve</span
            >
          </button>

          <button
            class="suggestion-card"
            on:click={() =>
              selectSuggestion("Brainstorm clean dark-mode color palettes")}
          >
            <img src={colorsIcon} alt="Color Palette" class="card-icon" />
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
                  <span class="thinking-title"> Thought Process </span>
                  <span class="chevron"> ▾ </span>
                </summary>
                <div class="thinking-content">
                  {normalizeText(
                    message.parts
                      .filter((p) => p.type === "reasoning")
                      .map((p) => p.text)
                      .join(""),
                  )}
                </div>
              </details>
            {/if}

            {#each message.parts as part}
              {#if part.type === "text"}
                {#if part.text.trim()}
                  <div class="message-bubble">
                    {@html renderMarkdown(part.text)}
                  </div>
                {/if}
              {:else if part.type === "layout"}
                {#if $enableLayoutPreviews}
                  <div class="layouts-container">
                    <RuneLayoutPreview code={part.text} />
                  </div>
                {:else}
                  <div class="message-bubble">
                    {@html renderMarkdown("```html\n" + part.text + "\n```")}
                  </div>
                {/if}
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
            <button class="iconBtn" on:click={() => copyBtn(message)}>
              <img src={copyIcon} alt="Copy Contents" class="iconImg" />
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
    background-color: rgba(0, 0, 0, 0.06);
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
    max-width: 900px;
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
    border-left: 2px solid #ccc;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
    font-size: 0.8rem;
    color: #666;
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
    background: rgba(0, 0, 0, 0.04);
    color: #333;
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
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    line-height: 1.5;
    color: #555;
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
    background: #c41e3a;
    color: white;
    border-bottom-right-radius: 0.25rem;
  }

  .assistant .message-bubble {
    background: white;
    color: #1a1a1a;
    border-bottom-left-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
    background: rgba(0, 0, 0, 0.06);
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
    background: rgba(0, 0, 0, 0.06);
    padding: 0.15rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }

  .message-bubble :global(blockquote) {
    margin: 0.5rem 0;
    padding-left: 0.75rem;
    border-left: 3px solid #c41e3a;
    color: #555;
    font-style: italic;
  }

  .message-bubble :global(hr) {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin: 0.75rem 0;
  }

  .message-bubble :global(a) {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .user .message-bubble :global(pre),
  .user .message-bubble :global(p code) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .user .message-bubble :global(blockquote) {
    border-left-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
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
    background-color: #78716c;
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
    color: #666;
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
    background: white;
    border: var(--border-thin) solid var(--color-border-muted);
    border-radius: 8px;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    box-shadow: 0 1px 3px var(--color-shadow);
  }

  .suggestion-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--color-shadow);
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
    color: #222;
  }

  .card-desc {
    font-size: 0.8rem;
    color: #666;
    line-height: 1.3;
  }

  .layouts-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 0.5rem;
  }
</style>
