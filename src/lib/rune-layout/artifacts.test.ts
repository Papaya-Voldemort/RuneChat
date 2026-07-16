import { describe, expect, test } from "bun:test";
import {
  compactArtifactMarker,
  convertLegacyLayout,
  MAX_ARTIFACTS_PER_REQUEST,
  MAX_MARKUP_BYTES,
  normalizeRuneLayoutArtifact,
  validateArtifactCatalog,
} from "./artifacts";
import { compileRuneLayoutSrcdoc } from "./runtime";

const base = {
  id: "artifact-1",
  title: "Quarterly metrics",
  summary: "A compact KPI dashboard for the current quarter.",
  markup: "<section class=\"r-metrics\"><div class=\"r-metric\">42</div></section>",
};

describe("Rune layout artifacts", () => {
  test("normalizes a versioned artifact and compact history marker", () => {
    const artifact = normalizeRuneLayoutArtifact(base);
    expect(artifact.version).toBe(1);
    expect(compactArtifactMarker(artifact)).toContain("artifact-1");
    expect(compactArtifactMarker(artifact)).not.toContain(artifact.markup);
  });

  test("rejects wrappers and source-size violations", () => {
    expect(() => normalizeRuneLayoutArtifact({ ...base, markup: "<script>alert(1)</script>" })).toThrow("wrapper");
    expect(() => normalizeRuneLayoutArtifact({ ...base, markup: "x".repeat(MAX_MARKUP_BYTES + 1) })).toThrow("50 KiB");
    const longSummary = normalizeRuneLayoutArtifact({ ...base, summary: "x".repeat(161) });
    expect(longSummary.summary.length).toBeLessThanOrEqual(160);
  });

  test("allows literal closing-tag strings because compilation base64-embeds source", () => {
    const artifact = normalizeRuneLayoutArtifact({
      ...base,
      css: `.note::after { content: "</style>"; }`,
      script: `const sentinel = "</script>"; Rune.set("sentinel", sentinel);`,
    });
    expect(artifact.css).toContain("</style>");
    expect(artifact.script).toContain("</script>");
    const srcdoc = compileRuneLayoutSrcdoc(artifact, "test-channel");
    expect(srcdoc).toContain("default-src 'none'");
    expect(srcdoc).toContain("connect-src 'none'");
    expect(srcdoc).not.toContain(artifact.script);
    expect(srcdoc).not.toContain(artifact.css);
  });

  test("accepts and unwraps model-added custom CSS/JS wrappers", () => {
    const artifact = normalizeRuneLayoutArtifact({
      ...base,
      css: "<style>.note { color: red }</style>",
      script: "<script>Rune.set(\"ready\", true)</script>",
    });
    expect(artifact.css).toBe(".note { color: red }");
    expect(artifact.script).toBe("Rune.set(\"ready\", true)");
  });

  test("bounds and validates request catalogs", () => {
    const catalog = Object.fromEntries(Array.from({ length: MAX_ARTIFACTS_PER_REQUEST + 1 }, (_, index) => [
      `a-${index}`,
      { ...base, id: `a-${index}` },
    ]));
    expect(() => validateArtifactCatalog(catalog)).toThrow("20");
    expect(validateArtifactCatalog({ "artifact-1": base })["artifact-1"]?.title).toBe(base.title);
  });

  test("converts legacy title, style, and script without mutating the source", () => {
    const legacy = `<!-- title: Calculator -->\n<style>.x { color: red }</style>\n<div class="x">Result</div>\n<script>Rune.set("result", 4)</script>`;
    const artifact = convertLegacyLayout(legacy, "legacy-1");
    expect(artifact.title).toBe("Calculator");
    expect(artifact.markup).toContain("Result");
    expect(artifact.css).toContain("color: red");
    expect(artifact.script).toContain("Rune.set");
    expect(legacy).toContain("<style>");
  });
});
