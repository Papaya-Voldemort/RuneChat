<script lang="ts">
  import { onMount } from "svelte";

  export let code = "";

  // The CSS stylesheet loaded inside the iframe to provide premium prebuilt classes
  const prebuiltStyles = `
    :root {
      --color-primary: #a51c30;
      --color-bg: #ffffff;
      --color-bg-hover: #f5f5f4;
      --color-border: #d6d3d1;
      --color-border-muted: #e7e5e4;
      --font-family: 'Space Grotesk', sans-serif;
    }
    
    html, body {
      overflow: hidden;
      scrollbar-width: none;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none;
    }
    body {
      margin: 0;
      padding: 1rem;
      background: transparent;
      font-family: var(--font-family);
      color: #1c1917;
      box-sizing: border-box;
    }
    
    * { box-sizing: border-box; }

    /* Containers & Layouts */
    .rune-card {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      max-width: 100%;
    }
    .rune-flex { display: flex; }
    .rune-row { display: flex; flex-direction: row; align-items: center; }
    .rune-col { display: flex; flex-direction: column; }
    .rune-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rune-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    
    /* Gaps */
    .rune-gap-sm { gap: 6px; }
    .rune-gap-md { gap: 12px; }
    .rune-gap-lg { gap: 20px; }

    /* Typography */
    .rune-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0 0 0.5rem 0;
    }
    .rune-subtitle {
      font-size: 1rem;
      font-weight: 600;
      color: #44403c;
      margin: 0 0 0.5rem 0;
    }
    .rune-text {
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0 0 1rem 0;
      color: #57534e;
    }

    /* Interactive Inputs & Sliders */
    .rune-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background: var(--color-bg);
      font-size: 0.875rem;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s ease;
    }
    .rune-input:focus {
      border-color: var(--color-primary);
    }
    
    .rune-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background: var(--color-bg);
      font-size: 0.875rem;
      outline: none;
      font-family: inherit;
      cursor: pointer;
    }

    .rune-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--color-border-muted);
      outline: none;
      margin: 8px 0;
    }
    .rune-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
      border: none;
      transition: transform 0.1s ease;
    }
    .rune-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    /* Buttons */
    .rune-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background: var(--color-bg);
      color: #292524;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .rune-btn:hover {
      background: var(--color-bg-hover);
    }
    .rune-btn:active {
      transform: scale(0.97);
    }
    .rune-btn-primary {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }
    .rune-btn-primary:hover {
      opacity: 0.9;
    }
    .rune-btn-secondary {
      background: transparent;
      border-color: transparent;
      color: var(--color-primary);
    }
    .rune-btn-secondary:hover {
      background: rgba(165, 28, 48, 0.05);
    }

    /* Dynamic Tabs Component */
    .rune-tabs {
      display: flex;
      border-bottom: 2px solid var(--color-border-muted);
      margin-bottom: 1rem;
      gap: 4px;
    }
    .rune-tab-btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      background: transparent;
      border: none;
      color: #78716c;
      cursor: pointer;
      position: relative;
      transition: color 0.15s ease;
      font-family: inherit;
    }
    .rune-tab-btn:hover {
      color: var(--color-primary);
    }
    .rune-tab-btn.active {
      color: var(--color-primary);
    }
    .rune-tab-btn.active::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--color-primary);
      border-radius: 2px;
    }
    .rune-tab-content {
      display: none;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .rune-tab-content.active {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }

    /* Custom Dropdowns & Popups with micro-animations */
    .rune-dropdown {
      position: relative;
      display: inline-block;
    }
    .rune-dropdown-content {
      display: block;
      position: absolute;
      background-color: var(--color-bg);
      min-width: 160px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      z-index: 100;
      padding: 4px 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px) scale(0.95);
      transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s;
    }
    .rune-dropdown-content a {
      color: #292524;
      padding: 8px 12px;
      text-decoration: none;
      display: block;
      font-size: 0.875rem;
      transition: background-color 0.15s ease;
    }
    .rune-dropdown-content a:hover {
      background-color: var(--color-bg-hover);
    }
    .rune-dropdown:hover .rune-dropdown-content {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    /* Collapsible Accordions using HTML details summary */
    .rune-accordion {
      border: 1px solid var(--color-border-muted);
      border-radius: 6px;
      background: var(--color-bg);
      margin: 8px 0;
      overflow: hidden;
      transition: border-color 0.15s ease;
    }
    .rune-accordion:hover {
      border-color: var(--color-border);
    }
    .rune-accordion-summary {
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      user-select: none;
      background: var(--color-bg-hover);
      outline: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.15s ease;
    }
    .rune-accordion-summary:hover {
      background: #e7e5e4;
    }
    .rune-accordion-summary::-webkit-details-marker {
      display: none;
    }
    .rune-accordion-content {
      padding: 1rem;
      border-top: 1px solid var(--color-border-muted);
      font-size: 0.875rem;
      color: #57534e;
      animation: rune-fade-in 0.2s ease-out;
    }
    @keyframes rune-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Status Badges */
    .rune-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      background-color: #f5f5f4;
      color: #57534e;
      border: 1px solid var(--color-border-muted);
      line-height: 1;
    }
    .rune-badge-success {
      background-color: #d1fae5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .rune-badge-warning {
      background-color: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }
    .rune-badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    /* Data Tables */
    .rune-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 0.875rem;
      text-align: left;
    }
    .rune-table th {
      background-color: var(--color-bg-hover);
      color: #292524;
      font-weight: 600;
      padding: 10px 12px;
      border-bottom: 2px solid var(--color-border);
    }
    .rune-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--color-border-muted);
      color: #57534e;
    }
    .rune-table tr:hover {
      background-color: rgba(245, 245, 244, 0.5);
    }
  `;

  let iframeElement: HTMLIFrameElement;
  let iframeHeight = 280;

  function handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === "rune-resize") {
      iframeHeight = Math.max(150, event.data.height + 15);
    }
  }

  function updateIframeSrcdoc() {
    if (!iframeElement) return;

    // Standard HTML wrap, preloading the Space Grotesk Google Font and dynamic script context
    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>${prebuiltStyles}</style>
        </head>
        <body>
          <div id="rune-wrapper">${code}</div>
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
    iframeElement.srcdoc = docHtml;
  }

  $: if (code && iframeElement) {
    updateIframeSrcdoc();
  }

  onMount(() => {
    window.addEventListener("message", handleMessage);
    updateIframeSrcdoc();
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });
</script>

<div class="preview-container">
  <div class="preview-header">
    <span class="preview-tag">Rune Visual Layout</span>
  </div>
  <iframe
    bind:this={iframeElement}
    title="rune-layout-preview"
    sandbox="allow-scripts"
    class="preview-frame"
    style="height: {iframeHeight}px; overflow: hidden;"
    scrolling="no"
  ></iframe>
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
  }

  .preview-header {
    background: #f5f5f4;
    padding: 6px 12px;
    border-bottom: 1px solid var(--color-border-muted);
    display: flex;
    align-items: center;
  }

  .preview-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #78716c;
    letter-spacing: 0.5px;
  }

  .preview-frame {
    width: 100%;
    border: none;
    background: transparent;
    display: block;
    transition: height 0.15s ease-out;
    overflow: hidden;
  }
</style>
