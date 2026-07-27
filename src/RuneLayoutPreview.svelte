<script lang="ts">
  import { onMount } from "svelte";
  import type { RuneLayoutArtifact, RuneLayoutStatus } from "./lib/rune-layout/types";
  import { compileRuneLayoutSrcdoc } from "./lib/rune-layout/runtime";
  import { createId } from "./lib/functions/id";

  export let artifact: RuneLayoutArtifact | undefined = undefined;
  export let status: RuneLayoutStatus = "building";
  export let progress = 0;
  export let error = "";
  export let retryKey = 0;

  let iframeElement: HTMLIFrameElement | undefined;
  let iframeHeight = 96;
  let srcdoc = "";
  let channel = "";
  let lastCompileKey = "";
  let localRetry = 0;
  let readyReceived = false;
  let measured = false;
  let runtimeError = "";
  let internallyScrollable = false;

  $: title = artifact?.title || "Rune Visual Layout";
  $: compileKey = artifact && status === "ready"
    ? `${artifact.id}:${artifact.version}:${retryKey}:${localRetry}`
    : "";
  $: if (compileKey && compileKey !== lastCompileKey && artifact) {
    lastCompileKey = compileKey;
    channel = createId();
    readyReceived = false;
    measured = false;
    runtimeError = "";
    iframeHeight = 96;
    internallyScrollable = false;
    srcdoc = compileRuneLayoutSrcdoc(artifact, channel);
  }
  $: revealed = status === "ready" && readyReceived && measured && !runtimeError;
  $: phase = progress < 0.35 ? "Structuring" : progress < 0.72 ? "Styling" : "Wiring interactions";

  function handleMessage(event: MessageEvent) {
    if (!iframeElement || event.source !== iframeElement.contentWindow) return;
    const data = event.data;
    if (!data || typeof data !== "object" || data.channel !== channel) return;

    if (data.type === "rune-ready") {
      readyReceived = true;
      return;
    }
    if (data.type === "rune-error") {
      runtimeError = typeof data.message === "string" ? data.message.slice(0, 500) : "The layout encountered a runtime error.";
      return;
    }
    if (data.type === "rune-resize") {
      const reported = Number(data.height);
      if (!Number.isFinite(reported)) return;
      internallyScrollable = reported > 1200;
      iframeHeight = Math.max(96, Math.min(1200, Math.ceil(reported)));
      measured = true;
    }
  }

  function reload() {
    localRetry += 1;
  }

  function exportArtifact(): void {
    if (!artifact) return;
    const closingScriptTag = "</scr" + "ipt>";
    const source = [
      "<!doctype html>",
      `<title>${artifact.title}</title>`,
      artifact.css ? `<style>${artifact.css}</style>` : "",
      artifact.markup,
      artifact.script ? `<script>${artifact.script.replace(new RegExp(closingScriptTag, "gi"), "<\\/script")}${closingScriptTag}` : "",
    ].filter(Boolean).join("\n");
    const url = URL.createObjectURL(new Blob([source], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${artifact.title.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "rune-layout"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  onMount(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });
</script>

<section class="preview-container" class:building={status === "building"} aria-label={title}>
  <header class="preview-header">
    <div class="title-group">
      <span class="rune-mark" aria-hidden="true">R</span>
      <span class="preview-title">{title}</span>
    </div>
    <div class="header-actions">
      <span class:ready={revealed} class:error={status === "error" || !!runtimeError} class="status-badge" aria-live="polite">
        {status === "building" ? phase : status === "error" || runtimeError ? "Needs attention" : revealed ? "Interactive" : "Preparing"}
      </span>
      {#if status === "ready"}
        <button class="reload-button" on:click={exportArtifact} aria-label="Download layout as HTML" title="Download HTML">⇩</button>
        <button class="reload-button" on:click={reload} aria-label="Reload layout" title="Reload layout">↻</button>
      {/if}
    </div>
  </header>

  {#if status === "building"}
    <div class="build-shell" role="status" aria-live="polite">
      <div class="skeleton-grid" aria-hidden="true">
        <span class="skeleton hero"></span>
        <span class="skeleton card"></span>
        <span class="skeleton card short"></span>
        <span class="skeleton chart"></span>
      </div>
      <div class="progress-copy">
        <span>{phase}</span><span>{Math.round(Math.max(.06, progress) * 100)}%</span>
      </div>
      <div class="progress-rail" aria-hidden="true"><span style={`width: ${Math.max(6, progress * 100)}%`}></span></div>
    </div>
  {:else if status === "error" || runtimeError}
    <div class="error-panel" role="alert">
      <div>
        <strong>Layout unavailable</strong>
        <p>{runtimeError || error || "The layout could not be completed."}</p>
      </div>
      {#if artifact}
        <button class="retry-button" on:click={reload}>Try again</button>
      {/if}
    </div>
  {:else if artifact}
    <div class="frame-wrapper" class:revealed>
      <iframe
        bind:this={iframeElement}
        title={artifact.title}
        sandbox="allow-scripts"
        class="preview-frame"
        class:scrollable={internallyScrollable}
        style={`height: ${iframeHeight}px`}
        scrolling={internallyScrollable ? "yes" : "no"}
        {srcdoc}
      ></iframe>
      {#if !revealed}
        <div class="preparing" role="status">Preparing interactive preview…</div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .preview-container { width: 100%; min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-raised); box-shadow: var(--shadow-md); }
  .preview-container.building { border-color: var(--color-primary); }
  .preview-header { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .45rem .65rem; border-bottom: 1px solid var(--color-border); background: var(--color-surface-sunken); }
  .title-group,.header-actions { display: flex; align-items: center; gap: .5rem; min-width: 0; }
  .rune-mark { width: 22px; height: 22px; flex: 0 0 auto; display: grid; place-items: center; border-radius: var(--radius-sm); background: var(--color-primary); color: var(--color-on-primary); font-size: .7rem; font-weight: 800; }
  .preview-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text); font-size: .78rem; font-weight: 700; }
  .status-badge { border-radius: 999px; padding: .2rem .5rem; background: var(--color-primary-soft); color: var(--color-primary); font-size: .65rem; font-weight: 750; white-space: nowrap; }
  .status-badge.ready { background: var(--color-success-soft); color: var(--color-success-text); }
  .status-badge.error { background: var(--color-danger-soft); color: var(--color-danger-text); }
  .reload-button { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text-muted); cursor: pointer; font-size: 1rem; }
  .reload-button:hover { background: var(--color-surface-hover); color: var(--color-text); }
  .reload-button:focus-visible,.retry-button:focus-visible { outline: 3px solid var(--color-focus-ring); outline-offset: 2px; }
  .build-shell { min-height: 250px; display: flex; flex-direction: column; gap: .75rem; padding: clamp(.8rem, 3vw, 1.25rem); }
  .skeleton-grid { flex: 1; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: .65rem; }
  .skeleton { position: relative; overflow: hidden; min-height: 54px; border-radius: var(--radius-sm); background: var(--color-skeleton); }
  .skeleton::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, var(--color-skeleton-shine), transparent); animation: shimmer 1.5s infinite; }
  .skeleton.hero,.skeleton.chart { grid-column: 1 / -1; }
  .skeleton.hero { min-height: 45px; }
  .skeleton.chart { min-height: 90px; }
  .skeleton.short { max-width: 85%; }
  .progress-copy { display: flex; justify-content: space-between; color: var(--color-text-muted); font-size: .7rem; font-weight: 700; }
  .progress-rail { height: 4px; overflow: hidden; border-radius: 999px; background: var(--color-skeleton); }
  .progress-rail span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover)); transition: width .22s ease; }
  .frame-wrapper { position: relative; width: 100%; min-height: 96px; overflow: hidden; background: var(--color-surface); }
  .preview-frame { display: block; width: 100%; max-width: 100%; border: 0; background: transparent; opacity: 0; transition: opacity .22s ease; overflow: hidden; }
  .frame-wrapper.revealed .preview-frame { opacity: 1; }
  .preview-frame.scrollable { overflow: auto; }
  .preparing { position: absolute; inset: 0; display: grid; place-items: center; color: var(--color-text-muted); background: var(--color-surface-raised); font-size: .75rem; }
  .error-panel { min-height: 130px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; background: var(--color-danger-soft); color: var(--color-danger-text); }
  .error-panel strong { font-size: .85rem; }
  .error-panel p { margin: .25rem 0 0; max-width: 60ch; color: var(--color-danger-text); font-size: .75rem; line-height: 1.4; }
  .retry-button { flex: 0 0 auto; border: 1px solid var(--color-danger); border-radius: var(--radius-sm); padding: .45rem .7rem; color: var(--color-on-primary); background: var(--color-danger); cursor: pointer; font: inherit; font-size: .75rem; font-weight: 700; }
  @keyframes shimmer { to { transform: translateX(100%); } }
  @media (max-width: 480px) { .status-badge { display: none; } .skeleton-grid { grid-template-columns: minmax(0,1fr); } .skeleton.hero,.skeleton.chart { grid-column: auto; } .error-panel { align-items: flex-start; flex-direction: column; } }
  @media (prefers-reduced-motion: reduce) { .skeleton::after { display: none; } .progress-rail span,.preview-frame { transition: none; } }
</style>
