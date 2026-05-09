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

  return result.toTextStreamResponse({
  });
}