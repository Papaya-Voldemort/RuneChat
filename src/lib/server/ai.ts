import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const hackclub = createOpenRouter({
  apiKey: process.env.HCAI_KEY!,
  baseUrl: "https://ai.hackclub.com/proxy/v1",
});

export async function streamChat(messages: any[]) {
  const result = await streamText({
    model: hackclub("qwen/qwen3-32b"),
    messages,

    experimental_thinking: {
      type: "enabled",
      budget_tokens: 8000,
    },
  });

  // Create a custom readable stream that streams thinking first, then text
  const customStream = new ReadableStream({
    async start(controller) {
      let thinkingContent = "";

      for await (const chunk of result.fullStream) {
        if (chunk.type === "thinking-delta") {
          thinkingContent += chunk.delta;
          // Stream thinking tags as content is accumulated
          if (chunk.delta) {
            controller.enqueue(`<thinking>${chunk.delta}</thinking>`);
          }
        } else if (chunk.type === "text-delta") {
          controller.enqueue(chunk.delta);
        }
      }

      controller.close();
    },
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
