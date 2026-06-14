import path from "node:path";
import { fileURLToPath } from "node:url";
import { streamChat } from "./src/lib/server/ai";

const port = Number(
  Bun.env.PORT ??
    Bun.env.SERVER_PORT ??
    process.env.PORT ??
    process.env.SERVER_PORT ??
    "3000",
);
const host = Bun.env.HOST ?? process.env.HOST ?? "0.0.0.0";
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistDir = path.join(rootDir, "dist");
const clientIndexPath = path.join(clientDistDir, "index.html");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface ChatRequestBody {
  messages?: any[];
  apiKey?: string;
  model?: string;
  persona?: string;
  customPrompt?: string;
  maxTokens?: number;
  userProfileName?: string;
  userProfileAbout?: string;
  enableLayoutPreviews?: boolean;
}

async function serveClient(pathname: string): Promise<Response> {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const resolvedPath = path.resolve(clientDistDir, `.${normalizedPath}`);

  if (!resolvedPath.startsWith(clientDistDir)) {
    return new Response("Not found", { status: 404 });
  }

  const file = Bun.file(resolvedPath);
  if (await file.exists()) {
    return new Response(file);
  }

  if (path.extname(pathname)) {
    return new Response("Not found", { status: 404 });
  }

  const indexFile = Bun.file(clientIndexPath);
  if (await indexFile.exists()) {
    return new Response(indexFile);
  }

  return new Response("Client build not found. Run bun run build first.", {
    status: 500,
  });
}

Bun.serve({
  port,
  hostname: host,
  idleTimeout: 255,

  async fetch(req: Request) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const {
          messages,
          apiKey,
          model,
          persona,
          customPrompt,
          maxTokens,
          userProfileName,
          userProfileAbout,
          enableLayoutPreviews,
        } = (await req.json()) as ChatRequestBody;

        if (!apiKey) {
          return Response.json(
            { error: "API key is required" },
            {
              status: 400,
              headers: corsHeaders,
            },
          );
        }

        const response = await streamChat(
          messages ?? [],
          apiKey,
          model,
          persona,
          customPrompt,
          maxTokens,
          userProfileName,
          userProfileAbout,
          enableLayoutPreviews,
        );

        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) =>
          headers.set(key, value),
        );

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown server error";

        return Response.json(
          { error: message },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    if (url.pathname === "/api/summarize" && req.method === "POST") {
      try {
        const { text, apiKey } = await req.json();

        if (!apiKey) {
          return Response.json(
            { error: "API key is required" },
            { status: 400, headers: corsHeaders },
          );
        }

        const response = await fetch(
          "https://ai.hackclub.com/proxy/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3.1-flash-lite",
              messages: [
                {
                  role: "system",
                  content:
                    "Generate a short, concise, 2-to-4 word title for a conversation that starts with the user's message. Output ONLY the raw title. Do not wrap it in quotes, markdown, or punctuation.",
                },
                {
                  role: "user",
                  content: text,
                },
              ],
            }),
          },
        );

        const data = await response.json();
        const title = data.choices?.[0]?.message?.content?.trim() || "New Chat";

        return Response.json({ title }, { headers: corsHeaders });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return Response.json(
          { error: message },
          { status: 500, headers: corsHeaders },
        );
      }
    }

    if (req.method === "GET" || req.method === "HEAD") {
      return serveClient(url.pathname);
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    });
  },
});
