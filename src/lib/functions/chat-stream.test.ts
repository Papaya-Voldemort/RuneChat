import { describe, expect, test } from "bun:test";
import { createChatStreamAssembler, decodeNdjson } from "./chat-stream";
import type { ChatStreamEvent } from "../rune-layout/types";

function fragmentedStream(bytes: Uint8Array, boundaries: number[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      let start = 0;
      for (const end of boundaries) {
        controller.enqueue(bytes.slice(start, end));
        start = end;
      }
      if (start < bytes.length) controller.enqueue(bytes.slice(start));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<ChatStreamEvent[]> {
  const events: ChatStreamEvent[] = [];
  for await (const event of decodeNdjson(stream)) events.push(event);
  return events;
}

describe("NDJSON transport", () => {
  test("preserves Unicode at every possible byte boundary", async () => {
    const events: ChatStreamEvent[] = [
      { type: "text-delta", text: "Rune 🪄 café 漢字\n```js\nconst s = '</script>'\n```" },
      { type: "done" },
    ];
    const bytes = new TextEncoder().encode(events.map((event) => JSON.stringify(event)).join("\n") + "\n");
    for (let split = 1; split < bytes.length; split += 1) {
      expect(await collect(fragmentedStream(bytes, [split]))).toEqual(events);
    }
  });

  test("handles multiple records in arbitrarily fragmented chunks", async () => {
    const events: ChatStreamEvent[] = [
      { type: "reasoning-delta", text: "why" },
      { type: "layout-start", callId: "call-1" },
      { type: "layout-progress", callId: "call-1", receivedBytes: 43, progress: .4 },
      { type: "done" },
    ];
    const bytes = new TextEncoder().encode(events.map((event) => JSON.stringify(event)).join("\n"));
    expect(await collect(fragmentedStream(bytes, Array.from({ length: bytes.length - 1 }, (_, index) => index + 1)))).toEqual(events);
  });
});

describe("message assembly", () => {
  test("preserves text/layout/text ordering and does not treat fences as layouts", () => {
    const assembler = createChatStreamAssembler();
    assembler.apply({ type: "text-delta", text: "Before\n```rune-layout\nliteral </style> and `ticks`\n```\n" });
    assembler.apply({ type: "layout-start", callId: "render-1" });
    assembler.apply({ type: "layout-progress", callId: "render-1", receivedBytes: 100, progress: .7 });
    assembler.apply({
      type: "layout-complete",
      callId: "render-1",
      artifact: { id: "render-1", title: "Result", summary: "A result", markup: "<p>Done</p>", script: "const x = `</script>`;", version: 1 },
    });
    assembler.apply({ type: "text-delta", text: "After" });
    assembler.apply({ type: "done" });
    expect(assembler.parts.map((part) => part.type)).toEqual(["text", "layout", "text"]);
    expect(assembler.parts[0]?.type === "text" && assembler.parts[0].text).toContain("```rune-layout");
  });

  test("recognizes thinking tags split across chunks", () => {
    const assembler = createChatStreamAssembler();
    for (const chunk of ["Hello<th", "inking>secret", "</think", "ing>world"]) {
      assembler.apply({ type: "text-delta", text: chunk });
    }
    assembler.apply({ type: "done" });
    expect(assembler.parts).toEqual([
      { type: "text", text: "Hello" },
      { type: "reasoning", text: "secret" },
      { type: "text", text: "world" },
    ]);
  });

  test("turns interrupted builds into retryable errors", () => {
    const assembler = createChatStreamAssembler();
    assembler.apply({ type: "layout-start", callId: "render-2" });
    assembler.finish(true);
    expect(assembler.parts[0]).toMatchObject({ type: "layout", status: "error", callId: "render-2" });
  });

  test("does not leave an unfinished layout building after a clean done event", () => {
    const assembler = createChatStreamAssembler();
    assembler.apply({ type: "layout-start", callId: "render-3" });
    assembler.apply({ type: "done" });
    assembler.finish(false);
    expect(assembler.parts[0]).toMatchObject({ type: "layout", status: "error", callId: "render-3" });
  });
});
