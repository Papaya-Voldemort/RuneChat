<script>
  import { createEventDispatcher } from "svelte";
  import { closeIcon } from "./lib/assets";
  const dispatch = createEventDispatcher();

  export let open = false;

  function close() {
    dispatch("close");
  }
</script>

{#if open}
  <div class="underlay" on:click={close}></div>
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
</style>
