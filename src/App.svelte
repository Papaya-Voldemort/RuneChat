<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "./Chat.svelte";
  import SideBar from "./SideBar.svelte";
  import { apiKey } from "./lib/stores/api-key";
  import "./main.css";

  onMount(() => {
    apiKey.load();
  });
</script>

<div class="page">
  <SideBar />
  <Chat />
</div>

<style>
  .page {
    display: flex;
    margin: 0;
    padding: 0;
    flex-direction: row;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    background: var(--color-canvas);
    color: var(--color-text);
  }
</style>
