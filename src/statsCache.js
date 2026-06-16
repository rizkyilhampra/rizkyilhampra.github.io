// Module-level cache so stats data survives route remounts. Without this, every
// time the homepage remounts (e.g. navigating back from a blog post) each widget
// would reset to loading: true and re-fetch, flashing its skeleton again.
//
// We cache both the resolved value (for synchronous reads during render — this is
// what avoids the one-frame skeleton flash, since useEffect runs after paint) and
// the in-flight promise (so concurrent mounts share a single request).
const valueCache = new Map();
const promiseCache = new Map();

// Synchronous peek — returns the cached value, or undefined if not loaded yet.
export function getCached(key) {
  return valueCache.get(key);
}

// Store a computed/derived value under an arbitrary key (used by GitHubStats for
// its merged "last-year" contributions, which aren't a single fetched file).
export function setCached(key, value) {
  valueCache.set(key, value);
}

// Fetch + parse JSON once per URL, caching the result. A failed request is not
// cached, so a later mount can retry instead of being stuck on the error.
export function fetchJsonCached(url) {
  if (promiseCache.has(url)) return promiseCache.get(url);

  const promise = fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      valueCache.set(url, json);
      return json;
    })
    .catch((err) => {
      promiseCache.delete(url);
      throw err;
    });

  promiseCache.set(url, promise);
  return promise;
}
