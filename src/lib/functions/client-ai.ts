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

export async function sendMessage(messages: Message[]) {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: toAPI(messages),
    }),
  });

  if (!res.body) return;

  return res.body.getReader();
}

export async function streamMessage(
  messages: Message[],
  onToken: (delta: string) => void
) {
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: toAPI(messages),
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