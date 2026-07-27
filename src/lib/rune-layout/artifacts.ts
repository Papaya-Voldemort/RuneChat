import type {
  LegacyRuneLayoutPart,
  RuneLayoutArtifact,
  RuneLayoutCatalog,
  RuneLayoutReference,
} from "./types";
import { createId } from "../functions/id";

export const MAX_ARTIFACTS_PER_REQUEST = 20;
export const MAX_MARKUP_BYTES = 50 * 1024;
export const MAX_CSS_BYTES = 30 * 1024;
export const MAX_SCRIPT_BYTES = 30 * 1024;
export const MAX_SUMMARY_LENGTH = 160;

const encoder = new TextEncoder();
const DOCUMENT_WRAPPER = /<\/?(?:html|head|body|style|script)\b/i;

export interface RuneLayoutSourceInput {
  id?: string;
  title: string;
  summary: string;
  markup: string;
  css?: string;
  script?: string;
  sourceId?: string;
  version?: number;
}

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Rune layout ${field} must be a string`);
  }
}

function assertSource(field: "markup" | "css" | "script", value: string, max: number): void {
  if (encoder.encode(value).byteLength > max) {
    throw new Error(`Rune layout ${field} exceeds ${Math.round(max / 1024)} KiB`);
  }
  // Markup is inserted into the iframe DOM, so document wrappers are invalid there.
  // CSS and JS are transported as text/blob data; HTML-looking strings in those
  // fields are safe and common (for example a script building a template).
  if (field === "markup" && DOCUMENT_WRAPPER.test(value)) {
    throw new Error(`Rune layout ${field} must not contain document, style, or script wrapper tags`);
  }
}

function normalizeOptionalSource(
  field: "css" | "script",
  value: string | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const tag = field === "css" ? "style" : "script";
  const wrapped = trimmed.match(new RegExp(`^<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>$`, "i"));
  return (wrapped?.[1] ?? trimmed).trim() || undefined;
}

function normalizeId(value: string): string {
  const id = value.trim();
  if (!id || id.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(id)) {
    throw new Error("Rune layout id is invalid");
  }
  return id;
}

function normalizeSummary(value: string): string {
  if (value.length <= MAX_SUMMARY_LENGTH) return value;
  const shortened = value.slice(0, MAX_SUMMARY_LENGTH - 1).replace(/\s+\S*$/, "").trim();
  return `${shortened || value.slice(0, MAX_SUMMARY_LENGTH - 1).trim()}…`;
}

export function normalizeRuneLayoutArtifact(
  input: RuneLayoutSourceInput,
  fallbackId: string = createId(),
): RuneLayoutArtifact {
  assertString(input.title, "title");
  assertString(input.summary, "summary");
  assertString(input.markup, "markup");
  if (input.css !== undefined) assertString(input.css, "css");
  if (input.script !== undefined) assertString(input.script, "script");

  const title = input.title.trim();
  const summary = normalizeSummary(input.summary.trim());
  const markup = input.markup.trim();
  const css = normalizeOptionalSource("css", input.css);
  const script = normalizeOptionalSource("script", input.script);

  if (!title || title.length > 120) throw new Error("Rune layout title must be 1–120 characters");
  if (!summary) throw new Error("Rune layout summary must not be empty");
  if (!markup) throw new Error("Rune layout markup cannot be empty");

  assertSource("markup", markup, MAX_MARKUP_BYTES);
  if (css) assertSource("css", css, MAX_CSS_BYTES);
  if (script) assertSource("script", script, MAX_SCRIPT_BYTES);

  return {
    id: normalizeId(input.id || fallbackId),
    title,
    summary,
    markup,
    ...(css ? { css } : {}),
    ...(script ? { script } : {}),
    version: 1,
  };
}

export function validateArtifactCatalog(value: unknown): RuneLayoutCatalog {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Artifact catalog must be an object keyed by artifact id");
  }

  const entries = Object.entries(value);
  if (entries.length > MAX_ARTIFACTS_PER_REQUEST) {
    throw new Error(`Artifact catalog cannot contain more than ${MAX_ARTIFACTS_PER_REQUEST} artifacts`);
  }

  return Object.fromEntries(
    entries.map(([id, artifact]) => {
      if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
        throw new Error(`Artifact ${id} is invalid`);
      }
      const normalized = normalizeRuneLayoutArtifact(
        { ...(artifact as RuneLayoutSourceInput), id },
        id,
      );
      return [normalized.id, normalized];
    }),
  );
}

export function compactArtifactReference(artifact: RuneLayoutArtifact): RuneLayoutReference {
  return {
    id: artifact.id,
    title: artifact.title,
    summary: artifact.summary.slice(0, MAX_SUMMARY_LENGTH),
    version: 1,
  };
}

export function compactArtifactMarker(artifact: RuneLayoutArtifact): string {
  const reference = compactArtifactReference(artifact);
  return `[Rune layout artifact ${reference.id}: ${reference.title} — ${reference.summary}]`;
}

export function catalogFromArtifacts(artifacts: RuneLayoutArtifact[]): RuneLayoutCatalog {
  return validateArtifactCatalog(Object.fromEntries(artifacts.map((artifact) => [artifact.id, artifact])));
}

function extractTitle(source: string): { title: string; source: string } {
  const comment = source.match(/<!--\s*(?:rune-)?title:\s*([^\n]*?)\s*-->/i);
  const tag = source.match(/<title>([\s\S]*?)<\/title>/i);
  const attribute = source.match(/(?:rune-|r-)?title=["']([^"']+)["']/i);
  const match = comment ?? tag ?? attribute;
  let cleaned = source;
  if (comment) cleaned = cleaned.replace(comment[0], "");
  if (tag) cleaned = cleaned.replace(tag[0], "");
  return { title: match?.[1]?.trim() || "Rune Visual Layout", source: cleaned };
}

export function convertLegacyLayout(
  part: LegacyRuneLayoutPart | string,
  id: string = createId(),
): RuneLayoutArtifact {
  const original = typeof part === "string" ? part : part.text;
  const { title, source } = extractTitle(original);
  const styles: string[] = [];
  const scripts: string[] = [];
  const markup = source
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, body: string) => {
      styles.push(body);
      return "";
    })
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_match, body: string) => {
      scripts.push(body);
      return "";
    })
    .trim();

  return normalizeRuneLayoutArtifact({
    id,
    title,
    summary: `Legacy layout: ${title}`.slice(0, MAX_SUMMARY_LENGTH),
    markup: markup || "<p>This legacy layout has no visible markup.</p>",
    css: styles.join("\n").trim() || undefined,
    script: scripts.join("\n").trim() || undefined,
  });
}
