/**
 * Transform "Today I Learned" Obsidian notes into site content.
 *
 * Reads markdown notes from GARDEN_SOURCE_DIR, keeps only `publish: true` notes,
 * rewrites their Obsidian frontmatter into the app's simple frontmatter, and
 * writes:
 *   public/til/<slug>.md   → { slug, title, date, tags } frontmatter + body
 *   public/til-manifest.json → { notes: [{ slug, title, date, tags, description }], fetchedAt }
 *
 * Source acquisition is decoupled from this script: locally, point
 * GARDEN_SOURCE_DIR at the Obsidian vault's til/ dir; in CI, point it at a
 * shallow sparse clone of the public notes repo (see update-til.yml).
 *
 * Env vars:
 *   GARDEN_SOURCE_DIR  (required) directory of *.md notes to transform
 *   GARDEN_OUT_DIR     (default: public) site output directory
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { extractDescription } from './garden-text.mjs';

const SOURCE_DIR = process.env.GARDEN_SOURCE_DIR;
const OUT_DIR = process.env.GARDEN_OUT_DIR || 'public';
const TIL_DIR = path.join(OUT_DIR, 'til');
const SITE_URL = 'https://rizkyilhampra.dev';

if (!SOURCE_DIR) {
  console.error('GARDEN_SOURCE_DIR is required (path to the til/ notes directory)');
  process.exit(1);
}

const sourceStat = await fs.stat(SOURCE_DIR).catch(() => null);
if (!sourceStat || !sourceStat.isDirectory()) {
  console.error(`GARDEN_SOURCE_DIR is not a directory: ${SOURCE_DIR}`);
  process.exit(1);
}

const entries = await fs.readdir(SOURCE_DIR);
const markdownFiles = entries.filter(
  (name) => name.endsWith('.md') && name !== 'index.md'
);

// Pass 1: collect every published note and build a lookup table so [[wikilinks]]
// between notes can be resolved to /til/<slug> internal links in pass 2. Reads
// are independent, so run them concurrently.
const rawContents = await Promise.all(
  markdownFiles.map((fileName) =>
    fs.readFile(path.join(SOURCE_DIR, fileName), 'utf8')
  )
);

const published = [];
const seenSlugs = new Set();
const linkTargets = new Map(); // normalized reference -> slug

markdownFiles.forEach((fileName, index) => {
  const { data, body } = parseFrontmatter(rawContents[index]);

  if (String(data.publish).toLowerCase() !== 'true') {
    return;
  }

  const slug = slugFromFileName(fileName);
  if (seenSlugs.has(slug)) {
    console.warn(`Skipping duplicate slug "${slug}" from ${fileName}`);
    return;
  }
  seenSlugs.add(slug);

  // normalizeRef strips paths and the timestamp prefix, so the filename base
  // alone resolves `[[til/<id>-name]]`, `[[<id>-name]]`, and `[[name]]`.
  const fileBase = fileName.replace(/\.md$/, '');
  for (const ref of [fileBase, data.title, ...toAliasList(data.aliases ?? data.alias)]) {
    if (ref) linkTargets.set(normalizeRef(ref), slug);
  }

  published.push({ data, body, slug });
});

// Start from a clean til/ directory so unpublished or deleted notes disappear.
await fs.rm(TIL_DIR, { recursive: true, force: true });
await fs.mkdir(TIL_DIR, { recursive: true });

// Pass 2: transform and write each published note (writes run concurrently).
const notes = await Promise.all(
  published.map(async ({ data, body, slug }) => {
    const { h1, body: withoutH1 } = splitLeadingH1(body);
    const cleanedBody = resolveWikilinks(withoutH1).trim();
    const title = (data.title || h1 || slug).trim();
    const date = toDate(data.created || data.modified || '');
    const tags = toTagList(data.tags);
    const description = extractDescription(cleanedBody);
    const readingTime = readingTimeOf(cleanedBody);
    // Outgoing internal links: every wikilink that resolved to a published note
    // is now a [text](/til/<slug>) markdown link. Collect them (minus self-links)
    // so the manifest can expose the backlink graph for the digital-garden UI.
    const links = collectInternalLinks(cleanedBody, slug);

    const frontmatter = [
      '---',
      `slug: ${slug}`,
      `title: ${title}`,
      `date: ${date}`,
      `tags: ${tags.join(', ')}`,
      `description: ${description}`,
      '---',
      '',
    ].join('\n');

    await fs.writeFile(
      path.join(TIL_DIR, `${slug}.md`),
      `${frontmatter}${cleanedBody}\n`
    );

    return { slug, title, date, tags, description, readingTime, links };
  })
);

notes.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// Invert the outgoing-link graph into backlinks (which notes link *to* this one),
// then drop the transient `links` field from the public manifest.
const backlinksBySlug = new Map();
for (const note of notes) {
  for (const target of note.links) {
    if (!backlinksBySlug.has(target)) backlinksBySlug.set(target, new Set());
    backlinksBySlug.get(target).add(note.slug);
  }
}

const manifestNotes = notes.map(({ links, ...note }) => ({
  ...note,
  backlinks: [...(backlinksBySlug.get(note.slug) ?? [])],
}));

// Tag aggregate (tag -> count), most-used first, for the tag-browsing pages.
const tagCounts = new Map();
for (const note of notes) {
  for (const tag of note.tags) {
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
}
const tags = [...tagCounts.entries()]
  .map(([tag, count]) => ({ tag, count }))
  .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));

const manifest = { notes: manifestNotes, tags, fetchedAt: new Date().toISOString() };
await fs.writeFile(
  path.join(OUT_DIR, 'til-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

await writeSitemap(notes, tags);

console.log(`Wrote ${notes.length} published TIL note(s) to ${TIL_DIR}`);
console.log(`Wrote manifest to ${path.join(OUT_DIR, 'til-manifest.json')}`);
console.log(`Wrote sitemap to ${path.join(OUT_DIR, 'sitemap.xml')}`);

// Regenerate the sitemap so the homepage, the TIL index, and every published
// note are discoverable. lastmod is tied to note dates, so the file only
// changes when content does (keeps it in step with the update workflow's diff).
async function writeSitemap(noteList, tagList = []) {
  const latest = noteList[0]?.date || new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${SITE_URL}/`, lastmod: latest, changefreq: 'monthly', priority: '1.0' },
    { loc: `${SITE_URL}/til`, lastmod: latest, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_URL}/til/tags`, lastmod: latest, changefreq: 'weekly', priority: '0.5' },
    ...tagList.map(({ tag }) => ({
      loc: `${SITE_URL}/til/tags/${encodeURIComponent(tag)}`,
      lastmod: latest,
      changefreq: 'weekly',
      priority: '0.5',
    })),
    ...noteList.map((note) => ({
      loc: `${SITE_URL}/til/${note.slug}`,
      lastmod: note.date || latest,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];

  const body = urls
    .map(
      ({ loc, lastmod, changefreq, priority }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), xml);
}

// --- helpers ---------------------------------------------------------------

// Parse Obsidian frontmatter, supporting scalars, inline `[a, b]` lists, and
// block lists (`tags:` followed by `  - item` lines).
function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: normalized };
  }

  const data = {};
  const lines = match[1].split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const key = fieldMatch[1];
    let value = fieldMatch[2].trim();

    if (value === '') {
      // Possible block list on the following indented `  - item` lines.
      const items = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        items.push(lines[i + 1].replace(/^\s*-\s+/, '').trim());
        i += 1;
      }
      data[key] = items.length > 0 ? items : '';
    } else if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      data[key] = stripQuotes(value);
    }
  }

  return { data, body: match[2] };
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, '');
}

function slugFromFileName(fileName) {
  return fileName.replace(/\.md$/, '').replace(/^\d+-/, '');
}

function toAliasList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

// Normalize a wikilink reference for lookup: drop path, `.md`, `#section`, the
// leading timestamp, and casing.
function normalizeRef(ref) {
  return String(ref)
    .split('#')[0]
    .split('/')
    .pop()
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .trim()
    .toLowerCase();
}

// Convert Obsidian wikilinks to markdown. Embeds (![[...]]) are dropped since
// attachments aren't published; [[target|label]] becomes an internal link when
// the target resolves to a published note, otherwise just its label text.
function resolveWikilinks(body) {
  return body.replace(/(!?)\[\[([^\]]+)\]\]/g, (_match, bang, inner) => {
    if (bang === '!') return '';

    const [target, label] = inner.split('|');
    const text = (label ?? target.split('/').pop().replace(/^\d+-/, '')).trim();
    const slug = linkTargets.get(normalizeRef(target));

    return slug ? `[${text}](/til/${slug})` : text;
  });
}

// Collect the unique slugs this note links to via resolved [text](/til/<slug>)
// markdown links, excluding self-references.
function collectInternalLinks(body, selfSlug) {
  const slugs = new Set();
  const re = /\]\(\/til\/([^)#\s]+)\)/g;
  let match;
  while ((match = re.exec(body)) !== null) {
    const target = match[1];
    if (target && target !== selfSlug) slugs.add(target);
  }
  return [...slugs];
}

// Splits off a leading `# Heading` in one pass: returns its plain-text (for the
// title fallback) and the body without it (it duplicates the frontmatter title).
function splitLeadingH1(body) {
  const lines = body.replace(/^\n+/, '').split('\n');
  const match = lines[0]?.match(/^#\s+(.+)$/);
  if (!match) {
    return { h1: '', body };
  }
  return { h1: toPlainText(match[1]), body: lines.slice(1).join('\n') };
}

function toDate(value) {
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function toTagList(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

// Mirror of src/markdown.js calculateReadingTime so the manifest carries a
// ready-to-show "N min read" for list views (~200 wpm).
function readingTimeOf(body) {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

// extractDescription / toPlainText live in ./garden-text.mjs (shared with the
// local description regenerator).
