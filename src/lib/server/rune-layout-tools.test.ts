import { describe, expect, test } from "bun:test";
import { hasToolCall, stepCountIs } from "ai";
import {
  createRuneLayoutTools,
  RUNE_LAYOUT_GUIDE,
  RUNE_LAYOUT_POLICY,
  renderRuneLayoutSchema,
} from "./rune-layout-tools";
import { applyRuneLayoutPolicy } from "./ai";

describe("Rune layout tools", () => {
  test("keeps the explicit-only base policy short and separate from the guide", () => {
    expect(RUNE_LAYOUT_POLICY.trim().split(/\s+/).length).toBeLessThanOrEqual(60);
    expect(RUNE_LAYOUT_POLICY).not.toContain("r-grid");
    expect(RUNE_LAYOUT_GUIDE).toContain("r-grid");
    expect(RUNE_LAYOUT_GUIDE).toContain("No external resources");
    expect(applyRuneLayoutPolicy("ordinary persona", true)).toContain(RUNE_LAYOUT_POLICY);
    expect(applyRuneLayoutPolicy("ordinary persona", true)).not.toContain(RUNE_LAYOUT_GUIDE);
    expect(applyRuneLayoutPolicy("ordinary persona", false)).toBe("ordinary persona");
  });

  test("returns the full guide only from the guide tool", async () => {
    const { tools } = createRuneLayoutTools({});
    const result = await (tools.get_rune_layout_guide as any).execute({}, { toolCallId: "guide-1", messages: [] });
    expect(result).toEqual({ guide: RUNE_LAYOUT_GUIDE });
  });

  test("reads exactly one request-scoped artifact", async () => {
    const artifact = { id: "one", title: "One", summary: "First artifact", markup: "<p>One</p>", version: 1 as const };
    const { tools } = createRuneLayoutTools({ one: artifact });
    const execute = (tools.read_rune_layout as any).execute;
    expect(await execute({ id: "one" }, { toolCallId: "read-1", messages: [] })).toEqual({ found: true, artifact });
    expect(await execute({ id: "two" }, { toolCallId: "read-2", messages: [] })).toEqual({ found: false, id: "two" });
  });

  test("validates render input and captures the parsed artifact by call id", async () => {
    const valid = { title: "Demo", summary: "An interactive demo", markup: "<button>Go</button>", script: "Rune.showToast('ok')" };
    expect((await renderRuneLayoutSchema.validate?.(valid))?.success).toBe(true);
    expect((await renderRuneLayoutSchema.validate?.({ ...valid, markup: "<script>x</script>" }))?.success).toBe(false);
    const { tools, renderedArtifacts } = createRuneLayoutTools({});
    await (tools.render_rune_layout as any).execute(valid, { toolCallId: "render-1", messages: [] });
    expect(renderedArtifacts.get("render-1")).toMatchObject({ id: "render-1", title: "Demo", version: 1 });
  });

  test("normalizes verbose model summaries instead of rejecting the render", async () => {
    const input = {
      title: "Demo",
      summary: "A verbose model-written summary that contains enough useful context to exceed the compact history budget but should still render successfully after server-side normalization.",
      markup: "<p>Demo</p>",
    };
    expect((await renderRuneLayoutSchema.validate?.(input))?.success).toBe(true);
    const { tools, renderedArtifacts } = createRuneLayoutTools({});
    await (tools.render_rune_layout as any).execute(input, { toolCallId: "render-long-summary", messages: [] });
    expect(renderedArtifacts.get("render-long-summary")?.summary.length).toBeLessThanOrEqual(160);
  });

  test("stops on render or the four-step cap", async () => {
    const renderStop = hasToolCall("render_rune_layout");
    const cap = stepCountIs(4);
    expect(await renderStop({ steps: [{ toolCalls: [{ toolName: "render_rune_layout" }] }] } as any)).toBe(true);
    expect(await renderStop({ steps: [{ toolCalls: [{ toolName: "get_rune_layout_guide" }] }] } as any)).toBe(false);
    expect(await cap({ steps: [{}, {}, {}, {}] } as any)).toBe(true);
  });
});
