<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { prebuiltStyles, runeScript } from "./lib/rune-runtime";

  export let code = "";
  export let isBuilding = false;

  let iframeElement: HTMLIFrameElement;
  let iframeHeight = 280;

  function handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === "rune-resize") {
      iframeHeight = Math.max(150, event.data.height + 25);
    }
  }

  function compileIframeSrcdoc(htmlContent: string, scriptContents: string[]): string {
    const userScripts = scriptContents.map(s => {
      return `<script>${s}<\/script>`;
    }).join("\n");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>${prebuiltStyles}</style>
          <script>
            ${runeScript}
          <\/script>
        </head>
        <body>
          <div id="rune-wrapper">${htmlContent}</div>
          
          <script>
            // Initialize rune bindings immediately after DOM elements are parsed
            window.rune.init();
          <\/script>

          ${userScripts}

          <script>
            function reportHeight() {
              const wrapper = document.getElementById("rune-wrapper");
              if (wrapper) {
                window.parent.postMessage({
                  type: "rune-resize",
                  height: wrapper.offsetHeight || wrapper.scrollHeight
                }, "*");
              }
            }

            reportHeight();
            window.addEventListener("load", reportHeight);

            if (window.ResizeObserver) {
              const wrapper = document.getElementById("rune-wrapper");
              if (wrapper) {
                const ro = new ResizeObserver(reportHeight);
                ro.observe(wrapper);
              }
            }
          <\/script>
        </body>
      </html>
    `;
  }

  let updateTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastUpdateTime = 0;

  function updateIframe() {
    if (!iframeElement) return;

    // Extract script blocks safely
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts: string[] = [];
    const cleanHtml = code.replace(scriptRegex, (m, content) => {
      scripts.push(content);
      return "";
    });

    const docHtml = compileIframeSrcdoc(cleanHtml, scripts);
    iframeElement.srcdoc = docHtml;
  }

  function throttleUpdate() {
    if (!iframeElement) return;
    const now = Date.now();
    const timeSinceLast = now - lastUpdateTime;
    const throttleDelay = 90;

    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }

    if (timeSinceLast >= throttleDelay) {
      updateIframe();
      lastUpdateTime = now;
    } else {
      updateTimeout = setTimeout(() => {
        updateIframe();
        lastUpdateTime = Date.now();
      }, throttleDelay - timeSinceLast);
    }
  }

  $: if (iframeElement && (code !== undefined || !isBuilding)) {
    if (!isBuilding) {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateIframe();
      lastUpdateTime = Date.now();
    } else {
      throttleUpdate();
    }
  }

  onMount(() => {
    window.addEventListener("message", handleMessage);
    updateIframe();
    return () => {
      window.removeEventListener("message", handleMessage);
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  });
</script>

<div class="preview-container" class:building={isBuilding}>
  <div class="preview-header">
    <span class="preview-tag">Rune Visual Layout</span>
    {#if isBuilding}
      <div class="building-status">
        <span class="building-dot"></span>
        <span class="building-text">Building layout...</span>
      </div>
    {/if}
    <div class="header-loader" class:active={isBuilding}></div>
  </div>
  
  <div class="frame-wrapper">
    <iframe
      bind:this={iframeElement}
      title="rune-layout-preview"
      sandbox="allow-scripts"
      class="preview-frame"
      class:building={isBuilding}
      style="height: {iframeHeight}px; overflow: hidden;"
      scrolling="no"
    ></iframe>
    
    {#if isBuilding}
      <div class="building-overlay" transition:fade={{ duration: 250 }}>
        <div class="shimmer-effect"></div>
        <div class="building-card">
          <div class="loader-spinner">
            <svg class="spinner-svg" viewBox="0 0 24 24">
              <circle class="spinner-path" cx="12" cy="12" r="10" fill="none" stroke-width="3"></circle>
            </svg>
          </div>
          <span class="overlay-text">Constructing interface...</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview-container {
    width: 100%;
    max-width: 85%;
    border: 1px solid var(--color-border-muted);
    border-radius: 8px;
    background: #fafaf9;
    overflow: hidden;
    margin: 0.75rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .preview-container.building {
    border-color: rgba(165, 28, 48, 0.4);
    box-shadow: 0 0 12px rgba(165, 28, 48, 0.08);
  }

  .preview-header {
    background: #f5f5f4;
    padding: 6px 12px;
    border-bottom: 1px solid var(--color-border-muted);
    display: flex;
    align-items: center;
    position: relative;
  }

  .preview-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #78716c;
    letter-spacing: 0.5px;
  }

  .building-status {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }

  .building-dot {
    width: 6px;
    height: 6px;
    background-color: var(--color-primary);
    border-radius: 50%;
    animation: status-pulse 1.2s infinite ease-in-out;
  }

  .building-text {
    font-size: 10px;
    font-weight: 600;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .header-loader {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .header-loader.active {
    opacity: 1;
    animation: slide-loader 1.5s infinite linear;
  }

  .frame-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .preview-frame {
    width: 100%;
    border: none;
    background: transparent;
    display: block;
    transition: height 0.15s ease-out, filter 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
  }

  .preview-frame.building {
    filter: blur(1.5px);
    opacity: 0.75;
  }

  .building-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
    background: rgba(250, 250, 249, 0.4);
  }

  .building-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-border);
    padding: 8px 14px;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: overlay-bounce 2s infinite ease-in-out;
  }

  .overlay-text {
    font-size: 11px;
    font-weight: 600;
    color: #44403c;
  }

  .loader-spinner {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner-svg {
    animation: rotate-spinner 2s linear infinite;
    width: 100%;
    height: 100%;
  }

  .spinner-path {
    stroke: var(--color-primary);
    stroke-linecap: round;
    animation: dash-spinner 1.5s ease-in-out infinite;
  }

  .shimmer-effect {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer-swipe 1.8s infinite linear;
  }

  @keyframes slide-loader {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes status-pulse {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
  }

  @keyframes rotate-spinner {
    100% { transform: rotate(360deg); }
  }

  @keyframes dash-spinner {
    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
  }

  @keyframes overlay-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes shimmer-swipe {
    0% { background-position: -150% 0; }
    100% { background-position: 150% 0; }
  }
</style>
