import { marked } from "marked";

// GFM gives us tables, strikethrough, and autolinks for free. We tokenize with
// the lexer (rather than rendering to an HTML string) so the React renderer in
// MarkdownContent.jsx can keep using the rich CodeBlock component for fenced
// code instead of dangerouslySetInnerHTML.
marked.setOptions({ gfm: true, breaks: false });

// Parse the `---` frontmatter block on a TIL note. The build script emits this
// frontmatter as simple `key: value` scalars, so a line parser is enough — no
// YAML dependency needed in the browser.
export function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { data: {}, body: normalized };
  }

  const data = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    if (!key) continue;

    data[key] = line.slice(separator + 1).trim();
  }

  return { data, body: match[2] };
}

// Returns marked's top-level token list. MarkdownContent renders these directly.
export function parseMarkdown(body) {
  return marked.lexer(body.trim());
}

export function calculateReadingTime(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}
