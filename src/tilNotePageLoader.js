import { lazy } from "react";

// Shared dynamic import so the lazy component and the prefetch helpers all
// reuse a single in-flight/resolved chunk promise. The TilNotePage chunk is
// heavy (it pulls in the syntax-highlighter-laden MarkdownContent renderer).
let modulePromise;

function importTilNotePage() {
  if (!modulePromise) {
    modulePromise = import("./TilNotePage");
  }
  return modulePromise;
}

export const TilNotePage = lazy(() =>
  importTilNotePage().then((module) => ({ default: module.TilNotePage }))
);

export function prefetchTilNotePage() {
  importTilNotePage();
}
