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
    if (e.key === "Escape") {
      close();
    }
  }
</script>

{#if open}
  <div
    class="underlay"
    on:click={close}
    on:keydown={handleKeydown}
    role="presentation"
    tabindex={-1}
  ></div>
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
        <label for="apiKey">HCAI API Key</label>
        <input type="text" name="apiKey" id="apiKey" bind:value={API_KEY} />
        <button class="saveBtn" on:click={saveApiKey}>Save</button>
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

    padding: 0.5rem;
    border: solid 3px var(--color-primary);
    border-radius: var(--radius-md);
    background-color: var(--color-bg);

    min-width: 60%;
    min-height: 60%;
  }

  .underlay {
    position: fixed;
    inset: 0;
    background-color: rgba(97, 97, 97, 0.39);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  .menu h1 {
    text-align: center;
    margin: 0;
    padding: 0;
  }

  .settings {
    display: flex;
    flex-direction: column;
  }

  .apiKey {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
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
    max-width: 600px;
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
