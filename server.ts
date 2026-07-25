import path from "node:path";
import { fileURLToPath } from "node:url";
import { streamChat } from "./src/lib/server/ai";
import { validateArtifactCatalog } from "./src/lib/rune-layout/artifacts";
import type { RuneLayoutCatalog } from "./src/lib/rune-layout/types";

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
  messages?: ChatRequestMessage[];
  apiKey?: string;
  model?: string;
  persona?: string;
  customPrompt?: string;
  maxTokens?: number;
  userProfileName?: string;
  userProfileAbout?: string;
  enableLayoutPreviews?: boolean;
  artifacts?: RuneLayoutCatalog;
}

type ChatImagePart = { type: "image_url"; image_url: { url: string } };
type ChatTextPart = { type: "text"; text: string };
type ChatRequestMessage = { role: "user" | "assistant"; content: string | Array<ChatTextPart | ChatImagePart> };

interface StoredImage {
  file: File;
  expiresAt: number;
  size: number;
}

const MAX_TEXT_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_ATTACHMENT_BYTES = 50 * 1024 * 1024;
const MAX_ATTACHMENT_TEXT_LENGTH = 500_000;
const MAX_IMAGES_PER_MESSAGE = 4;
const IMAGE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_STORED_IMAGE_BYTES = 500 * 1024 * 1024;
const storedImages = new Map<string, StoredImage>();
const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const allowedAttachmentExtensions = new Set([
  ".txt", ".md", ".csv", ".json", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".xml", ".yaml", ".yml", ".py", ".java", ".c", ".cpp", ".h", ".sql", ".sh", ".log",
]);

function cleanExpiredImages(): void {
  const now = Date.now();
  for (const [id, image] of storedImages) {
    if (image.expiresAt <= now) storedImages.delete(id);
  }
}

function storedImageBytes(): number {
  return [...storedImages.values()].reduce((total, image) => total + image.size, 0);
}

function publicBaseUrl(req: Request): string {
  const configuredUrl = Bun.env.PUBLIC_BASE_URL ?? process.env.PUBLIC_BASE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedProto === "https" && forwardedHost) return `https://${forwardedHost}`;
  return new URL(req.url).origin;
}

function validateMessageContent(content: unknown): string | Array<ChatTextPart | ChatImagePart> {
  if (typeof content === "string") {
    if (content.length > 500_000) throw new Error("Each message must have bounded text content");
    return content;
  }
  if (!Array.isArray(content) || !content.length || content.length > 20) {
    throw new Error("Each message must have valid content");
  }

  let imageCount = 0;
  return content.map((part) => {
    if (!part || typeof part !== "object" || Array.isArray(part)) throw new Error("Each message content part is invalid");
    const record = part as Record<string, unknown>;
    if (record.type === "text" && typeof record.text === "string" && record.text.length <= 500_000) {
      return { type: "text", text: record.text };
    }
    const url = record.type === "image_url" && record.image_url && typeof record.image_url === "object"
      ? (record.image_url as Record<string, unknown>).url
      : undefined;
    if (typeof url === "string" && url.length <= 2_048 && /^https:\/\//i.test(url)) {
      imageCount += 1;
      if (imageCount > MAX_IMAGES_PER_MESSAGE) throw new Error(`Each message can include at most ${MAX_IMAGES_PER_MESSAGE} images`);
      return { type: "image_url", image_url: { url } };
    }
    throw new Error("Each message content part must be text or an HTTPS image URL");
  });
}

function validateChatBody(value: unknown): Required<Pick<ChatRequestBody, "messages" | "apiKey">> & ChatRequestBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Request body must be an object");
  }
  const body = value as ChatRequestBody;
  if (typeof body.apiKey !== "string" || !body.apiKey.trim()) throw new Error("API key is required");
  if (body.apiKey.length > 4096) throw new Error("API key is too long");
  if (body.messages !== undefined && (!Array.isArray(body.messages) || body.messages.length > 200)) {
    throw new Error("Messages must be an array with at most 200 entries");
  }
  const messages = (body.messages ?? []).map((message): ChatRequestMessage => {
    if (!message || typeof message !== "object" || !["user", "assistant"].includes(message.role)) {
      throw new Error("Each message must have a valid role");
    }
    return { role: message.role, content: validateMessageContent(message.content) };
  });
  const boundedStrings = ["model", "persona", "customPrompt", "userProfileName", "userProfileAbout"] as const;
  for (const field of boundedStrings) {
    const fieldValue = body[field];
    if (fieldValue !== undefined && (typeof fieldValue !== "string" || fieldValue.length > 20_000)) {
      throw new Error(`${field} is invalid`);
    }
  }
  if (body.maxTokens !== undefined && (!Number.isInteger(body.maxTokens) || body.maxTokens < 1 || body.maxTokens > 1_000_000)) {
    throw new Error("maxTokens is out of range");
  }
  if (body.enableLayoutPreviews !== undefined && typeof body.enableLayoutPreviews !== "boolean") {
    throw new Error("enableLayoutPreviews must be a boolean");
  }
  return { ...body, messages, apiKey: body.apiKey, artifacts: validateArtifactCatalog(body.artifacts) };
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

    if (url.pathname === "/api/attachments" && req.method === "POST") {
      try {
        cleanExpiredImages();
        const formData = await req.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) throw new Error("Choose a file to upload");

        if (allowedImageTypes.has(file.type)) {
          if (file.size > MAX_IMAGE_ATTACHMENT_BYTES) throw new Error("Images must be 50 MB or smaller");
          if (storedImageBytes() + file.size > MAX_STORED_IMAGE_BYTES) {
            throw new Error("Image storage is temporarily full. Try again shortly.");
          }
          const id = crypto.randomUUID();
          storedImages.set(id, { file, expiresAt: Date.now() + IMAGE_TTL_MS, size: file.size });
          return Response.json({
            kind: "image",
            name: path.basename(file.name),
            mimeType: file.type,
            size: file.size,
            url: `${publicBaseUrl(req)}/api/attachments/${id}`,
          }, { headers: corsHeaders });
        }

        if (file.size > MAX_TEXT_ATTACHMENT_BYTES) throw new Error("Files must be 5 MB or smaller");

        const extension = path.extname(file.name).toLowerCase();
        if (!allowedAttachmentExtensions.has(extension)) {
          throw new Error("That file type is not supported yet. Upload a text, code, CSV, JSON, or Markdown file.");
        }

        const content = (await file.text()).replace(/\u0000/g, "");
        if (content.length > MAX_ATTACHMENT_TEXT_LENGTH) {
          throw new Error("The file contains too much text to attach");
        }

        return Response.json({
          kind: "text",
          name: path.basename(file.name),
          mimeType: file.type || "text/plain",
          size: file.size,
          content,
        }, { headers: corsHeaders });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not process attachment";
        return Response.json({ error: message }, {
          status: /choose|smaller|supported|too much/i.test(message) ? 400 : 500,
          headers: corsHeaders,
        });
      }
    }

    if (url.pathname.startsWith("/api/attachments/") && req.method === "GET") {
      cleanExpiredImages();
      const id = url.pathname.slice("/api/attachments/".length);
      const image = storedImages.get(id);
      if (!image) return new Response("Image not found", { status: 404 });
      return new Response(image.file, {
        headers: {
          "Content-Type": image.file.type,
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
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
          artifacts,
        } = validateChatBody(await req.json());

        const response = await streamChat({
          messages,
          apiKey,
          model,
          persona,
          customPrompt,
          maxTokens,
          userProfileName,
          userProfileAbout,
          enableLayoutPreviews,
          artifacts,
        });

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
            status: /required|invalid|range|array|bounded|at most|too long/i.test(message) ? 400 : 500,
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
