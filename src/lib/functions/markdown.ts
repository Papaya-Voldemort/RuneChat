import { marked } from "marked";
import DOMPurify from "dompurify";

function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...');
}

export function renderMarkdown(md: string) {
  const html = marked.parse(normalizeText(md), { async: false }) as string;
  return DOMPurify.sanitize(html);
}