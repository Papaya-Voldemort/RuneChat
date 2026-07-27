<script lang="ts">
  import { onMount, tick } from "svelte";
  import { uploadAttachment, type UploadedAttachment } from "./lib/functions/attachments";

  export type { UploadedAttachment } from "./lib/functions/attachments";

  let {
    onClose,
    onAttachment,
  }: {
    onClose: () => void;
    onAttachment: (attachment: UploadedAttachment) => void;
  } = $props();

  let fileInput: HTMLInputElement;
  let menu: HTMLElement;
  let error = $state("");
  let uploading = $state(false);
  let closeOnOutsideClick = false;

  function chooseFile(): void {
    error = "";
    fileInput?.click();
  }

  async function uploadFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    uploading = true;
    error = "";
    try {
      onAttachment(await uploadAttachment(file));
      onClose();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Could not read that file";
    } finally {
      uploading = false;
    }
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") onClose();
  }

  function onWindowClick(event: MouseEvent): void {
    if (closeOnOutsideClick && menu && !menu.contains(event.target as Node)) onClose();
  }

  onMount(() => {
    void tick().then(() => menu?.focus());
    requestAnimationFrame(() => {
      closeOnOutsideClick = true;
    });
  });
</script>

<svelte:window onkeydown={onKeydown} onclick={onWindowClick} />

<div class="popup" bind:this={menu} tabindex="-1" role="dialog" aria-label="Add to message">
  <div class="popup-header">
    <div>
      <p class="eyebrow">Add to message</p>
      <h2>Bring in a file</h2>
    </div>
    <button class="close" type="button" onclick={onClose} aria-label="Close add menu">×</button>
  </div>

  <input bind:this={fileInput} class="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,.txt,.md,.csv,.json,.js,.ts,.tsx,.jsx,.html,.css,.xml,.yaml,.yml,.py,.java,.c,.cpp,.h,.sql,.sh,.log" onchange={uploadFile} />
  <button class="upload-action" type="button" onclick={chooseFile} disabled={uploading}>
    <span class="upload-icon" aria-hidden="true">↑</span>
    <span><strong>{uploading ? "Uploading…" : "Upload a file or image"}</strong><small>PNG, JPEG, WebP, GIF (up to 50 MB), plus text and code files</small></span>
  </button>
  {#if error}<p class="error" role="alert">{error}</p>{/if}
  <p class="hint">Images are sent to the model by temporary URL, never as base64.</p>
</div>

<style>
  .popup { position: absolute; left: 0; bottom: calc(100% + 12px); z-index: 20; width: min(340px, calc(100vw - 32px)); padding: 12px; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-surface-raised); box-shadow: var(--shadow-lg); }
  .popup-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 4px 4px 12px; }
  .eyebrow { margin: 0 0 3px; color: var(--color-text-subtle); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  h2 { margin: 0; font-size: 16px; letter-spacing: -.01em; }
  .close { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: 24px; line-height: 1; transition: background .15s ease, color .15s ease; }
  .close:hover { background: var(--color-surface-hover); color: var(--color-text); }
  .file-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .upload-action { display: flex; width: 100%; gap: 11px; align-items: center; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); color: var(--color-text); cursor: pointer; text-align: left; transition: border-color .15s ease, background .15s ease, transform .15s ease; }
  .upload-action:hover:not(:disabled) { border-color: var(--color-primary); background: var(--color-primary-soft); transform: translateY(-1px); }
  .upload-action:disabled { opacity: .65; cursor: wait; }
  .upload-icon { display: grid; place-items: center; flex: 0 0 auto; width: 34px; height: 34px; border-radius: 10px; background: var(--color-primary); color: var(--color-on-primary); font-size: 21px; font-weight: 600; }
  strong, small { display: block; } small { margin-top: 3px; color: var(--color-text-muted); font-size: 12px; }
  .hint, .error { margin: 10px 4px 2px; font-size: 12px; line-height: 1.35; }.hint { color: var(--color-text-subtle); }.error { color: var(--color-danger-text); }
</style>
