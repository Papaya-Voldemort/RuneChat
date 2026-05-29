export type Message = {
  role: "user" | "assistant" | "system";
  parts?: { type: "text" | "reasoning"; text: string }[];
  content?: string;
};

function toAPI(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role,
    content:
      m.parts && Array.isArray(m.parts)
        ? m.parts
          .filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("")
        : m.content ?? "",
  }));
}

const API_URL = "/api/chat";

export async function sendMessage(messages: Message[], apiKey?: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: toAPI(messages),
      apiKey,
    }),
  });

  if (!res.body) return;

  return res.body.getReader();
}

export async function streamMessage(
  messages: Message[],
  onToken: (delta: string) => void,
  apiKey?: string
) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: toAPI(messages),
      apiKey,
    }),
  });

  if (!res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    buffer += chunk;

    onToken(chunk);
  }

  return buffer;
}