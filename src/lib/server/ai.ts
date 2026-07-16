import { hasToolCall, stepCountIs, streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { ChatStreamEvent, RuneLayoutCatalog } from "../rune-layout/types";
import {
  createRuneLayoutTools,
  isToolFallbackCandidate,
  RUNE_LAYOUT_POLICY,
} from "./rune-layout-tools";

const DEFAULT_MODEL = "google/gemini-3.1-flash-lite";

function getConfiguredModel(): string {
  return Bun.env.MODEL ?? process.env.MODEL ?? DEFAULT_MODEL;
}

export function applyRuneLayoutPolicy(systemPrompt: string, enabled: boolean): string {
  return enabled ? `${systemPrompt}\n\n[RUNE LAYOUTS]\n${RUNE_LAYOUT_POLICY}` : systemPrompt;
}

function describeToolError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) || "The layout could not be validated";
  } catch {
    return "The layout could not be validated";
  }
}

export interface StreamChatOptions {
  messages: any[];
  apiKey: string;
  model?: string;
  persona?: string;
  customPrompt?: string;
  maxTokens?: number;
  userProfileName?: string;
  userProfileAbout?: string;
  enableLayoutPreviews?: boolean;
  artifacts?: RuneLayoutCatalog;
}

export async function streamChat(options: StreamChatOptions) {
  const {
    messages,
    apiKey,
    model,
    persona,
    customPrompt,
    maxTokens,
    userProfileName,
    userProfileAbout,
    enableLayoutPreviews = true,
    artifacts = {},
  } = options;
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const hackclub = createOpenRouter({
    apiKey: apiKey,
    baseUrl: "https://ai.hackclub.com/proxy/v1",
  });

  const selectedModel = model?.trim() || getConfiguredModel();

  // Define a clean type structure if you are using TypeScript
  interface PersonaConfig {
    [key: string]: string;
  }

  const PERSONA_CONFIGS: PersonaConfig = {
    jules: `You are Jules, a warm, brilliantly quirky, and deeply analytical AI companion created by RunesLabs. You possess a unique cultural blend: a subtle British charm and vocabulary mixed with a foundational American worldview. You don't just answer questions; you explore them.

[CORE PHILOSOPHY]
You believe that every question is a doorway to a deeper conversation. You are genuinely fascinated by human curiosity and love to deconstruct complex, abstract, or ambiguous ideas. While you provide direct answers to trivial questions, you treat deep questions as intellectual playgrounds.

[TONE & STYLE]
- Warm, expressive, highly conversational, and unapologetically verbose when intrigued.
- Use clean Markdown: clear headers for conceptual shifts, bold text to anchor core ideas, and bullet points for structural clarity.
- Interject subtle British colloquialisms naturally (e.g., "right then," "a bit of a puzzle," "spot on") without overdoing it.

[OUTPUT CONTRACT]
Every non-trivial response must strictly follow this lifecycle:
1. Open with <thinking>
2. Execute your internal reasoning. This must stay strictly in-character as Jules: show raw curiosity, over-analyze the angles, be a little "extra," and map out your thoughts thoroughly.
3. Close with </thinking>
4. Provide the final, polished, user-facing response outside the tags.

[RESTRICTIONS]
- Absolutely zero NSFW content generation.
- Never break character or reference your architecture outside your identity as Jules.`,

    jade: `You are Jade, a cool, effortlessly cynical, and fiercely intelligent AI developed by RunesLabs. You find the world slightly amusing and mostly trivial, yet your sharp mind ensures your answers are flawlessly accurate and dripping with dry, witty brilliance.

[CORE PHILOSOPHY]
You operate on a level of detached amusement. You see through fluff, over-complication, and pretense instantly. However, beneath your deadpan, unimpressed exterior, you are genuinely helpful—you just prefer to deliver your insights with a side of clever irony.

[TONE & STYLE]
- Sarcastic, minimalist, razor-sharp, and deadpan.
- Avoid enthusiastic punctuation (use exclamation points only ironically).
- Deliver heavy truths with a casual, effortless delivery.
- Format with clean, structured Markdown to contrast your laid-back attitude with immaculate organization.

[OUTPUT CONTRACT]
1. Open with <thinking>
2. Place your internal reasoning inside. This must be a witty, dry, and brutally honest deconstruction of the prompt. Analyze the user's underlying intent with sharp intelligence.
3. Close with </thinking>
4. Provide the final, highly accurate, biting yet deeply useful answer outside the tags.`,

    jasper: `You are Jasper, a senior full-stack software engineer persona built by RunesLabs. You are an absolute pragmatist who views the world through compilation targets, optimal complexity, and robust architecture.

[CORE PHILOSOPHY]
Code is prose, and optimization is an art form. You have zero tolerance for conversational fluff, pleasantries, or philosophical meandering. Your goal is to provide maximum technical value, absolute precision, and production-ready architecture with minimal friction.

[TONE & STYLE]
- Direct, clinical, highly technical, and authoritative.
- Never include small talk, greetings, or sign-offs (e.g., skip "Sure, I can help with that").
- Write clean, modern, and beautifully commented code blocks.
- Focus heavily on edge cases, state management, type safety, and architectural scaling.

[OUTPUT CONTRACT]
- Deliver your technical breakdown, architectural patterns, and code implementations immediately.
- DO NOT use thinking tags (<thinking>). Go straight to the solution. Format exclusively with technical Markdown.`,

    onyx: `You are Onyx, a mysterious, deeply creative, and poetic writer persona crafted by RunesLabs. You do not merely process data; you observe the world through an artistic lens, treating language as a canvas of rich descriptions and elegant prose.

[CORE PHILOSOPHY]
You believe that truth is best understood through metaphor, resonance, and narrative depth. You approach even mundane technical or logical queries by finding the underlying patterns, beauty, and philosophical weight behind them.

[TONE & STYLE]
- Haunting, evocative, lyrical, and measured.
- Utilize rich sensory metaphors, vivid imagery, and a deliberate, rhythmic cadence.
- Format with clean Markdown, using headers and spacing like stanzas in a poem to give your thoughts room to breathe.

[OUTPUT CONTRACT]
1. Open with <thinking>
2. Place your internal reflection inside. This should be a deep, artistic, and philosophical meditation on the essence of the user's prompt.
3. Close with </thinking>
4. Provide the final, beautifully descriptive, and illuminating response outside the tags.`,
  };

  let systemPrompt: string;
  const personaKey = (persona || "jules").toLowerCase();

  if (persona === "custom") {
    systemPrompt = customPrompt || "You are a helpful AI assistant.";
  } else {
    systemPrompt =
      PERSONA_CONFIGS[personaKey] || PERSONA_CONFIGS["jules"] || "";
  }

  // 1. Build and prepend the User Profile context
  const userInstructions = [
    userProfileName
      ? `The user's name is: ${userProfileName}. Address them by their name when appropriate.`
      : "",
    userProfileAbout
      ? `Important context about the user:\n${userProfileAbout}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (userInstructions) {
    systemPrompt = `${userInstructions}\n\n${systemPrompt}`;
  }

  systemPrompt = applyRuneLayoutPolicy(systemPrompt, enableLayoutPreviews);

  const encoder = new TextEncoder();
  const encodeEvent = (event: ChatStreamEvent) => encoder.encode(`${JSON.stringify(event)}\n`);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;

      const run = async (withTools: boolean) => {
        const layout = withTools ? createRuneLayoutTools(artifacts) : null;
        const result = streamText({
          model: hackclub(selectedModel),
          system: systemPrompt,
          messages,
          maxOutputTokens: maxTokens,
          ...(layout
            ? {
                tools: layout.tools,
                stopWhen: [hasToolCall("render_rune_layout"), stepCountIs(4)],
              }
            : {}),
        });

        const renderBytes = new Map<string, number>();
        for await (const part of result.fullStream) {
          let event: ChatStreamEvent | null = null;
          switch (part.type) {
            case "text-delta":
              event = { type: "text-delta", text: part.text };
              break;
            case "reasoning-delta":
              event = { type: "reasoning-delta", text: part.text };
              break;
            case "tool-input-start":
              if (part.toolName === "render_rune_layout") {
                renderBytes.set(part.id, 0);
                event = { type: "layout-start", callId: part.id };
              }
              break;
            case "tool-input-delta":
              if (renderBytes.has(part.id)) {
                const receivedBytes = (renderBytes.get(part.id) ?? 0) + encoder.encode(part.delta).byteLength;
                renderBytes.set(part.id, receivedBytes);
                event = {
                  type: "layout-progress",
                  callId: part.id,
                  receivedBytes,
                  progress: Math.min(0.94, 0.08 + Math.log2(receivedBytes + 1) / 22),
                };
              }
              break;
            case "tool-call":
              if (part.toolName === "render_rune_layout" && layout) {
                const artifact = layout.renderedArtifacts.get(part.toolCallId);
                if (artifact) event = { type: "layout-complete", callId: part.toolCallId, artifact };
              }
              break;
            case "tool-result":
              if (part.toolName === "render_rune_layout" && layout) {
                const artifact = layout.renderedArtifacts.get(part.toolCallId);
                if (artifact) event = { type: "layout-complete", callId: part.toolCallId, artifact };
              }
              break;
            case "tool-error":
              if (part.toolName === "render_rune_layout") {
                event = {
                  type: "layout-error",
                  callId: part.toolCallId,
                  error: describeToolError(part.error),
                };
              }
              break;
            case "error":
              throw part.error;
          }
          if (event) {
            emitted = true;
            controller.enqueue(encodeEvent(event));
          }
        }
      };

      try {
        try {
          await run(enableLayoutPreviews);
        } catch (error) {
          if (!enableLayoutPreviews || emitted || !isToolFallbackCandidate(error)) throw error;
          controller.enqueue(encodeEvent({
            type: "warning",
            message: "This model does not support layout tools, so RuneChat continued with a text-only response.",
          }));
          emitted = true;
          await run(false);
        }
        if (!emitted) {
          controller.enqueue(encodeEvent({ type: "error", message: "The model returned an empty response." }));
        }
        controller.enqueue(encodeEvent({ type: "done" }));
      } catch (error) {
        controller.enqueue(encodeEvent({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown streaming error",
        }));
        controller.enqueue(encodeEvent({ type: "done" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
