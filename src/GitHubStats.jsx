import { useState, useEffect } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { SectionHeading } from "./SectionHeading";
import { formatTimeAgo } from "./utils";
import { useWheelHorizontalScroll } from "./useWheelHorizontalScroll";
import { fetchJsonCached, getCached, setCached } from "./statsCache";

// Evergreen contribution ramp matching the "Garden ink" accent.
const calendarTheme = {
  light: ["#eceee9", "#bcd9c7", "#86bd9f", "#52996f", "#2f6f4f"],
  dark: ["#1b1e20", "#274434", "#356b4f", "#4f9a72", "#7fbf9b"],
};

const MANIFEST_URL = "/github-manifest.json";
const contribKey = (year) => `github-contrib:${year}`;

export default function GitHubStats({ className = "mt-16 md:mt-20" }) {
  const cachedManifest = getCached(MANIFEST_URL);
  const cachedContrib = getCached(contribKey("last-year"));
  const [colorScheme, setColorScheme] = useState("light");
  const [availableYears, setAvailableYears] = useState(
    cachedManifest?.years ?? []
  );
  const [selectedYear, setSelectedYear] = useState("last-year");
  const [contributions, setContributions] = useState(cachedContrib ?? null);
  const [loading, setLoading] = useState(!cachedContrib);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(
    cachedManifest?.fetchedAt ? new Date(cachedManifest.fetchedAt) : null
  );
  const scrollRef = useWheelHorizontalScroll();

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
    if (getCached(MANIFEST_URL)) return; // already have it — skip the fetch
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchJsonCached(MANIFEST_URL);
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

    // Serve from cache without flashing the calendar's loading state
    const hit = getCached(contribKey(selectedYear));
    if (hit) {
      setContributions(hit);
      setLoading(false);
      return;
    }

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
            relevantYears.map((y) => fetchJsonCached(`/github-${y}.json`))
          );
          if (!cancelled) {
            const merged = results
              .flatMap((r) => r.contributions)
              .filter((c) => c.date >= cutoffStr && c.date <= todayStr)
              .sort((a, b) => a.date.localeCompare(b.date));
            setCached(contribKey(selectedYear), merged);
            setContributions(merged);
          }
        } else {
          const json = await fetchJsonCached(`/github-${selectedYear}.json`);
          if (!cancelled) {
            setCached(contribKey(selectedYear), json.contributions);
            setContributions(json.contributions);
          }
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
    <section aria-labelledby="github-stats-title" className={className}>
      <SectionHeading
        eyebrow="~/github"
        title="GitHub Activity"
        id="github-stats-title"
      >
        Powered by{" "}
        <a
          href="https://github.com/rizkyilhampra"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-primary"
        >
          GitHub
        </a>
        {lastUpdated && (
          <span> · updated {formatTimeAgo(lastUpdated)} · every 24 hours</span>
        )}
      </SectionHeading>

      <div className="flex-1">
        <div className="flex h-full flex-col sm:flex-row gap-4">
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
          <div
            ref={scrollRef}
            className="github-activity-scroll overflow-x-auto min-w-0 flex-1 pb-3"
          >
            {/* w-max + mx-auto centers the calendar when it fits and stays
                fully scrollable when it overflows (avoids the justify-center
                horizontal-overflow clipping bug). */}
            <div className="w-max mx-auto flex items-center min-h-full">
              {error ? (
                <p className="text-sm text-muted-foreground">
                  Could not load GitHub contributions.
                </p>
              ) : (
                <ActivityCalendar
                  data={contributions ?? []}
                  loading={loading}
                  colorScheme={colorScheme}
                  theme={calendarTheme}
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
      </div>
    </section>
  );
}
