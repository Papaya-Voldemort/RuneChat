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
  } from "./lib/stores/settings";

  const dispatch = createEventDispatcher();

  export let open = false;

  const models = [
    { slug: "anthropic/claude-fable-5", name: "Claude Fable 5" },
    {
      slug: "google/gemini-3.1-flash-lite-preview",
      name: "Gemini 3.1 Flash Lite (Preview)",
    },
    { slug: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" },
    { slug: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { slug: "google/gemma-4-31b-instruct", name: "Gemma 4 31B Instruct" },
    { slug: "anthropic/claude-sonnet-4.6", name: "Claude 4.6 Sonnet" },
    { slug: "anthropic/claude-sonnet-4.5", name: "Claude 4.5 Sonnet" },
    { slug: "anthropic/claude-opus-4.8", name: "Claude 4.8 Opus" },
    { slug: "anthropic/claude-opus-4.5", name: "Claude 4.5 Opus" },
    { slug: "anthropic/claude-haiku-4.5", name: "Claude 4.5 Haiku" },
    { slug: "anthropic/claude-sonnet-latest", name: "Claude Sonnet (Latest)" },
    { slug: "openai/gpt-5.5-preview", name: "GPT-5.5 Preview" },
    { slug: "openai/gpt-5-preview", name: "GPT-5 Preview" },
    { slug: "openai/o1", name: "OpenAI o1" },
    { slug: "deepseek/deepseek-v4-pro", name: "DeepSeek V4 Pro" },
    { slug: "deepseek/deepseek-v4-flash", name: "DeepSeek V4 Flash" },
    { slug: "qwen/qwen3.7-plus", name: "Qwen 3.7 Plus" },
    { slug: "xiaomi/mimo-v2.5", name: "MiMo V2.5" },
    { slug: "tencent/hy3-preview", name: "Hunyuan 3 Preview" },
    { slug: "minimax/minimax-m3", name: "MiniMax M3" },
    { slug: "baichuan/kimi-k2", name: "Kimi K2" },
    { slug: "glm/glm-5.1", name: "GLM 5.1" },
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
    border: solid var(--border-thin) var(--color-border-muted);
    border-radius: 12px;
    background-color: var(--color-bg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 480px;
    box-sizing: border-box;
  }

  .underlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.45);
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
    border: var(--border-thin) solid var(--color-border-muted);
    border-radius: var(--radius-md);

    box-shadow: 0 2px 6px var(--color-shadow);

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
    border: var(--border-thin) solid var(--color-border-muted);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 6px var(--color-shadow);
    width: 100%;
    font-size: 14px;
    color: #222;
    font-family: inherit;
    outline: none;
    box-sizing: border-box;
  }
</style>
