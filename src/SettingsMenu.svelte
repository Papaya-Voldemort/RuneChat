<script lang="ts">
  import { onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { closeIcon } from "./lib/assets";
  import { apiKey } from "./lib/stores/api-key";

  const dispatch = createEventDispatcher();

  export let open = false;

  let API_KEY = "";

  // Load key from store on component mount
  const unsubscribe = apiKey.subscribe((key) => {
    API_KEY = key;
  });
  onDestroy(unsubscribe);

  function close() {
    dispatch("close");
  }

  function saveApiKey() {
    apiKey.set(API_KEY);
    close();
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
          bind:value={API_KEY}
        />
        <button class="saveBtn" on:click={saveApiKey}>Save</button>
      </div>
      <span
        >Get your Key at: <a target="_blank" href="https://ai.hackclub.com"
          >HCAI</a
        ></span
      >
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

  .saveBtn {
    padding: 8px 16px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s ease;
  }

  .saveBtn:hover {
    opacity: 0.9;
  }
</style>
