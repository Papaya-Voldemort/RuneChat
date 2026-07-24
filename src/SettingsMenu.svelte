<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { closeIcon } from "./lib/assets";
  import { apiKey } from "./lib/stores/api-key";
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

  const dispatch = createEventDispatcher();

  export let open = false;

  const models = [
    { slug: "anthropic/claude-opus-5", name: "Claude Opus 5" },
    { slug: "openai/gpt-5.6-sol", name: "GPT-5.6 Sol" },
    { slug: "anthropic/claude-sonnet-5", name: "Claude Sonnet 5" },
    { slug: "google/gemini-3.6-flash", name: "Gemini 3.6 Flash" },
    { slug: "openai/gpt-5.6-luna", name: "GPT-5.6 Luna" },
    { slug: "moonshotai/kimi-k3", name: "Kimi K3" },
    { slug: "z-ai/glm-5.2", name: "GLM 5.2" },
    { slug: "x-ai/grok-4.5", name: "Grok 4.5" },
    {
      slug: "google/gemini-3.5-flash-lite",
      name: "Gemini 3.5 Flash Lite",
    },

    { slug: "custom", name: "Custom Model ID..." },
  ];

  function close() {
    dispatch("close");
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="underlay" on:click={close} role="presentation"></div>
  <div class="menu">
    <div class="header">
      <h1>Settings</h1>
      <button class="iconBtn" on:click={close}>
        <img class="iconImg" src={closeIcon} alt="Close settings" />
      </button>
    </div>
    <hr />
    <div class="settings">
      <div class="apiKey">
        <label for="apiKey">HCAI API Key (BYOK)</label>
        <input
          type="text"
          name="apiKey"
          id="apiKey"
          placeholder="Paste your HCAI API key here"
          bind:value={$apiKey}
        />
      </div>
      <span
        >Get your Key at: <a target="_blank" href="https://ai.hackclub.com"
          >HCAI</a
        ></span
      >
      <!-- User Profile Fields -->
      <div class="settings-item">
        <label for="userProfileName">Your Name</label>
        <input
          type="text"
          id="userProfileName"
          placeholder="What should the AI call you?"
          bind:value={$userProfileName}
        />
      </div>
      <div class="settings-item">
        <label for="userProfileAbout">About You / Custom Instructions</label>
        <textarea
          id="userProfileAbout"
          placeholder="e.g., Coding preferences, target frameworks, tone rules..."
          bind:value={$userProfileAbout}
          rows="3"
        ></textarea>
      </div>
      <div class="settings-item">
        <label for="modelSelect">Language Model</label>
        <select id="modelSelect" bind:value={$selectedModel}>
          {#each models as model}
            <option value={model.slug}>{model.name}</option>
          {/each}
        </select>
      </div>
      {#if $selectedModel === "custom"}
        <div class="settings-item">
          <label for="customModeInput">Custom Model ID</label>
          <input
            type="text"
            id="customModeInput"
            placeholder="eg. anthropic/mythos-latest"
            bind:value={$customModelId}
          />
        </div>
      {/if}
      <div class="settings-item">
        <label for="personaSelect">Model Persona</label>
        <select id="personaSelect" bind:value={$selectedPersona}>
          <option value="jules">Jules (Quirky & Warm)</option>
          <option value="jade">Jade (Cool & Sarcastic)</option>
          <option value="jasper">Jasper (Technical Coder)</option>
          <option value="onyx">Onyx (Creative Writer)</option>
          <option value="custom">Custom System Prompt...</option>
        </select>
      </div>

      {#if $selectedPersona === "custom"}
        <div class="settings-item">
          <label for="customPrompt">Custom System Prompt</label>
          <textarea
            id="customPrompt"
            placeholder="You are a helpful AI assistant..."
            bind:value={$customSystemPrompt}
            rows="4"
          ></textarea>
        </div>
      {/if}
      <div class="settings-item">
        <label for="maxTokensInput">Max Tokens</label>
        <input
          type="number"
          id="maxTokensInput"
          placeholder="e.g. 4096"
          bind:value={$maxTokens}
        />
      </div>
      <div class="settings-item toggle-row">
        <div class="toggle-copy">
          <label for="enableLayoutsToggle">Visual Layout Previews</label>
          <small>Interactive artifacts are created only when you explicitly ask. Turning this off removes layout tools.</small>
        </div>
        <label class="switch-container">
          <input
            type="checkbox"
            id="enableLayoutsToggle"
            bind:checked={$enableLayoutPreviews}
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
  </div>
{/if}

<style>
  .iconBtn {
    border: none;
    width: 36px;
    height: 36px;

    border-radius: var(--radius-md);
    background-color: var(--color-bg);

    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s ease;
  }

  .iconBtn:hover {
    background-color: var(--color-bg-hover);
  }

  .iconImg {
    width: 28px;
    height: 28px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    padding: 1.5rem;
    border: solid var(--border-thin) var(--color-border);
    border-radius: 12px;
    background-color: var(--color-bg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 480px;
    box-sizing: border-box;
  }

  .underlay {
    position: fixed;
    inset: 0;
    background-color: var(--color-overlay);
    z-index: 999;
    backdrop-filter: blur(4px);
  }

  .menu h1 {
    text-align: center;
    margin: 0;
    padding: 0;
  }

  .settings {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-top: 1rem;
  }

  .apiKey {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  label {
    padding: 0;
    margin: 0;
  }

  #apiKey {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 10px 12px;

    background: var(--color-bg);
    border: var(--border-thin) solid var(--color-border);
    border-radius: var(--radius-md);

    box-shadow: var(--shadow-sm);

    width: 100%;
    max-width: 100%;
  }

  .settings-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input[type="text"],
  input[type="number"],
  select,
  textarea {
    padding: 10px 12px;
    background: var(--color-bg);
    border: var(--border-thin) solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    width: 100%;
    font-size: 14px;
    color: var(--color-text);
    font-family: inherit;
    outline: none;
    box-sizing: border-box;
  }

  /* Custom toggle switches */
  .toggle-row {
    flex-direction: row !important;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem 0;
  }

  .toggle-copy {
    display: flex;
    flex-direction: column;
    gap: .2rem;
  }

  .toggle-copy small {
    max-width: 28rem;
    color: var(--color-text-muted);
    font-size: .72rem;
    line-height: 1.35;
  }

  .switch-container {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
  }

  .switch-container input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .switch-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--color-bg);
    transition: 0.2s ease;
    border-radius: 24px;
    border: 1px solid var(--color-border);
  }

  .switch-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: var(--color-text-subtle);
    transition: 0.2s ease;
    border-radius: 50%;
  }

  input:checked + .switch-slider {
    border-color: var(--color-primary);
  }

  input:checked + .switch-slider:before {
    transform: translateX(20px);
    background-color: var(--color-primary);
  }
</style>
