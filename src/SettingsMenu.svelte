<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }
</script>

{#if open}
  <div class="underlay" on:click={close}></div>
  <div class="menu">
    <div class="header">
      <h1>Settings</h1>
      <button class="iconBtn" on:click={close()}>
        <img class="iconImg" src="src/images/Close.svg" alt="Open sidebar" />
      </button>
    </div>
    <hr />
    <div class="settings">
      <p>Nothing here yet...</p>
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
