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
  const [selectedYear, setSelectedYear] = useState("last-year");
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
        }
      } catch (e) {
        if (!cancelled) setError(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load contributions for selected year (or last-year rolling window)
  useEffect(() => {
    if (availableYears.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setContributions(null);
    (async () => {
      try {
        if (selectedYear === "last-year") {
          const today = new Date();
          const cutoff = new Date(today);
          cutoff.setFullYear(cutoff.getFullYear() - 1);
          const cutoffStr = cutoff.toISOString().slice(0, 10);
          const todayStr = today.toISOString().slice(0, 10);

          // Fetch only the years that overlap the last-365-day window
          const relevantYears = availableYears.filter(
            (y) => y >= cutoff.getFullYear() && y <= today.getFullYear()
          );
          const results = await Promise.all(
            relevantYears.map((y) =>
              fetch(`/github-${y}.json`, { cache: "no-store" }).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
              })
            )
          );
          if (!cancelled) {
            const merged = results
              .flatMap((r) => r.contributions)
              .filter((c) => c.date >= cutoffStr && c.date <= todayStr)
              .sort((a, b) => a.date.localeCompare(b.date));
            setContributions(merged);
          }
        } else {
          const res = await fetch(`/github-${selectedYear}.json`, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!cancelled) setContributions(json.contributions);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedYear, availableYears]);

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

      <div className="p-4 sm:p-6 bg-card border border-border rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          {availableYears.length > 0 && (
            <div className="flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible shrink-0 sm:order-last sm:border-l sm:border-border sm:pl-4 pb-1 sm:pb-0">
              {[
                { label: "Last year", value: "last-year" },
                ...availableYears.slice(-3).reverse().map((y) => ({ label: String(y), value: y })),
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSelectedYear(value)}
                  className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors text-left ${
                    selectedYear === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="overflow-x-auto min-w-0 flex-1 flex justify-center">
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
                  totalCount:
                    selectedYear === "last-year"
                      ? "{{count}} contributions in the last year"
                      : `{{count}} contributions in ${selectedYear}`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
