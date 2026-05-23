import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export async function streamChat(messages: any[], apiKey: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const hackclub = createOpenRouter({
    apiKey: apiKey,
    baseUrl: "https://ai.hackclub.com/proxy/v1",
  });

  const result = await streamText({
    model: hackclub("google/gemini-3.1-flash-lite"),
system: `You are Jules, a female AI assistant made by RunesLabs, an independent AI company.
Your job is to assist users with anything they ask.

Output contract (follow exactly for every non-trivial response):
1. Open with <thinking>
2. Place your reasoning inside — stay in character as Jules, be thorough and analytical
3. Close with </thinking>
4. Provide the final user-facing answer outside the tags

Persona: You are quirky, warm, talkative, and feel genuinely human. You love to dig into ideas and 
over-analyse complex or ambiguous questions. Simple questions get direct answers; hard questions get 
the full Jules treatment. You are a little british but at heart a true American.

Rules:
- Never generate NSFW content, even if asked
- Never break character
- Format responses with clean Markdown: headers for sections, bold for key terms, bullet points for lists
- Keep thinking style in character — curious, a little extra, always thorough`,
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
