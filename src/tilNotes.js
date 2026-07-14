import { fetchJsonCached, getCached } from "./statsCache";
import {
  calculateReadingTime,
  parseFrontmatter,
  parseMarkdown,
} from "./markdown";

const MANIFEST_URL = "/til-manifest.json";
const notePromiseCache = new Map();
let manifestNotesPromise;
let manifestTagsPromise;

// The list of TIL notes is generated at build time (scripts/fetch-garden.mjs)
// into til-manifest.json. Memoized so `use(loadTilManifest())` sees a stable
// promise identity across renders.
export function loadTilManifest() {
  if (!manifestNotesPromise) {
    manifestNotesPromise = fetchJsonCached(MANIFEST_URL)
      .then((json) => json.notes ?? [])
      .catch((err) => {
        manifestNotesPromise = null;
        throw err;
      });
  }
  return manifestNotesPromise;
}

// The tag aggregate ([{ tag, count }]) is generated alongside the notes manifest.
// Memoized for stable promise identity under `use(loadTilTags())`.
export function loadTilTags() {
  if (!manifestTagsPromise) {
    manifestTagsPromise = fetchJsonCached(MANIFEST_URL)
      .then((json) => json.tags ?? [])
      .catch((err) => {
        manifestTagsPromise = null;
        throw err;
      });
  }
  return manifestTagsPromise;
}

// Synchronous manifest read for hover previews. Returns the note's metadata if
// the manifest is already cached, otherwise null (the caller can kick off a load
// and re-read once it resolves).
export function getNotePreview(slug) {
  const manifest = getCached(MANIFEST_URL);
  if (!manifest) return null;
  return (manifest.notes ?? []).find((note) => note.slug === slug) ?? null;
}

export function loadTilBySlug(slug) {
  if (notePromiseCache.has(slug)) return notePromiseCache.get(slug);

  const promise = fetch(`/til/${slug}.md`)
    .then((res) => {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Failed to load note: ${slug}`);
      return res.text();
    })
    .then((markdown) => {
      if (markdown === null) return null;

      const { data, body } = parseFrontmatter(markdown);
      const { tokens, footnotes } = parseMarkdown(body);

      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        content: tokens,
        footnotes,
        readingTime: calculateReadingTime(body),
        description: data.description ?? "",
      };
    })
    .catch((err) => {
      notePromiseCache.delete(slug);
      throw err;
    });

  notePromiseCache.set(slug, promise);
  return promise;
}
