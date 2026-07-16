import type { RuneLayoutArtifact } from "./types";
import { runeLayoutStyles } from "./styles";

function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

const RUNE_BOOTSTRAP = String.raw`
(() => {
  "use strict";
  const config = JSON.parse(document.getElementById("rune-config").textContent || "{}");
  const decode = (value) => new TextDecoder().decode(Uint8Array.from(atob(value || ""), c => c.charCodeAt(0)));
  const root = document.getElementById("rune-root");
  const style = document.createElement("style");
  style.textContent = decode(config.baseCss) + "\n" + decode(config.css);
  document.head.append(style);
  root.innerHTML = decode(config.markup);
  const stateTarget = Object.create(null);
  const renderBindings = (key) => {
    root.querySelectorAll("[r-text]").forEach(el => { if (el.getAttribute("r-text") === key) el.textContent = String(stateTarget[key] ?? ""); });
    root.querySelectorAll("[r-show]").forEach(el => { if (el.getAttribute("r-show") === key) el.hidden = !stateTarget[key]; });
    root.querySelectorAll("[r-hide]").forEach(el => { if (el.getAttribute("r-hide") === key) el.hidden = Boolean(stateTarget[key]); });
    root.querySelectorAll("[r-model]").forEach(el => {
      if (el.getAttribute("r-model") !== key || document.activeElement === el) return;
      if (el.type === "checkbox") el.checked = Boolean(stateTarget[key]);
      else el.value = stateTarget[key] ?? "";
    });
  };
  const state = new Proxy(stateTarget, { set(target, key, value) { target[key] = value; renderBindings(String(key)); scheduleResize(); return true; } });
  const colors = ["#b91c3c", "#e11d48", "#fb7185", "#881337", "#78716c", "#a8a29e"];
  const svgNode = (name, attributes = {}) => { const node = document.createElementNS("http://www.w3.org/2000/svg", name); Object.entries(attributes).forEach(([k,v]) => node.setAttribute(k, String(v))); return node; };
  const drawChart = (container, type, values, labels) => {
    const safe = values.map(Number).filter(Number.isFinite);
    if (!safe.length) return;
    container.replaceChildren();
    const svg = svgNode("svg", { viewBox: "0 0 640 260", role: "img", "aria-label": container.getAttribute("aria-label") || (type + " chart") });
    const max = Math.max(...safe, 1);
    if (type === "donut") {
      const total = safe.reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
      let offset = 0;
      safe.forEach((value, index) => { const length = Math.max(0, value) / total * 100; const circle = svgNode("circle", { cx: 320, cy: 125, r: 82, fill: "none", stroke: colors[index % colors.length], "stroke-width": 34, "stroke-dasharray": String(length) + " " + String(100 - length), "stroke-dashoffset": -offset, pathLength: 100, transform: "rotate(-90 320 125)" }); svg.append(circle); offset += length; });
    } else if (type === "line") {
      const points = safe.map((value, index) => String(30 + index * (580 / Math.max(1, safe.length - 1))) + "," + String(225 - value / max * 185)).join(" ");
      svg.append(svgNode("polyline", { points, fill: "none", stroke: colors[0], "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      safe.forEach((value, index) => svg.append(svgNode("circle", { cx: 30 + index * (580 / Math.max(1, safe.length - 1)), cy: 225 - value / max * 185, r: 6, fill: colors[0] })));
    } else {
      const width = 560 / safe.length;
      safe.forEach((value, index) => svg.append(svgNode("rect", { x: 40 + index * width, y: 225 - value / max * 185, width: Math.max(4, width - 12), height: value / max * 185, rx: 4, fill: colors[index % colors.length] })));
    }
    labels.slice(0, safe.length).forEach((label, index) => { const text = svgNode("text", { x: type === "donut" ? 320 : 40 + index * (560 / safe.length) + (560 / safe.length) / 2, y: type === "donut" ? 250 : 248, "text-anchor": "middle", fill: "#57534e", "font-size": 13 }); text.textContent = label; svg.append(text); });
    container.append(svg);
  };
  const enhanceCharts = () => root.querySelectorAll("[data-r-chart]").forEach(el => drawChart(el, el.dataset.rChart || "bar", (el.dataset.values || "").split(","), (el.dataset.labels || "").split(",")));
  let resizeQueued = false;
  function reportResize() {
    resizeQueued = false;
    const height = Math.ceil(Math.max(root.getBoundingClientRect().height, document.documentElement.scrollHeight, document.body.scrollHeight));
    parent.postMessage({ type: "rune-resize", channel: config.channel, height }, "*");
  }
  function scheduleResize() { if (resizeQueued) return; resizeQueued = true; requestAnimationFrame(() => requestAnimationFrame(reportResize)); }
  const Rune = {
    state,
    set(key, value) { state[key] = value; },
    init() {
      root.querySelectorAll("[r-model]").forEach(el => { const key = el.getAttribute("r-model"); if (!(key in stateTarget)) stateTarget[key] = el.type === "checkbox" ? el.checked : el.value; el.addEventListener("input", () => { state[key] = el.type === "checkbox" ? el.checked : el.value; }); renderBindings(key); });
      root.querySelectorAll("[data-r-tab]").forEach(button => button.addEventListener("click", event => Rune.showTab(event, button.dataset.rTab)));
      enhanceCharts(); scheduleResize();
    },
    showToast(message, kind = "info") { const toast = document.createElement("div"); toast.className = "r-toast " + kind; toast.setAttribute("role", "status"); toast.textContent = String(message); document.body.append(toast); setTimeout(() => toast.remove(), 3000); scheduleResize(); },
    showModal(id) { document.getElementById(id)?.classList.add("open"); scheduleResize(); },
    closeModal(id) { document.getElementById(id)?.classList.remove("open"); scheduleResize(); },
    showTab(event, id) { const button = event?.currentTarget; const scope = button?.closest(".r-card,.r-panel,#rune-root") || root; scope.querySelectorAll("[data-r-tab]").forEach(el => el.classList.toggle("active", el === button)); scope.querySelectorAll("[data-r-panel]").forEach(el => el.classList.toggle("active", el.dataset.rPanel === id)); scheduleResize(); },
    setProgress(id, percent) { const el = document.getElementById(id); if (el) el.style.setProperty("--value", String(Math.max(0, Math.min(100, Number(percent)))) + "%"); },
    updateChart(id, values, labels = []) { const el = document.getElementById(id); if (el) drawChart(el, el.dataset.rChart || "bar", values, labels); scheduleResize(); },
    createLineChart(id, values, labels = []) { const el = document.getElementById(id); if (el) drawChart(el, "line", values, labels); },
    createBarChart(id, values, labels = []) { const el = document.getElementById(id); if (el) drawChart(el, "bar", values, labels); },
    createDonutChart(id, values, labels = []) { const el = document.getElementById(id); if (el) drawChart(el, "donut", values, labels); },
    resize: scheduleResize,
  };
  window.Rune = Rune;
  window.rune = Rune;
  addEventListener("error", event => parent.postMessage({ type: "rune-error", channel: config.channel, message: event.message || "Layout runtime error" }, "*"));
  addEventListener("unhandledrejection", event => parent.postMessage({ type: "rune-error", channel: config.channel, message: String(event.reason || "Layout promise rejected") }, "*"));
  new ResizeObserver(scheduleResize).observe(root);
  new MutationObserver(scheduleResize).observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
  Rune.init();
  const custom = decode(config.script);
  const signalReady = () => { parent.postMessage({ type: "rune-ready", channel: config.channel }, "*"); scheduleResize(); };
  if (custom) { const blob = new Blob([custom], { type: "text/javascript" }); const url = URL.createObjectURL(blob); const script = document.createElement("script"); script.src = url; script.onload = () => { URL.revokeObjectURL(url); signalReady(); }; script.onerror = () => parent.postMessage({ type: "rune-error", channel: config.channel, message: "Custom script failed to load" }, "*"); document.body.append(script); } else { signalReady(); }
  scheduleResize();
})();
`;

export function compileRuneLayoutSrcdoc(artifact: RuneLayoutArtifact, channel: string): string {
  const config = JSON.stringify({
    channel,
    baseCss: toBase64(runeLayoutStyles),
    markup: toBase64(artifact.markup),
    css: toBase64(artifact.css ?? ""),
    script: toBase64(artifact.script ?? ""),
  }).replace(/</g, "\\u003c");

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; connect-src 'none'; img-src data: blob:; media-src data: blob:; object-src 'none'; frame-src 'none'; child-src 'none'; base-uri 'none'; form-action 'none'; font-src 'none'"><title>${escapeHtml(artifact.title)}</title></head><body><div id="rune-root"></div><script type="application/json" id="rune-config">${config}</script><script>${RUNE_BOOTSTRAP}<\/script></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}
