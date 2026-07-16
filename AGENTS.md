# AGENTS.md

## Project overview

RuneChat is a Bun-powered AI chat application. The frontend is a Svelte 5 app
served by Vite; `server.ts` runs the Bun API and serves the production build.

## Commands

- `bun install` — install dependencies.
- `bun run dev` — start the Bun API server and Vite dev server together.
- `bun run build` — create the frontend production build in `dist/`.
- `bun run start` — run the production Bun server (build first).
- `bun run preview` — preview the Vite production build.

There is currently no dedicated test or lint script. Run `bun run build` after
frontend or server changes to catch type-checking and bundling errors.

## Repository layout

- `src/` — Svelte UI and client-side TypeScript.
- `src/lib/functions/` — API client and Markdown utilities.
- `src/lib/server/ai.ts` — model configuration and streaming chat logic.
- `src/lib/stores/` — browser-persisted application state and chat storage.
- `src/lib/rune-runtime.ts` and `src/RuneLayoutPreview.svelte` — rendering and
  runtime support for model-generated `rune-layout` previews.
- `src/icons/` and `src/images/` — SVG UI assets.
- `server.ts` — Bun HTTP server, `/api/chat`, `/api/summarize`, and static
  production asset handling.

## Development conventions

- Use TypeScript and Svelte 5 runes/patterns already present in the feature
  being changed; keep components focused and colocate their styles.
- Preserve the project’s existing semicolon usage and double-quoted imports in
  TypeScript. Do not reformat unrelated files.
- Keep browser-only persistence in stores and server-only model/provider code
  under `src/lib/server/`.
- Maintain streaming behavior end-to-end: API endpoints return text streams and
  client consumers should process incremental chunks.
- Treat model output as untrusted. Keep sanitization and sandboxing intact when
  modifying Markdown or `rune-layout` preview rendering.
- Do not expose, log, commit, or hard-code API keys. Keys are supplied by the
  client at request time and are used only for the proxied model request.

## Change safety

- Preserve existing user changes; the working tree may already contain work in
  progress.
- For API changes, update the request body handling in both the client and
  `server.ts`, and thread parameters through `streamChat` as needed.
- For new assets, prefer `src/icons/` for interface icons and verify the import
  path before removing older asset copies.
