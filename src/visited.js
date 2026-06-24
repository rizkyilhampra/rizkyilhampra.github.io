// Tracks which TIL notes the reader has opened, persisted in localStorage. The
// graph uses this to color visited note nodes brighter than unvisited ones —
// Quartz's signature digital-garden cue. All access is guarded so a blocked or
// unavailable storage (private mode, SSR) just degrades to "nothing visited".

const KEY = "til:visited";

export function getVisited() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

export function markVisited(slug) {
  if (!slug) return;
  try {
    const visited = getVisited();
    if (visited.has(slug)) return;
    visited.add(slug);
    window.localStorage.setItem(KEY, JSON.stringify([...visited]));
  } catch {
    // Storage unavailable — visited coloring just won't persist.
  }
}
