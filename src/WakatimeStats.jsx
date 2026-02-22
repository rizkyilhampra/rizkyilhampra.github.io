import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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
          <Clock
            className="inline-block w-7 h-7 align-middle mr-2 text-primary"
            aria-hidden="true"
          />
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
      {!loading && !error && data && <WakatimeContent data={data} />}
    </section>
  );
}

function WakatimeContent({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total (last 7 days)"
          value={fmtDuration(data.totalSeconds)}
        />
        <StatCard
          label="Daily average"
          value={fmtDuration(data.dailyAverageSeconds)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BarChartCard title="Languages" items={data.languages ?? []} />
        <BarChartCard title="Projects" items={data.projects ?? []} />
      </div>

      {Array.isArray(data.editors) && data.editors.length > 0 && (
        <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
            Editors
          </div>
          <div className="flex flex-wrap gap-2">
            {data.editors.map((ed) => (
              <div
                key={ed.name}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-sm"
              >
                <span className="font-medium text-foreground">{ed.name}</span>
                <span className="text-muted-foreground text-xs">
                  {ed.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-2xl md:text-3xl font-semibold">{value}</div>
    </div>
  );
}

function BarChartCard({ title, items }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">No data</p>
      )}
      <ul className="space-y-3" role="list">
        {items.map((item) => (
          <BarRow key={item.name} item={item} />
        ))}
      </ul>
    </div>
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
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-lg">
            <div className="h-3 w-24 bg-muted rounded mb-2" aria-hidden="true" />
            <div className="h-8 w-20 bg-muted rounded" aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((col) => (
          <div
            key={col}
            className="p-4 bg-card border border-border rounded-lg"
          >
            <div
              className="h-3 w-20 bg-muted rounded mb-3"
              aria-hidden="true"
            />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <div className="h-3 w-24 bg-muted rounded" aria-hidden="true" />
                    <div className="h-3 w-12 bg-muted rounded" aria-hidden="true" />
                  </div>
                  <div
                    className="h-1.5 w-full bg-muted rounded-full"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-sm font-medium mb-2">
        WakaTime data unavailable
      </div>
      <p className="text-sm text-muted-foreground">
        Add a <code className="text-primary">WAKATIME_API_KEY</code> secret to
        GitHub Actions to enable live coding activity stats.
      </p>
    </div>
  );
}

function fmtDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
