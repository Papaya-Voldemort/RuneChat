import type { MessagePart } from "../stores/chat";
import type { ChatRequestPayload, ChatStreamEvent, ChatUsage } from "../rune-layout/types";
import { apiUrl } from "./api-url";

const OPEN_THINKING = "<thinking>";
const CLOSE_THINKING = "</thinking>";

export async function* decodeNdjson(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) yield parseEvent(line);
        newline = buffer.indexOf("\n");
      }
    }

    buffer += decoder.decode();
    const finalLine = buffer.trim();
    if (finalLine) yield parseEvent(finalLine);
  } finally {
    reader.releaseLock();
  }
}

function parseEvent(line: string): ChatStreamEvent {
  let event: unknown;
  try {
    event = JSON.parse(line);
  } catch {
    throw new Error("The chat server returned malformed streaming data");
  }
  if (!event || typeof event !== "object" || typeof (event as { type?: unknown }).type !== "string") {
    throw new Error("The chat server returned an invalid stream event");
  }
  return event as ChatStreamEvent;
}

type TextChannel = "text" | "reasoning";

class ThinkingTagParser {
  private channel: TextChannel = "text";
  private pending = "";

  push(chunk: string): Array<{ channel: TextChannel; text: string }> {
    this.pending += chunk;
    return this.drain(false);
  }

  finish(): Array<{ channel: TextChannel; text: string }> {
    return this.drain(true);
  }

  private drain(flush: boolean): Array<{ channel: TextChannel; text: string }> {
    const output: Array<{ channel: TextChannel; text: string }> = [];
    while (this.pending) {
      const tag = this.channel === "text" ? OPEN_THINKING : CLOSE_THINKING;
      const index = this.pending.indexOf(tag);
      if (index >= 0) {
        if (index) output.push({ channel: this.channel, text: this.pending.slice(0, index) });
        this.pending = this.pending.slice(index + tag.length);
        this.channel = this.channel === "text" ? "reasoning" : "text";
        continue;
      }

      let retained = 0;
      if (!flush) {
        const max = Math.min(tag.length - 1, this.pending.length);
        for (let length = max; length > 0; length -= 1) {
          if (tag.startsWith(this.pending.slice(-length))) {
            retained = length;
            break;
          }
        }
      }
      const emitted = this.pending.slice(0, this.pending.length - retained);
      if (emitted) output.push({ channel: this.channel, text: emitted });
      this.pending = this.pending.slice(this.pending.length - retained);
      break;
    }
    return output;
  }
}

function appendTextPart(parts: MessagePart[], type: "text" | "reasoning", text: string): void {
  if (!text) return;
  const last = parts.at(-1);
  if (last?.type === type) {
    last.text += text;
  } else {
    parts.push({ type, text });
  }
}

function snapshotParts(parts: MessagePart[]): MessagePart[] {
  return structuredClone(parts);
}

export interface ChatStreamAssembler {
  readonly parts: MessagePart[];
  readonly usage: ChatUsage | undefined;
  apply(event: ChatStreamEvent): void;
  finish(interrupted?: boolean): void;
}

export function createChatStreamAssembler(): ChatStreamAssembler {
  const parts: MessagePart[] = [];
  const thinking = new ThinkingTagParser();
  let completed = false;
  let usage: ChatStreamAssembler["usage"];

  function appendParsed(chunks: Array<{ channel: TextChannel; text: string }>): void {
    for (const chunk of chunks) appendTextPart(parts, chunk.channel, chunk.text);
  }

  return {
    parts,
    get usage() {
      return usage;
    },
    apply(event) {
      switch (event.type) {
        case "text-delta":
          appendParsed(thinking.push(event.text));
          break;
        case "reasoning-delta":
          appendTextPart(parts, "reasoning", event.text);
          break;
        case "layout-start":
          parts.push({
            type: "layout",
            status: "building",
            callId: event.callId,
            progress: 0.06,
            receivedBytes: 0,
          });
          break;
        case "layout-progress": {
          const part = parts.find(
            (candidate) => candidate.type === "layout" && "callId" in candidate && candidate.callId === event.callId,
          );
          if (part?.type === "layout" && "status" in part && part.status === "building") {
            part.progress = Math.max(part.progress, Math.min(0.94, event.progress));
            part.receivedBytes = event.receivedBytes;
          }
          break;
        }
        case "layout-complete": {
          const index = parts.findIndex(
            (candidate) => candidate.type === "layout" && "callId" in candidate && candidate.callId === event.callId,
          );
          const ready: MessagePart = {
            type: "layout",
            status: "ready",
            callId: event.callId,
            progress: 1,
            artifact: event.artifact,
          };
          if (index >= 0) parts[index] = ready;
          else parts.push(ready);
          break;
        }
        case "layout-error": {
          const index = parts.findIndex(
            (candidate) => candidate.type === "layout" && "callId" in candidate && candidate.callId === event.callId,
          );
          const failed: MessagePart = {
            type: "layout",
            status: "error",
            callId: event.callId,
            progress: index >= 0 && parts[index]?.type === "layout" && "progress" in parts[index]!
              ? Number(parts[index].progress)
              : 0,
            error: event.error,
          };
          if (index >= 0) parts[index] = failed;
          else parts.push(failed);
          break;
        }
        case "warning":
          parts.push({ type: "warning", text: event.message });
          break;
        case "usage":
          usage = event.usage;
          break;
        case "error":
          appendTextPart(parts, "text", `\n\nSorry, the response failed: ${event.message}`);
          break;
        case "done":
          completed = true;
          appendParsed(thinking.finish());
          break;
      }
    },
    finish(interrupted = !completed) {
      appendParsed(thinking.finish());
      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (part?.type === "layout" && "status" in part && part.status === "building") {
          parts[index] = {
            type: "layout",
            status: "error",
            callId: part.callId,
            progress: part.progress,
            error: interrupted
              ? "The layout build was interrupted. Retry the request to rebuild it."
              : "The layout build did not complete. Retry the request to rebuild it.",
          };
        }
      }
    },
  };
}

export async function streamChatRequest(
  payload: ChatRequestPayload,
  onParts: (parts: MessagePart[]) => void,
  fetcher: typeof fetch = fetch,
  onUsage?: (usage: NonNullable<ChatStreamAssembler["usage"]>) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetcher(apiUrl("/api/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed with ${response.status}`);
  }
  if (!response.body) throw new Error("Empty response body from server");

  const assembler = createChatStreamAssembler();
  let done = false;
  try {
    for await (const event of decodeNdjson(response.body)) {
      assembler.apply(event);
      done ||= event.type === "done";
      onParts(snapshotParts(assembler.parts));
    }
  } finally {
    assembler.finish(!done);
    onParts(snapshotParts(assembler.parts));
    if (assembler.usage) onUsage?.(assembler.usage);
  }
}
