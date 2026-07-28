const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

/** Web builds use Vite's proxy; packaged desktop builds use the local sidecar. */
export function apiUrl(path: string): string {
  if (!path.startsWith("/")) throw new Error("API paths must start with '/'");
  if (configuredApiBase) return `${configuredApiBase}${path}`;

  const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  return isTauri ? `http://127.0.0.1:3000${path}` : path;
}
