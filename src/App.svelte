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
    display: flex;
    flex-direction: row;
    max-width: 100vw;
  }
</style>
