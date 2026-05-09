import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const hackclub = createOpenRouter({
  apiKey: process.env.HCAI_KEY!,
  baseUrl: "https://ai.hackclub.com/proxy/v1",
});

export async function streamChat(messages: any[]) {
  const result = await streamText({
    model: hackclub("qwen/qwen3-32b"),
    system: `You are a helpful assistant. When solving problems or thinking through complex topics, wrap your reasoning process in <thinking></thinking> tags. After your thinking, provide your final response outside of these tags.

Example:
<thinking>
Let me break down this problem step by step...
</thinking>

Here's my answer...`,
    messages,
  });

  // Stream the response as-is, client will parse thinking tags
  return result.toTextStreamResponse();
}
