import { useEffect, useState } from "react";
import { formatTimeAgo } from "./utils";

export default function WakatimeStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/wakatime.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json?.fetchedAt) setLastUpdated(new Date(json.fetchedAt));
        if (!cancelled) setData(json);
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
    <section aria-labelledby="wakatime-stats-title" className="mt-16 md:mt-20">
      <div className="text-center mb-8">
        <h2
          id="wakatime-stats-title"
          className="text-3xl md:text-4xl font-header font-semibold tracking-tight mb-2"
        >
          Coding Activity
        </h2>
        <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full mb-4" />
        <p className="text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            WakaTime
          </a>
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatTimeAgo(lastUpdated)} • Updates every 12 hours
          </p>
        )}
      </div>

      {loading && <WakatimeSkeleton />}
      {!loading && error && <ConnectCard />}
      {!loading && !error && data && (
        <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Languages
            </div>
            <div className="text-xs text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
              last 7 days
            </div>
          </div>
          {(data.languages ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
          <ul className="space-y-3" role="list">
            {(data.languages ?? []).map((item) => (
              <BarRow key={item.name} item={item} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function BarRow({ item }) {
  const pct = Math.min(100, Math.max(0, item.percent ?? 0));
  return (
    <li>
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-sm font-medium text-foreground truncate min-w-0 flex-1">
          {item.name}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {item.text}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        role="presentation"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function WakatimeSkeleton() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg animate-pulse">
      <div className="h-3 w-20 bg-muted rounded mb-3" aria-hidden="true" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <div className="h-3 w-24 bg-muted rounded" aria-hidden="true" />
              <div className="h-3 w-12 bg-muted rounded" aria-hidden="true" />
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-sm font-medium mb-2">WakaTime data unavailable</div>
      <p className="text-sm text-muted-foreground">
        Add a <code className="text-primary">WAKATIME_API_KEY</code> secret to
        GitHub Actions to enable live coding activity stats.
      </p>
    </div>
  );
}
