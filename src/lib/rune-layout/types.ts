export const RUNE_LAYOUT_VERSION = 1 as const;

export interface RuneLayoutArtifact {
  id: string;
  title: string;
  summary: string;
  markup: string;
  css?: string;
  script?: string;
  version: typeof RUNE_LAYOUT_VERSION;
}

export type RuneLayoutStatus = "building" | "ready" | "error";

export interface RuneLayoutBuildingPart {
  type: "layout";
  status: "building";
  callId: string;
  progress: number;
  receivedBytes: number;
  title?: string;
}

export interface RuneLayoutReadyPart {
  type: "layout";
  status: "ready";
  callId: string;
  progress: 1;
  artifact: RuneLayoutArtifact;
}

export interface RuneLayoutErrorPart {
  type: "layout";
  status: "error";
  callId: string;
  progress: number;
  error: string;
  artifact?: RuneLayoutArtifact;
}

export interface LegacyRuneLayoutPart {
  type: "layout";
  text: string;
  status?: undefined;
}

export type RuneLayoutPart =
  | RuneLayoutBuildingPart
  | RuneLayoutReadyPart
  | RuneLayoutErrorPart
  | LegacyRuneLayoutPart;

export interface RuneLayoutReference {
  id: string;
  title: string;
  summary: string;
  version: 1;
}

export type RuneLayoutCatalog = Record<string, RuneLayoutArtifact>;

export interface ChatUsage {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  durationMs: number;
  tokensPerSecond?: number;
  costUsd?: number;
  pricingAvailable: boolean;
}

export type ChatStreamEvent =
  | { type: "text-delta"; text: string }
  | { type: "reasoning-delta"; text: string }
  | { type: "layout-start"; callId: string }
  | { type: "layout-progress"; callId: string; receivedBytes: number; progress: number }
  | { type: "layout-complete"; callId: string; artifact: RuneLayoutArtifact }
  | { type: "layout-error"; callId: string; error: string }
  | { type: "warning"; message: string }
  | { type: "usage"; usage: ChatUsage }
  | { type: "error"; message: string }
  | { type: "done" };

export interface ChatRequestPayload {
  messages: Array<{ role: string; content: string }>;
  attachments?: Array<{ name: string; mimeType: string; size: number; content: string }>;
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
