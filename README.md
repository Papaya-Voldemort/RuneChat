# RunesGPT
> The future of ethical AI


## Stack
- Svelte 5
- TypeScript
- Bun
- Vite
- HCAI
- Vercel AI SDK
- 

## Development
- `bun install`
- `bun run dev`

The client calls `/api/chat` directly. In development, Vite proxies that route to the Bun server port you set with `SERVER_PORT` (or `PORT`), and in production the Bun server serves the built app from `dist`.

## Railway
- Build command: `bun run build`
- Start command: `bun run start`
- The server reads Railway's `PORT` automatically and binds to `0.0.0.0`
- Optional env vars: `MODEL` to choose the chat model, `HOST` to override the bind host, `SERVER_PORT` for local backend testing, and `VITE_PORT` or `CLIENT_PORT` for the local dev server