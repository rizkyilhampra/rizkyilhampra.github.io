// Smoothly scrolls to an anchor by id (footnote refs, TOC entries). The SPA
// sets `history.scrollRestoration = "manual"` (see App.jsx) and only listens
// for popstate, so native hash-link scrolling is unreliable; doing it
// explicitly guarantees the superscript → footnote, back-link → reference,
// and TOC → heading jumps all work. We replaceState the hash (no new history
// entry) so the URL stays shareable without disturbing the SPA's
// scroll-position tracking.
export function scrollToId(targetId, event) {
  const el = document.getElementById(targetId);
  if (!el) return;
  event.preventDefault();
  const reducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  )?.matches;
  el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", `#${targetId}`);
  }
}
