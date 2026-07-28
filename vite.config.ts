import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: process.env.TAURI_DEV_HOST ? "0.0.0.0" : "127.0.0.1",
    hmr: process.env.TAURI_DEV_HOST ? false : undefined,
    port: Number(process.env.VITE_PORT ?? process.env.CLIENT_PORT ?? "5173"),
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${process.env.SERVER_PORT ?? process.env.PORT ?? "3000"}`,
        changeOrigin: true,
      },
    },
  },
});
