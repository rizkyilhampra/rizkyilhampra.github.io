import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const manifest = JSON.parse(
  await fs.readFile(path.join(rootDir, "public", "til-manifest.json"), "utf8")
);

const routes = [
  "/",
  "/til",
  "/til/tags",
  ...(manifest.tags ?? []).map(({ tag }) => `/til/tags/${encodeURIComponent(tag)}`),
  ...(manifest.notes ?? []).map(({ slug }) => `/til/${slug}`),
];

for (const requiredFile of [
  "404.html",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  "til-manifest.json",
]) {
  await assertFile(path.join(distDir, requiredFile));
}

for (const { slug } of manifest.notes ?? []) {
  await assertFile(path.join(distDir, "til", `${slug}.md`));
}

for (const route of routes) {
  const htmlPath = path.join(distDir, outputPath(route));
  const html = await fs.readFile(htmlPath, "utf8").catch(() => null);
  if (!html) throw new Error(`Missing prerendered route: ${route}`);
  if (!html.includes('<div id="root">')) {
    throw new Error(`Route is missing root markup: ${route}`);
  }

  const routeData = extractRouteData(html, route);
  if (routeData.path !== route) {
    throw new Error(`Prerender payload path mismatch for ${route}: ${routeData.path}`);
  }

  const noteMatch = route.match(/^\/til\/([^/]+)$/);
  if (noteMatch && noteMatch[1] !== "tags" && routeData.note?.slug !== noteMatch[1]) {
    throw new Error(`Note preload mismatch for ${route}`);
  }

  await validateLocalAssets(html, route);
}

console.log(`Validated ${routes.length} prerendered route(s).`);

function outputPath(route) {
  if (route === "/") return "index.html";
  return path.join(...route.slice(1).split("/"), "index.html");
}

function extractRouteData(html, route) {
  const match = html.match(/<script>window\.__PRERENDERED_ROUTE__=(.*?)<\/script>/s);
  if (!match) throw new Error(`Missing prerender payload for ${route}`);

  try {
    return JSON.parse(match[1].replace(/;$/, ""));
  } catch (error) {
    throw new Error(`Invalid prerender payload for ${route}: ${error.message}`);
  }
}

async function validateLocalAssets(html, route) {
  const references = html.matchAll(/<(?:script|link)\b[^>]+(?:src|href)="([^"]+)"/g);

  for (const [, reference] of references) {
    if (/^(?:https?:|data:|#)/.test(reference)) continue;

    const url = new URL(reference, `https://artifact.invalid${route === "/" ? "/" : `${route}/`}`);
    await assertFile(path.join(distDir, decodeURIComponent(url.pathname)));
  }
}

async function assertFile(filePath) {
  const stats = await fs.stat(filePath).catch(() => null);
  if (!stats?.isFile()) {
    throw new Error(`Missing deployment artifact: ${path.relative(distDir, filePath)}`);
  }
}
