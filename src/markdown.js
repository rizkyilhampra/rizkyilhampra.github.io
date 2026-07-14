import { marked } from "marked";

// GFM gives us tables, strikethrough, and autolinks for free. We tokenize with
// the lexer (rather than rendering to an HTML string) so the React renderer in
// MarkdownContent.jsx can keep using the rich CodeBlock component for fenced
// code instead of dangerouslySetInnerHTML.
marked.setOptions({ gfm: true, breaks: false });

// Footnote references (`[^id]`) aren't part of GFM, so `marked` leaves them as
// raw text. Register a small inline extension that tokenizes them into a custom
// `footnoteRef` token; MarkdownContent renders those as clickable superscripts.
// The footnote *definitions* (`[^id]: …`) are stripped from the body by
// splitFootnotes before lexing and rendered as a References list.
marked.use({
  extensions: [
    {
      name: "footnoteRef",
      level: "inline",
      start(src) {
        return src.indexOf("[^");
      },
      tokenizer(src) {
        const match = src.match(/^\[\^([^\]]+)\]/);
        if (match) {
          return {
            type: "footnoteRef",
            raw: match[0],
            id: match[1],
          };
        }
        return undefined;
      },
    },
  ],
});

// Matches a footnote definition line (`[^id]: text`). Continuation lines are
// indented (by spaces or a tab) and belong to the preceding definition.
const FOOTNOTE_DEF = /^\[\^([^\]]+)\]:\s?(.*)$/;

// Pulls footnote definitions out of a note body and returns the cleaned body
// plus an ordered list of footnote ids. Order follows first *reference*
// appearance in the body (the document-conventional numbering); definitions
// that are never referenced are still appended so nothing is lost.
function splitFootnotes(body) {
  const lines = body.split("\n");
  const definitions = new Map();
  const kept = [];
  let pendingId = null;

  for (const line of lines) {
    const defMatch = line.match(FOOTNOTE_DEF);
    if (defMatch) {
      pendingId = defMatch[1];
      definitions.set(pendingId, defMatch[2] ?? "");
      continue;
    }
    if (pendingId && (line.startsWith("    ") || line.startsWith("\t"))) {
      const previous = definitions.get(pendingId);
      definitions.set(pendingId, `${previous}\n${line.trim()}`.trim());
      continue;
    }
    pendingId = null;
    kept.push(line);
  }

  const cleanBody = kept.join("\n");
  const order = [];
  const seen = new Set();
  for (const match of cleanBody.matchAll(/\[\^([^\]]+)\]/g)) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  for (const id of definitions.keys()) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }

  return { cleanBody, definitions, order };
}

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

// Returns marked's top-level token list plus the extracted footnotes.
// MarkdownContent renders the tokens directly and appends the footnotes as a
// References list.
export function parseMarkdown(body) {
  const { cleanBody, definitions, order } = splitFootnotes(body);
  const tokens = marked.lexer(cleanBody.trim());
  const footnotes = order.map((id, index) => ({
    id,
    number: index + 1,
    text: definitions.get(id) ?? "",
  }));
  return { tokens, footnotes };
}

export function calculateReadingTime(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}
