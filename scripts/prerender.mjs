import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  calculateReadingTime,
  parseFrontmatter,
  parseMarkdown,
} from "../src/markdown.js";
import {
  getMetadataMetaFields,
  getRouteMetadata,
  normalizePath,
  resolveRoute,
} from "../src/routeMetadata.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const serverDir = path.join(rootDir, "dist-ssr");
const publicDir = path.join(rootDir, "public");
const require = createRequire(import.meta.url);

const template = await fs.readFile(path.join(distDir, "index.html"), "utf8");
const manifest = JSON.parse(
  await fs.readFile(path.join(publicDir, "til-manifest.json"), "utf8")
);
const notes = await Promise.all(
  (manifest.notes ?? []).map(async (summary) => {
    const raw = await fs.readFile(path.join(publicDir, "til", `${summary.slug}.md`), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const { tokens, footnotes } = parseMarkdown(body);
    return {
      slug: summary.slug,
      title: data.title ?? summary.title ?? summary.slug,
      date: data.date ?? summary.date ?? "",
      tags: data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : summary.tags ?? [],
      description: data.description ?? summary.description ?? "",
      readingTime: summary.readingTime ?? calculateReadingTime(body),
      content: tokens,
      footnotes,
    };
  })
);

await fs.writeFile(
  path.join(serverDir, "package.json"),
  JSON.stringify({ type: "commonjs" })
);
const serverBundle = await findServerBundle(serverDir);
if (!serverBundle) {
  throw new Error(`Could not locate the prerender bundle in ${serverDir}.`);
}
const renderer = require(serverBundle);
const renderRoute = renderer.renderRoute ?? renderer.default?.renderRoute ?? renderer.default;
if (typeof renderRoute !== "function") {
  throw new Error("The prerender bundle does not export renderRoute().");
}

await fs.rm(path.join(distDir, "til"), { recursive: true, force: true });
await fs.cp(path.join(publicDir, "til"), path.join(distDir, "til"), {
  recursive: true,
});

const routes = [
  { path: "/" },
  { path: "/til" },
  { path: "/til/tags" },
  ...(manifest.tags ?? []).map(({ tag }) => ({
    path: `/til/tags/${encodeURIComponent(tag)}`,
  })),
  ...notes.map((note) => ({ path: `/til/${note.slug}`, note })),
];
const sharedRouteData = {
  notes: manifest.notes ?? [],
  tags: manifest.tags ?? [],
};

validateRoutes(routes, manifest);

await Promise.all(
  routes.map(async (route) => {
    const routePath = normalizePath(route.path);
    const routeData = { ...sharedRouteData, path: routePath, note: route.note };
    const metadata = getRouteMetadata(routePath, {
      notes: sharedRouteData.notes,
      tags: sharedRouteData.tags,
      note: route.note,
    });
    const markup = renderRoute({ path: routePath, routeData });
    const html = injectRoute(template, { metadata, markup, routeData });
    const output = path.join(distDir, outputPath(routePath));
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, html);
  })
);

console.log(`Prerendered ${routes.length} public route(s).`);

function outputPath(routePath) {
  if (routePath === "/") return "index.html";
  return path.join(...routePath.slice(1).split("/"), "index.html");
}

function injectRoute(html, { metadata, markup, routeData }) {
  const seo = buildSeoBlock(metadata);
  const serializedRouteData = JSON.stringify(routeData).replace(/</g, "\\u003c");
  const root = `<div id="root">${markup}</div><script>window.__PRERENDERED_ROUTE__=${serializedRouteData};</script>`;

  const seoStart = html.indexOf("<title");
  const seoEnd = html.search(/<link rel=icon\b|<link rel="icon"\b/);
  if (seoStart === -1 || seoEnd === -1) {
    throw new Error("Could not find the SEO section in the client HTML template.");
  }

  return `${html.slice(0, seoStart)}${seo}${html.slice(seoEnd)}`.replace(
    /<div id=root><\/div>|<div id="root"><\/div>/,
    () => root
  );
}

function buildSeoBlock(metadata) {
  const escape = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const metaTags = getMetadataMetaFields(metadata)
    .map(
      ([attribute, value, content]) =>
        `<meta ${attribute}="${value}" content="${escape(content)}" />`
    )
    .join("\n    ");
  const schema = JSON.stringify(metadata.schemas).replace(/</g, "\\u003c");

  return `<!-- SEO:START -->
    <title>${escape(metadata.title)}</title>
    ${metaTags}
    <meta name="author" content="Rizky Ilham Pratama" />
    <link rel="canonical" href="${escape(metadata.canonical)}" />
    <meta property="og:site_name" content="Rizky Ilham Pratama" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:site" content="@rizkyilhampra" />
    <meta name="twitter:creator" content="@rizkyilhampra" />
    <script id="route-structured-data" type="application/ld+json">${schema}</script>
    <!-- SEO:END -->`;
}

function validateRoutes(routes, sourceManifest) {
  const outputs = new Set();
  const noteSlugs = new Set((sourceManifest.notes ?? []).map((note) => note.slug));
  const tagNames = new Set((sourceManifest.tags ?? []).map(({ tag }) => tag));

  for (const route of routes) {
    const routePath = normalizePath(route.path);
    const resolved = resolveRoute(routePath);
    const output = outputPath(routePath);

    if (outputs.has(output)) {
      throw new Error(`Duplicate prerender output path: ${output}`);
    }
    outputs.add(output);

    if (resolved.type === "note") {
      if (!route.note || route.note.slug !== resolved.slug || !noteSlugs.has(resolved.slug)) {
        throw new Error(`Invalid note route: ${routePath}`);
      }
    } else if (resolved.type === "tag" && !tagNames.has(resolved.tag)) {
      throw new Error(`Invalid tag route: ${routePath}`);
    } else if (!["home", "til-index", "tags-index", "tag"].includes(resolved.type)) {
      throw new Error(`Unsupported prerender route: ${routePath}`);
    }
  }
}

async function findServerBundle(directory) {
  const bundle = path.join(directory, "prerender.js");
  const stats = await fs.stat(bundle).catch(() => null);

  if (!stats?.isFile()) {
    throw new Error(`Could not find Farm's prerender entry bundle at ${bundle}.`);
  }

  return bundle;
}
