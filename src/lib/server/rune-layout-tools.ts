import { jsonSchema, tool, type ToolSet } from "ai";
import {
  normalizeRuneLayoutArtifact,
  type RuneLayoutSourceInput,
} from "../rune-layout/artifacts";
import type { RuneLayoutArtifact, RuneLayoutCatalog } from "../rune-layout/types";

export const RUNE_LAYOUT_POLICY = `Create a Rune layout only when the user explicitly asks for a visual, interactive, diagram, dashboard, or layout artifact. Before rendering, call get_rune_layout_guide. For revisions, call read_rune_layout for the relevant artifact. Otherwise answer normally in Markdown; never emit rune-layout fences.`;

export const RUNE_LAYOUT_GUIDE = `Rune layout authoring guide (version 1)

Return one artifact through render_rune_layout. Use semantic HTML in markup and the responsive built-ins below. Do not include html, head, body, style, or script wrapper tags. Put custom styling only in css and custom JavaScript only in script.

Safety and accessibility:
- No external resources, URLs, network calls, frames, forms that navigate, or top-window access.
- Add accessible names to controls and meaningful headings/labels. Use buttons for actions.
- Never use a fixed canvas/page width. Everything must fit a 320px container and reflow naturally.
- Prefer built-ins before custom CSS or JavaScript. Use custom code only when the requested behavior needs it.

Responsive layout:
- <div class="r-stack"> vertical rhythm
- <div class="r-cluster"> wrapping inline group
- <div class="r-grid"> auto-fit cards; .r-grid-2 and .r-grid-3 aliases
- <div class="r-split"> responsive two-sided region
- .r-card, .r-panel, .r-glass, .r-row, .r-col and .r-gap-sm/.r-gap-md/.r-gap-lg

Visual explanation components:
- Metrics: .r-metrics containing .r-metric; use .r-metric-value and .r-metric-label
- Comparison/matrix: .r-comparison, .r-matrix, or a .r-table-wrap containing table.r-table
- Timeline/steps: ol.r-timeline or ol.r-steps with li items
- Flow/tree: .r-flow or .r-tree; connect concise labeled nodes with semantic nested lists
- Callouts/badges: .r-callout plus .success/.warning/.danger; .r-badge variants
- Progress/gauge: .r-progress > .r-progress-bar with style="--value: 65%"; .r-gauge style="--value: 65"
- Charts: elements with data-r-chart="bar|line|donut", data-values="12,30,18", and data-labels="A,B,C". Charts use responsive SVG.
- Tabs: .r-tabs with buttons carrying data-r-tab="panel-id" and panels carrying data-r-panel="panel-id".
- Controls: .r-input, .r-select, .r-slider, .r-btn, .r-btn-prim, .r-btn-sec.

Declarative state:
- r-model="key" binds an input to Rune.state.key.
- r-text="key" displays a value; r-show="key" and r-hide="key" control visibility.
- Script API: Rune.state, Rune.set(key, value), Rune.showToast(message, kind), Rune.showModal(id), Rune.closeModal(id), Rune.showTab(event, id), Rune.setProgress(id, percent), Rune.updateChart(id, values, labels), Rune.resize(). window.rune is an alias.

Keep title under 120 characters and summary under 160 characters. Summary should tell the model what the artifact contains without including source. Keep markup concise, fluid, and useful.`;

interface GuideInput {}
interface ReadInput { id: string }
export interface RenderInput {
  title: string;
  summary: string;
  markup: string;
  css?: string;
  script?: string;
  sourceId?: string;
}

const emptyObjectSchema = jsonSchema<GuideInput>({
  type: "object",
  properties: {},
  additionalProperties: false,
});

const readSchema = jsonSchema<ReadInput>({
  type: "object",
  properties: { id: { type: "string", minLength: 1, maxLength: 128 } },
  required: ["id"],
  additionalProperties: false,
});

export const renderRuneLayoutSchema = jsonSchema<RenderInput>(
  {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 120 },
      // Models frequently write a useful sentence slightly over the compact
      // history limit. The server normalizes it to 160 characters after the
      // tool call, while this larger input bound prevents avoidable tool-loop
      // validation failures.
      summary: { type: "string", minLength: 1, maxLength: 512 },
      markup: { type: "string", minLength: 1, maxLength: 51200 },
      css: { type: "string", maxLength: 30720 },
      script: { type: "string", maxLength: 30720 },
      sourceId: { type: "string", minLength: 1, maxLength: 128 },
    },
    required: ["title", "summary", "markup"],
    additionalProperties: false,
  },
  {
    validate(value) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { success: false, error: new Error("Render input must be an object") };
      }
      const source = value as RuneLayoutSourceInput;
      try {
        normalizeRuneLayoutArtifact(source, "validation");
        return { success: true, value: source as RenderInput };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error : new Error("Invalid layout") };
      }
    },
  },
);

export interface RuneLayoutToolsResult {
  tools: ToolSet;
  renderedArtifacts: Map<string, RuneLayoutArtifact>;
}

export function createRuneLayoutTools(catalog: RuneLayoutCatalog): RuneLayoutToolsResult {
  const renderedArtifacts = new Map<string, RuneLayoutArtifact>();

  const tools = {
    get_rune_layout_guide: tool({
      description: "Call only after an explicit user request for a visual or interactive Rune artifact. Returns the authoring contract.",
      inputSchema: emptyObjectSchema,
      execute: async () => ({ guide: RUNE_LAYOUT_GUIDE }),
    }),
    read_rune_layout: tool({
      description: "Read exactly one prior Rune artifact by id when the user explicitly asks to revise or extend it.",
      inputSchema: readSchema,
      execute: async ({ id }) => {
        const artifact = catalog[id];
        if (!artifact) return { found: false, id };
        return { found: true, artifact };
      },
    }),
    render_rune_layout: tool({
      description: "Render the completed Rune artifact. Call only after reading the guide and only for an explicit layout request.",
      inputSchema: renderRuneLayoutSchema,
      strict: true,
      execute: async (input, { toolCallId }) => {
        const artifact = normalizeRuneLayoutArtifact(input, toolCallId);
        renderedArtifacts.set(toolCallId, artifact);
        return { rendered: true, id: artifact.id, title: artifact.title };
      },
    }),
  } satisfies ToolSet;

  return { tools, renderedArtifacts };
}

export function isToolFallbackCandidate(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /tool|function.?call|unsupported|not supported|invalid.*schema/i.test(message);
}
