import { lazy } from "react";

// Shared dynamic import so the lazy component and the prefetch helpers all
// reuse a single in-flight/resolved chunk promise.
let modulePromise;

export function importBlogPostPage() {
  if (!modulePromise) {
    modulePromise = import("./BlogPostPage");
  }
  return modulePromise;
}

export const BlogPostPage = lazy(() =>
  importBlogPostPage().then((module) => ({ default: module.BlogPostPage }))
);

// Warm the (heavy, syntax-highlighter-laden) BlogPostPage chunk before the
// user clicks, so opening a post doesn't blank while the chunk downloads.
export function prefetchBlogPostPage() {
  importBlogPostPage();
}
