<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { closeIcon } from "./lib/assets";
  const dispatch = createEventDispatcher();

  export let open = false;

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
      <h1>About RuneChat</h1>
      <button class="iconBtn" on:click={close}>
        <img class="iconImg" src={closeIcon} alt="Close info" />
      </button>
    </div>
    <hr />
    <div class="settings">
      <p>
        RuneChat is a lightweight chat UI for testing model behavior, prompts,
        and streamed responses without a lot of extra product noise.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>Stores chats locally in your browser with IndexedDB.</li>
        <li>Streams assistant responses from the Bun backend.</li>
        <li>Supports a configurable model through the `MODEL` env var.</li>
      </ul>

      <h2>Good to know</h2>
      <ul>
        <li>
          RuneChat uses BYOK: your HCAI key is stored only in browser local
          storage.
        </li>
        <li>
          The app expects the backend and frontend to share the same origin in
          production.
        </li>
        <li>Railway should use `bun run build` and `bun run start`.</li>
      </ul>
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
    border-radius: var(--radius-md);
    background-color: var(--color-bg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

    width: 90%;
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
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
  }
</style>
