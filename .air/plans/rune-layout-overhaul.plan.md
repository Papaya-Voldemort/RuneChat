# Goal

Replace RuneChat’s fence-based Rune layouts with an explicit, tool-driven artifact system that keeps normal chats lean, generates layouts reliably, supports safe custom JavaScript and styling, renders responsively, and presents a polished build/reveal experience consistent with the app.

# Approach

Use the installed AI SDK’s streamed tool-input events to make layouts a first-class structured artifact rather than Markdown hidden inside a `rune-layout` fence. A short explicit-only policy stays in the normal system prompt; the detailed component guide is returned only when the model calls `get_rune_layout_guide`, and prior layout source is returned only when it calls `read_rune_layout`. The browser receives typed NDJSON events, stores complete artifacts out of band from model history, and compiles each completed artifact once into an opaque-origin iframe with a strict, networkless CSP.

The runtime will favor concise semantic components for common visual explanations while retaining separate optional `css` and `script` fields as escape hatches. The preview will never execute partial JSON/code during streaming: streamed tool-input progress drives a staged skeleton animation, then the completed artifact is revealed after the iframe reports ready and measured height.

# File Changes

## Create

- **Create — `src/lib/rune-layout/types.ts`**: shared `RuneLayoutArtifact`, layout status, request catalog, and server-to-client stream event unions.
- **Create — `src/lib/rune-layout/artifacts.ts`**: artifact validation/normalization, compact history references, legacy fence payload conversion, source-size limits, and artifact catalog helpers.
- **Create — `src/lib/rune-layout/styles.ts`**: responsive theme tokens and concise semantic components for cards, stacks, clusters, adaptive grids, metrics, comparisons, timelines, steps, flows, trees, matrices, callouts, tables, progress/gauges, charts, tabs, and form controls.
- **Create — `src/lib/rune-layout/runtime.ts`**: safe `srcdoc` compiler, base64 source embedding, CSP, declarative binding/runtime helpers, component enhancement, lifecycle/error messages, and resize reporting.
- **Create — `src/lib/server/rune-layout-tools.ts`**: the on-demand layout guide and the `get_rune_layout_guide`, `read_rune_layout`, and `render_rune_layout` AI SDK tool definitions.
- **Create — `src/lib/functions/chat-stream.ts`**: streaming POST client, chunk-safe NDJSON decoder, and incremental message-part assembler.
- **Create — `src/lib/functions/chat-stream.test.ts`**: transport/assembly tests for fragmented JSON, Unicode boundaries, tool progress, text/layout ordering, errors, and completion.
- **Create — `src/lib/rune-layout/artifacts.test.ts`**: artifact validation, compact-history, limits, and legacy conversion tests.
- **Create — `src/lib/server/rune-layout-tools.test.ts`**: prompt/guide separation, explicit-only policy, artifact lookup, render schema, and tool-loop stop-condition tests.

## Modify

- **Modify — [ai.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/server/ai.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A5752%2C%22second%22%3A9323%7D%2C%22lines%22%3A%7B%22first%22%3A107%2C%22second%22%3A173%7D%7D&root=%252F)** (current prompt construction, lines 108–174): replace the 234-word always-on layout manual with a ≤60-word explicit-only policy; change `streamChat` from positional parameters to an options object; attach layout tools only when previews are enabled; continue after guide/read calls but stop immediately after a successful render call; transform `fullStream` events into typed NDJSON without exposing guide/read results to the UI; retry text-only only when a provider rejects tools before emitting output.
- **Modify — [server.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/server.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A607%2C%22second%22%3A2798%7D%2C%22lines%22%3A%7B%22first%22%3A19%2C%22second%22%3A112%7D%7D&root=%252F)** (request contract and chat route, lines 20–113): accept a bounded out-of-band artifact catalog, validate request fields, pass a named options object to `streamChat`, preserve streaming/CORS, and return the NDJSON content type.
- **Modify — [Input.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Input.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A2781%2C%22second%22%3A8122%7D%2C%22lines%22%3A%7B%22first%22%3A118%2C%22second%22%3A307%7D%7D&root=%252F)** (send/parse/history path, lines 119–308): replace whole-response reparsing and the fence regex with the typed stream client; append/update layout parts by tool-call ID; send compact layout references in model messages and full sources only in the out-of-band catalog; normalize interrupted builds; retain the user’s current add-button work below this range.
- **Modify — [Chat.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Chat.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A4554%2C%22second%22%3A5448%7D%2C%22lines%22%3A%7B%22first%22%3A142%2C%22second%22%3A162%7D%7D&root=%252F)** (layout rendering, lines 143–163): pass the structured artifact, build progress, ready/error state, and retry key to the preview; keep disabled layouts readable as source. Update the 900px chat shell at [Chat.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Chat.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A6721%2C%22second%22%3A6913%7D%2C%22lines%22%3A%7B%22first%22%3A219%2C%22second%22%3A229%7D%7D&root=%252F) and the layout wrapper at [Chat.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Chat.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A13439%2C%22second%22%3A13582%7D%2C%22lines%22%3A%7B%22first%22%3A577%2C%22second%22%3A583%7D%7D&root=%252F) so previews use all available message width and never overflow the page at mobile sizes.
- **Modify — [RuneLayoutPreview.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/RuneLayoutPreview.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A870%2C%22second%22%3A4895%7D%2C%22lines%22%3A%7B%22first%22%3A27%2C%22second%22%3A164%7D%7D&root=%252F)** (compiler, throttled rebuild, and iframe, lines 28–165): accept structured props, compile only on completed artifacts, validate source/channel/finite resize messages, clamp pathological heights, support ready/error/reload states, and preserve `sandbox="allow-scripts"` without same-origin. Replace the current blur/spinner overlay at [RuneLayoutPreview.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/RuneLayoutPreview.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A4905%2C%22second%22%3A9057%7D%2C%22lines%22%3A%7B%22first%22%3A167%2C%22second%22%3A354%7D%7D&root=%252F) with a RuneChat-styled staged skeleton, progress rail, content reveal, error panel, and reduced-motion behavior.
- **Modify — [chat.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/stores/chat.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A365%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A11%7D%7D&root=%252F)** (message-part union, lines 1–12): type ready/building/error artifacts, preserve legacy `text` layout parts, and normalize persisted in-progress parts after hydration so a reload cannot leave a permanent building state.
- **Modify — [chat-db.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/stores/chat-db.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A315%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A14%7D%7D&root=%252F)** (generic persisted part shape, lines 1–15): make textual payload optional so structured artifacts remain type-safe while existing IndexedDB records continue to load without a schema-version migration.
- **Modify — [SettingsMenu.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/SettingsMenu.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A5108%2C%22second%22%3A5735%7D%2C%22lines%22%3A%7B%22first%22%3A147%2C%22second%22%3A166%7D%7D&root=%252F)** (layout toggle, lines 148–167): clarify that layouts are interactive, explicitly requested artifacts and that disabling the toggle removes layout tools entirely.
- **Modify — [package.json](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/package.json?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A692%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A27%7D%7D&root=%252F)** (scripts/dependencies, lines 1–28): add a `bun test` script; use the AI SDK’s existing `tool`, `jsonSchema`, `hasToolCall`, and `stepCountIs` exports, so no new runtime dependency is required.

## Delete

- **Delete — [client-ai.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/functions/client-ai.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A1451%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A68%7D%7D&root=%252F)** (unused duplicate text-stream client, lines 1–69): superseded by the typed NDJSON transport so the old request shape cannot drift.
- **Delete — [rune-runtime.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/rune-runtime.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A13077%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A494%7D%7D&root=%252F)**: replace the monolithic CSS/runtime export—including fixed grids and forced bottom spacing—with the separated styles/runtime modules. The current proxy/resize logic at [rune-runtime.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/rune-runtime.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A13079%2C%22second%22%3A17742%7D%2C%22lines%22%3A%7B%22first%22%3A496%2C%22second%22%3A618%7D%7D&root=%252F) and fixed-size chart builders at [rune-runtime.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/rune-runtime.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A20263%2C%22second%22%3A32178%7D%2C%22lines%22%3A%7B%22first%22%3A680%2C%22second%22%3A894%7D%7D&root=%252F) will be reimplemented behind the new concise component contract.

# Implementation Steps

## Task 1: Define the artifact and stream contracts

1. In `src/lib/rune-layout/types.ts`, define a versioned artifact with `id`, `title`, a ≤160-character `summary`, `markup`, optional `css`, optional `script`, and `version: 1`. Define building/ready/error layout parts and NDJSON events for text, reasoning, layout start/progress/complete/error, warning, and done.
2. In `src/lib/rune-layout/artifacts.ts`, validate types and limits (maximum 20 artifacts/request; 50 KiB markup, 30 KiB CSS, 30 KiB script per artifact), reject document wrappers in structured fields, generate compact history markers, and expose a catalog keyed by ID.
3. Add legacy conversion that extracts title, `<style>`, and `<script>` content from old layout text and treats the remainder as markup. Do not rewrite IndexedDB in place; normalize on read so old chats remain reversible.
4. Update [chat.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/stores/chat.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A365%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A11%7D%7D&root=%252F) and [chat-db.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/stores/chat-db.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A315%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A14%7D%7D&root=%252F) to store the union while retaining legacy compatibility.

## Task 2: Replace the prompt manual and Markdown fence with AI tools

1. In `src/lib/server/rune-layout-tools.ts`, keep the full authoring guide server-side. The guide will require responsive built-ins first, separate custom CSS/JS only when needed, accessible labels, no fixed canvas widths, no external resources, and no document/style/script wrapper tags.
2. Define `get_rune_layout_guide` with a narrow “call only after an explicit request for a visual/interactive artifact” description. Its tool result contains the detailed guide only on layout turns.
3. Define `read_rune_layout({ id })` over the request-scoped catalog. Return structured source for exactly one existing artifact so ordinary follow-ups never pay for prior source tokens.
4. Define `render_rune_layout({ title, summary, markup, css?, script?, sourceId? })` with strict JSON Schema fields. Normalize the artifact server-side, return only a short acknowledgment to the model, and use the parsed tool call—not model text—as the client artifact.
5. In [ai.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/server/ai.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A5752%2C%22second%22%3A9323%7D%2C%22lines%22%3A%7B%22first%22%3A107%2C%22second%22%3A173%7D%7D&root=%252F), retain only a ≤60-word explicit-first policy in the base prompt. Configure the tool loop to continue after guide/read calls, stop on `render_rune_layout`, and cap the loop at four steps.
6. Consume `result.fullStream`: forward text/reasoning deltas; translate render tool-input start/deltas into build progress; emit the validated artifact on the render tool call; hide guide/read contents; terminate with done/error. If tools are unsupported and no output has been emitted, retry once without tools and send a nonfatal warning event.
7. In [server.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/server.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A607%2C%22second%22%3A2798%7D%2C%22lines%22%3A%7B%22first%22%3A19%2C%22second%22%3A112%7D%7D&root=%252F), validate the new request body and preserve the stream as `application/x-ndjson; charset=utf-8`.

## Task 3: Make the client stream deterministic and history token-efficient

1. In `src/lib/functions/chat-stream.ts`, implement an incremental TextDecoder/line buffer that tolerates arbitrary HTTP chunk boundaries and only parses complete JSON lines.
2. Build a reducer that appends contiguous text/reasoning deltas, inserts one building layout part at `layout-start`, updates progress without reparsing previous content, resolves it at `layout-complete`, and turns interrupted/error streams into an actionable error part.
3. Replace [Input.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Input.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A2781%2C%22second%22%3A8122%7D%2C%22lines%22%3A%7B%22first%22%3A118%2C%22second%22%3A307%7D%7D&root=%252F)’s full-buffer `parseContent` and fence regex with that reducer.
4. Build provider messages from text plus compact artifact markers only. Send full source in the separate artifact catalog, and make `read_rune_layout` the only path that inserts it into model context.
5. Preserve native reasoning events and incrementally recognize existing textual `<thinking>` markers so the persona system remains compatible even when tags split across network chunks.
6. Remove [client-ai.ts](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/lib/functions/client-ai.ts?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A1451%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A68%7D%7D&root=%252F) after its request responsibilities move to the new client.

## Task 4: Build a concise, flexible, responsive Rune component system

1. In `src/lib/rune-layout/styles.ts`, define RuneChat-aligned crimson/stone tokens, restrained elevation, fluid type/space, strong focus states, and compact semantic elements. Preserve legacy `.r-*` aliases only where needed for stored layouts.
2. Implement adaptive layout primitives (`r-stack`, `r-cluster`, `r-grid`, `r-split`) whose grids collapse below 640px and whose children use `min-width: 0`; tables/charts get bounded overflow rather than widening the page.
3. Add visual-explanation primitives: metrics, bar/line/donut charts, progress/gauges, timelines, ordered steps, comparisons, flows, trees/hierarchies, matrices, callouts, legends, and data tables. Favor attribute-driven concise markup so common artifacts need little or no custom CSS/JS.
4. In `src/lib/rune-layout/runtime.ts`, retain/modernize concise bindings (`r-model`, `r-text`, `r-show`) and expose a small `window.Rune` API for tabs, modal/toast, chart updates, state, and resize; keep `window.rune` as a legacy alias.
5. Render chart/component data with DOM APIs and responsive SVG `viewBox` geometry, not fixed pixel canvases or string-concatenated unsanitized HTML.

## Task 5: Harden custom CSS/JavaScript and fix sizing

1. Compile markup, CSS, and JS as base64 data so literal closing tags cannot break `srcdoc). Bootstrap markup via a dedicated wrapper, attach CSS through `textContent`, and load custom JS from a blob URL; never interpolate raw model source into host script/style tags.
2. Add a `srcdoc` CSP with `default-src 'none'`, inline bootstrap/style plus `blob:` script only, `connect-src 'none'`, `img-src data: blob:`, `media-src data: blob:`, and no object/frame/base/form destinations. Remove external Google Fonts.
3. Keep iframe sandbox permissions to `allow-scripts` only. Do not inject API keys, cookies, host storage, or a same-origin capability.
4. Replace wrapper padding and the 150px minimum responsible for whitespace. Make the root a margin-containing flow root, observe root/body size, report after animation frames and mutations, and include a per-preview channel ID.
5. In [RuneLayoutPreview.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/RuneLayoutPreview.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A870%2C%22second%22%3A4895%7D%2C%22lines%22%3A%7B%22first%22%3A27%2C%22second%22%3A164%7D%7D&root=%252F), accept resize/ready/error messages only from the active iframe/channel, reject non-finite values, clamp reported content height to 96–1200px, and allow internal scrolling above the cap.
6. Compile/run the iframe once after artifact completion. Reload only on explicit retry or a genuinely new artifact version, eliminating the current 90ms teardown loop and preserving interaction state.

## Task 6: Replace the build animation and integrate the polished shell

1. At render tool-input start, add the preview shell immediately with an animated composition skeleton; use byte-progress deltas to advance a determinate-looking rail without exposing or parsing incomplete JSON.
2. Cycle concise phases (“Structuring”, “Styling”, “Wiring interactions”) inside the shell, animate skeleton modules with the app’s crimson accent, and crossfade/reveal the ready iframe only after its ready/height handshake.
3. Add a compact title, status badge, and reload action; show a contained error state when compilation/runtime fails instead of leaving an empty frame.
4. In [Chat.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Chat.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A4554%2C%22second%22%3A5448%7D%2C%22lines%22%3A%7B%22first%22%3A142%2C%22second%22%3A162%7D%7D&root=%252F), keep text-layout-text ordering and make the artifact shell 100% of available assistant-message width on desktop and mobile.
5. Add `prefers-reduced-motion` handling that removes shimmer/translation and uses an immediate opacity reveal; maintain visible focus rings and accessible live status text.
6. Clarify the explicit-only behavior beside the existing toggle in [SettingsMenu.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/SettingsMenu.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A5108%2C%22second%22%3A5735%7D%2C%22lines%22%3A%7B%22first%22%3A147%2C%22second%22%3A166%7D%7D&root=%252F).

## Task 7: Add regression coverage and verify the full path

1. Add the three Bun test files and the test script in [package.json](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/package.json?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A0%2C%22second%22%3A692%7D%2C%22lines%22%3A%7B%22first%22%3A0%2C%22second%22%3A27%7D%7D&root=%252F).
2. Add golden protocol cases for ordinary fenced code, a literal `rune-layout` string, fragmented thinking tags, render-tool arguments containing backticks and closing script/style strings, multiple layouts, text after a layout, and interrupted streams.
3. Add prompt tests proving the full guide/source is absent from ordinary provider input and appears only after the corresponding tool call.
4. Run unit tests, production build, and manual viewport/security/model smoke checks listed below.

# Acceptance Criteria

1. With layouts enabled, the layout-specific addition to the base system prompt is at most 60 whitespace-delimited words, and the full component guide is absent until `get_rune_layout_guide` executes.
2. A follow-up to a chat containing layouts sends only each artifact’s ID/title/≤160-character summary to the model; markup/CSS/JS enters provider context only when `read_rune_layout(id)` is called.
3. In a 10-prompt smoke set of ordinary questions/code requests on the default model, zero responses invoke `render_rune_layout`; in explicit dashboard/diagram/interactive-tool prompts, a render call produces a preview.
4. Standard Markdown fences—including fences whose contents contain the text `rune-layout`, backticks, `</script>`, or `</style>`—remain ordinary code and cannot open/close a preview.
5. NDJSON decoding preserves every Unicode character and exact text/reasoning/layout ordering when each test payload is split at every possible byte boundary.
6. The iframe is not created or reloaded during tool-input deltas; it is compiled exactly once per completed artifact version, so entered form state survives unrelated Svelte updates.
7. A ready layout’s iframe height matches reported content to within 4px for content between 96px and 1200px; content taller than 1200px scrolls inside the frame, and an empty/minimal layout does not retain the old 150px floor or forced 2.5rem wrapper padding.
8. At viewport widths 320px, 768px, and 1440px, the preview stays within the chat column with no page-level horizontal overflow; built-in multi-column layouts collapse below 640px, and tables/charts remain usable via bounded internal overflow.
9. Custom CSS and JavaScript work from their separate fields, including DOM updates and Rune state/helpers. Attempts to use `fetch`, XHR, WebSocket, external images/fonts, forms, frames, top navigation, host DOM, cookies, or host storage are blocked by CSP/sandbox.
10. The iframe sandbox contains `allow-scripts` and does not contain `allow-same-origin`; no API key or host storage value appears in generated `srcdoc`.
11. Render build states show a staged skeleton/progress treatment, reveal content only after the ready handshake, expose a retryable error state, and disable nonessential motion under `prefers-reduced-motion: reduce`.
12. Existing persisted `{ type: "layout", text: ... }` messages still render; a stored building part restored after reload becomes an error/retry state rather than animating forever.
13. Disabling Visual Layout Previews removes all layout tools and renders stored artifacts as readable source; ordinary text streaming still works.
14. A tool-incompatible model that fails before output falls back once to text-only streaming and emits a visible nonfatal warning rather than failing the whole chat.
15. `bun test` and `bun run build` exit with status 0.

# Verification Steps

1. Run `bun test`.
2. Run `bun run build`.
3. Start `bun run dev`; verify an ordinary explanation and ordinary HTML/JavaScript code request stream as Markdown with no layout shell.
4. Ask explicitly for: a KPI dashboard, a comparison matrix, a timeline, a flow/tree diagram, and an interactive calculator. Confirm each uses the appropriate concise built-ins, completes once, and remains interactive.
5. Ask to revise one prior artifact. Inspect the request/tool trace to confirm only the compact reference is initially present and `read_rune_layout` retrieves only the requested ID before the new render call.
6. During one long layout generation, confirm the skeleton updates while iframe `srcdoc` remains unset; after completion, enter input, trigger controls, and verify later chat streaming does not reset it.
7. In browser responsive mode at 320×568, 768×1024, and 1440×900, exercise grids, charts, tables, modals, and long content; check page overflow, height, internal scrolling, and touch target/focus behavior.
8. From a custom script, attempt `fetch`, XHR, WebSocket, external image/font loads, form submit, `window.top` navigation, `parent.document`, `localStorage`, and `document.cookie`; confirm failures and no host/network side effects.
9. Enable reduced motion at OS/browser level and confirm the skeleton/reveal no longer shimmer, bounce, or translate.
10. Open a pre-upgrade IndexedDB chat containing a legacy layout and confirm it renders with title/style/script preserved; reload during a new build and confirm it restores as retryable.
11. Disable layouts and repeat ordinary chat plus viewing a stored artifact as source.
12. Select one tool-incompatible custom model (if available through HCAI) and confirm the pre-output text fallback/warning path.

# Risks & Mitigations

- **Arbitrary JavaScript can still consume CPU.** Opaque origin and CSP stop data/network escape but cannot preempt an infinite loop in an iframe sharing the renderer process. Keep source-size limits, compile only once, expose reload/error recovery, and document this residual risk; do not present the sandbox as a CPU-isolation boundary.
- **Tool behavior varies by model/provider.** Strict schemas, a four-step cap, explicit stop-on-render, validation, and the pre-output text-only fallback keep ordinary chat functional; smoke-test the default plus one Anthropic and one open-weight model.
- **Tool-loop source can become token-heavy on edits.** Full guide/source are request-scoped tool results only, render stops immediately, summaries are capped, and `read_rune_layout` retrieves one artifact by ID.
- **Legacy source may be malformed.** Keep conversion best-effort and non-destructive; if extraction fails, store the original as markup/source and show a retryable preview error rather than dropping content.
- **The user has uncommitted work in [Input.svelte](air-file://16k1548dd74eqktio89v/Users/elinelson/Documents/Development/RuneChat/src/Input.svelte?type=file&linesData=%7B%22range%22%3A%7B%22first%22%3A2781%2C%22second%22%3A8122%7D%2C%22lines%22%3A%7B%22first%22%3A118%2C%22second%22%3A307%7D%7D&root=%252F) and asset files.** Limit Input changes to the script/send pipeline, preserve the add-button markup/styles and asset migration, and review the final diff against the current working tree before building.
