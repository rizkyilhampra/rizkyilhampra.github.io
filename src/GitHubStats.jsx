import { useState, useEffect } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { formatTimeAgo } from "./utils";

const catppuccinTheme = {
  light: ["#e6e9ef", "#c5a0e4", "#a374d5", "#8148c4", "#6c3fa3"],
  dark: ["#313244", "#4a3780", "#7047b0", "#9065d8", "#cba6f7"],
};

export default function GitHubStats() {
  const [colorScheme, setColorScheme] = useState("light");
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
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

  // Load manifest on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/github-manifest.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setAvailableYears(json.years ?? []);
          setLastUpdated(json.fetchedAt ? new Date(json.fetchedAt) : null);
          const currentYear = new Date().getFullYear();
          const defaultYear = (json.years ?? []).includes(currentYear)
            ? currentYear
            : (json.years ?? []).at(-1) ?? null;
          setSelectedYear(defaultYear);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load contributions for selected year
  useEffect(() => {
    if (selectedYear === null) return;
    let cancelled = false;
    setLoading(true);
    setContributions(null);
    (async () => {
      try {
        const res = await fetch(`/github-${selectedYear}.json`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
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
  }, [selectedYear]);

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

      {availableYears.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedYear === year
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 sm:p-6 bg-card border border-border rounded-lg overflow-x-auto flex justify-center">
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
            labels={{
              totalCount: selectedYear
                ? `{{count}} contributions in ${selectedYear}`
                : "{{count}} contributions",
            }}
          />
        )}
      </div>
    </section>
  );
}
