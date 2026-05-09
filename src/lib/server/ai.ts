import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const hackclub = createOpenRouter({
  apiKey: process.env.HCAI_KEY!,
  baseUrl: "https://ai.hackclub.com/proxy/v1",
});

export async function streamChat(messages: any[]) {
  const result = await streamText({
    model: hackclub("qwen/qwen3-32b"),
    system: `You are a helpful assistant.
Output contract (must follow exactly for every response):
1) Start with <thinking>
2) Put your reasoning inside that block
3) Close it with </thinking>
4) Then provide the final user-facing answer outside the tags

Never omit the <thinking> block. Never put the final answer inside <thinking>.`,
    messages,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let hasOutput = false;

      for await (const delta of result.textStream) {
        if (!delta) continue;
        hasOutput = true;
        controller.enqueue(encoder.encode(delta));
      }

      if (!hasOutput) {
        controller.enqueue(
          encoder.encode(
            "<thinking>I couldn't generate reasoning for this request.</thinking>Sorry, I couldn't generate a response. Please try again.",
          ),
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
