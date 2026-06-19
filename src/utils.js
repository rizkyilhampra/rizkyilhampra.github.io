// Builds an onClick handler for an internal <a> that intercepts the click and
// routes through the SPA navigator instead of doing a full page load. Keeps the
// `href` working (real link, opens in new tab, no-JS fallback) while upgrading
// the in-page click. Returns a `(to) => (event) => void` factory.
export function navHandler(onNavigate) {
  return (to) => (event) => {
    event.preventDefault();
    onNavigate(to);
  };
}

export function formatTimeAgo(date) {
  const diffMs = Date.now() - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
