import { useState, useEffect } from "react";
import ActivityCalendar from "react-activity-calendar";

const CACHE_KEY = "github_contributions_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const API_URL =
  "https://github-contributions-api.jogruber.de/v4/rizkyilhampra?y=last";

const catppuccinTheme = {
  light: ["#e6e9ef", "#c5a0e4", "#a374d5", "#8148c4", "#6c3fa3"],
  dark: ["#313244", "#4a3780", "#7047b0", "#9065d8", "#cba6f7"],
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
  } catch {
    // storage quota exceeded — silently skip
  }
}

export default function GitHubStats() {
  const [colorScheme, setColorScheme] = useState("light");
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch with 24-hour localStorage cache
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = readCache();
      if (cached) {
        if (!cancelled) {
          setContributions(cached);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json.contributions;
        writeCache(data);
        if (!cancelled) setContributions(data);
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
