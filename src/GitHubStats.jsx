import { useState, useEffect } from "react";
import ActivityCalendar from "react-activity-calendar";

const catppuccinTheme = {
  light: ["#e6e9ef", "#c5a0e4", "#a374d5", "#8148c4", "#6c3fa3"],
  dark: ["#313244", "#4a3780", "#7047b0", "#9065d8", "#cba6f7"],
};

export default function GitHubStats() {
  const [colorScheme, setColorScheme] = useState("light");
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sync colorScheme with theme toggle
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setColorScheme(saved === "dark" ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setColorScheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/github.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json?.fetchedAt) {
          setLastUpdated(new Date(json.fetchedAt));
        } else {
          const lastModified = res.headers.get("last-modified");
          if (lastModified) setLastUpdated(new Date(lastModified));
        }

        if (!cancelled) setContributions(json.contributions);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="github-stats-title" className="mt-16 md:mt-20">
      <div className="text-center mb-8">
        <h2
          id="github-stats-title"
          className="text-3xl md:text-4xl font-header font-semibold tracking-tight mb-2"
        >
          GitHub Activity
        </h2>
        <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full mb-4" />
        <p className="text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://github.com/rizkyilhampra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatTimeAgo(lastUpdated)} • Updates every 24 hours
          </p>
        )}
      </div>
      <div className="p-4 sm:p-6 bg-card border border-border rounded-lg overflow-x-auto">
        {error ? (
          <p className="text-sm text-muted-foreground">
            Could not load GitHub contributions.
          </p>
        ) : (
          <ActivityCalendar
            data={contributions ?? []}
            loading={loading}
            colorScheme={colorScheme}
            theme={catppuccinTheme}
            maxLevel={4}
            showColorLegend
            labels={{ totalCount: "{{count}} contributions in the last year" }}
          />
        )}
      </div>
    </section>
  );
}

function formatTimeAgo(date) {
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
