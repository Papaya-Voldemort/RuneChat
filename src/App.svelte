<script lang="ts">
  import { onMount } from "svelte";
  import Chat from "./Chat.svelte";
  import SideBar from "./SideBar.svelte";
  import { apiKey } from "./lib/stores/api-key";
  import "./main.css";

  onMount(() => {
    apiKey.load();

    const mobileViewport = window.matchMedia("(max-width: 768px)");
    const isTauri = "__TAURI_INTERNALS__" in window;
    const updateNativeMobileClass = () => {
      document.body.classList.toggle("native-mobile", isTauri && mobileViewport.matches);
    };

    updateNativeMobileClass();
    mobileViewport.addEventListener("change", updateNativeMobileClass);

    return () => {
      document.body.classList.remove("native-mobile");
      mobileViewport.removeEventListener("change", updateNativeMobileClass);
    };
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
    /* #app is already sized to the usable viewport. Using 100dvh here would
       add the native safe-area padding a second time and hide the composer
       behind the Android navigation bar. */
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--color-canvas);
    color: var(--color-text);
  }
</style>
