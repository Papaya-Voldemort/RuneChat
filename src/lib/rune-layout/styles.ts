export const runeLayoutStyles = String.raw`
:root {
  color-scheme: light;
  --r-crimson: #b91c3c;
  --r-crimson-dark: #881337;
  --r-crimson-soft: #fff1f2;
  --r-stone-950: #1c1917;
  --r-stone-700: #44403c;
  --r-stone-500: #78716c;
  --r-stone-300: #d6d3d1;
  --r-stone-200: #e7e5e4;
  --r-stone-100: #f5f5f4;
  --r-white: #fff;
  --r-success: #15803d;
  --r-warning: #a16207;
  --r-danger: #b91c1c;
  --r-radius: .75rem;
  --r-shadow: 0 1px 2px rgb(28 25 23 / .06), 0 8px 24px rgb(28 25 23 / .05);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: clamp(14px, 2.5vw, 16px);
  color: var(--r-stone-950);
  background: transparent;
}
* { box-sizing: border-box; min-width: 0; }
html, body { margin: 0; padding: 0; background: transparent; }
body { overflow-x: hidden; }
#rune-root { display: flow-root; width: 100%; max-width: 100%; padding: clamp(.75rem, 2vw, 1.25rem); overflow-x: auto; overflow-wrap: anywhere; }
h1,h2,h3,h4,p { margin-block: 0; }
h1,h2,h3,h4 { line-height: 1.18; text-wrap: balance; }
p { color: var(--r-stone-700); line-height: 1.55; }
a { color: var(--r-crimson-dark); }
:focus-visible { outline: 3px solid rgb(185 28 60 / .35); outline-offset: 2px; }
.r-stack,.r-col { display: flex; flex-direction: column; gap: var(--r-gap, 1rem); }
.r-cluster,.r-row,.r-flex { display: flex; flex-wrap: wrap; align-items: center; gap: var(--r-gap, .75rem); }
.r-grid,.r-grid-2,.r-grid-3,.r-metrics,.r-comparison,.r-matrix { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--r-min, 13rem)), 1fr)); gap: var(--r-gap, .85rem); }
.r-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--r-gap, 1rem); align-items: start; }
.r-gap-sm { --r-gap: .5rem; } .r-gap-md { --r-gap: 1rem; } .r-gap-lg { --r-gap: 1.5rem; }
.r-card,.r-panel,.r-glass { border: 1px solid var(--r-stone-200); border-radius: var(--r-radius); padding: clamp(.8rem, 3vw, 1.25rem); background: var(--r-white); box-shadow: var(--r-shadow); }
.r-glass { background: rgb(255 255 255 / .8); }
.r-title { font-size: clamp(1.05rem, 4vw, 1.4rem); font-weight: 750; }
.r-subtitle { color: var(--r-stone-500); font-size: .9rem; }
.r-metric { border-left: 3px solid var(--r-crimson); padding: .75rem; background: var(--r-stone-100); border-radius: .25rem var(--r-radius) var(--r-radius) .25rem; }
.r-metric-value { display: block; color: var(--r-crimson-dark); font-size: clamp(1.4rem, 7vw, 2rem); font-weight: 780; line-height: 1.1; }
.r-metric-label { color: var(--r-stone-500); font-size: .8rem; font-weight: 650; text-transform: uppercase; letter-spacing: .05em; }
.r-badge { display: inline-flex; align-items: center; width: fit-content; padding: .2rem .5rem; border-radius: 999px; background: var(--r-crimson-soft); color: var(--r-crimson-dark); font-size: .75rem; font-weight: 700; }
.r-badge.success,.r-badge-ok { background: #dcfce7; color: var(--r-success); }
.r-badge.warning,.r-badge-warn { background: #fef3c7; color: var(--r-warning); }
.r-badge.danger,.r-badge-err { background: #fee2e2; color: var(--r-danger); }
.r-callout,.r-alert { border-left: 4px solid var(--r-crimson); background: var(--r-crimson-soft); padding: .75rem 1rem; border-radius: .4rem; }
.r-callout.success,.r-alert-success,.r-alert-ok { border-color: var(--r-success); background: #f0fdf4; }
.r-callout.warning,.r-alert-warning,.r-alert-warn { border-color: var(--r-warning); background: #fffbeb; }
.r-callout.danger,.r-alert-danger,.r-alert-err { border-color: var(--r-danger); background: #fef2f2; }
.r-btn,button,.r-input,.r-select,input,select,textarea { font: inherit; }
.r-btn,button { min-height: 2.5rem; border: 1px solid var(--r-stone-300); border-radius: .55rem; padding: .5rem .8rem; color: var(--r-stone-950); background: var(--r-white); cursor: pointer; font-weight: 650; }
.r-btn:hover,button:hover { border-color: var(--r-crimson); }
.r-btn-prim { border-color: var(--r-crimson); color: white; background: var(--r-crimson); }
.r-btn-prim:hover { background: var(--r-crimson-dark); }
.r-btn-sec { color: var(--r-crimson-dark); border-color: var(--r-crimson); }
.r-input,.r-select,input:not([type="range"]),select,textarea { width: 100%; min-height: 2.5rem; border: 1px solid var(--r-stone-300); border-radius: .55rem; padding: .55rem .7rem; background: white; color: inherit; }
.r-slider,input[type="range"] { width: 100%; accent-color: var(--r-crimson); }
.r-table-wrap,[data-r-chart] { max-width: 100%; overflow: auto; overscroll-behavior-inline: contain; }
.r-table,table { width: 100%; min-width: 30rem; border-collapse: collapse; font-size: .86rem; }
th,td { padding: .65rem .7rem; border-bottom: 1px solid var(--r-stone-200); text-align: left; }
th { color: var(--r-stone-500); font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
.r-progress { width: 100%; height: .6rem; overflow: hidden; border-radius: 999px; background: var(--r-stone-200); }
.r-progress-bar { width: var(--value, 0%); height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--r-crimson), #e11d48); transition: width .25s ease; }
.r-gauge { --p: clamp(0, var(--value, 0), 100); display: grid; place-items: center; width: 7rem; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(var(--r-crimson) calc(var(--p) * 1%), var(--r-stone-200) 0); position: relative; font-weight: 750; }
.r-gauge::before { content: ""; position: absolute; inset: 14%; border-radius: inherit; background: white; }
.r-gauge > * { position: relative; }
.r-timeline,.r-steps,.r-tree ul { list-style: none; padding: 0; margin: 0; }
.r-timeline,.r-steps { display: grid; gap: .8rem; counter-reset: rune-step; }
.r-timeline > li,.r-steps > li { position: relative; padding: .75rem .75rem .75rem 2.7rem; border: 1px solid var(--r-stone-200); border-radius: .6rem; background: white; }
.r-timeline > li::before,.r-steps > li::before { counter-increment: rune-step; content: counter(rune-step); position: absolute; left: .7rem; top: .7rem; display: grid; place-items: center; width: 1.35rem; height: 1.35rem; border-radius: 50%; background: var(--r-crimson); color: white; font-size: .7rem; font-weight: 750; }
.r-flow { display: flex; flex-wrap: wrap; align-items: stretch; gap: .65rem; }
.r-flow > * { flex: 1 1 10rem; border: 1px solid var(--r-stone-200); border-radius: .6rem; padding: .7rem; background: white; }
.r-tree li { position: relative; margin: .35rem 0; padding: .45rem .65rem; border-left: 2px solid var(--r-crimson); background: var(--r-stone-100); border-radius: 0 .4rem .4rem 0; }
.r-tree ul { margin-left: 1rem; }
.r-legend { display: flex; flex-wrap: wrap; gap: .65rem; font-size: .8rem; color: var(--r-stone-700); }
.r-legend > *::before { content: ""; display: inline-block; width: .65rem; height: .65rem; border-radius: .15rem; margin-right: .35rem; background: var(--swatch, var(--r-crimson)); }
[data-r-chart] svg { display: block; width: 100%; min-width: 18rem; height: auto; }
.r-tabs { display: flex; flex-wrap: wrap; gap: .4rem; border-bottom: 1px solid var(--r-stone-200); padding-bottom: .5rem; }
[data-r-panel] { display: none; padding-block: .8rem; }
[data-r-panel].active { display: block; }
[data-r-tab].active { color: white; border-color: var(--r-crimson); background: var(--r-crimson); }
.r-modal { display: none; position: fixed; inset: 0; z-index: 20; place-items: center; padding: 1rem; background: rgb(28 25 23 / .45); }
.r-modal.open { display: grid; }
.r-modal-content { width: min(100%, 32rem); max-height: 80vh; overflow: auto; border-radius: var(--r-radius); padding: 1rem; background: white; box-shadow: var(--r-shadow); }
.r-toast { position: fixed; right: .75rem; bottom: .75rem; z-index: 30; max-width: min(22rem, calc(100% - 1.5rem)); padding: .7rem .9rem; border-radius: .55rem; color: white; background: var(--r-stone-950); box-shadow: var(--r-shadow); }
@media (max-width: 639px) {
  .r-split,.r-grid,.r-grid-2,.r-grid-3,.r-metrics,.r-comparison,.r-matrix { grid-template-columns: minmax(0, 1fr); }
  .r-card,.r-panel,.r-glass { padding: .8rem; }
}
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
`;
