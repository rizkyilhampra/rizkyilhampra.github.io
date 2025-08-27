import { useEffect, useState } from "react";

export default function MonkeytypeStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/monkeytype.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
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
    <section aria-labelledby="typing-stats-title" className="mt-16">
      <div className="text-center mb-6">
        <h2 id="typing-stats-title" className="text-2xl font-semibold">Typing Stats</h2>
        <p className="text-sm text-muted-foreground">Powered by Monkeytype</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && (
          <SkeletonCard title="Best 60s WPM" />
        )}

        {!loading && error && (
          <ConnectCard />
        )}

        {!loading && !error && data && (
          <>
            <StatCard
              label="Best 60s WPM"
              value={data?.pbs?.time60?.wpm ?? "—"}
              sub={`${fmtAcc(data?.pbs?.time60?.acc)} acc`}
            />
            <StatCard
              label="Best 15s WPM"
              value={data?.pbs?.time15?.wpm ?? "—"}
              sub={`${fmtAcc(data?.pbs?.time15?.acc)} acc`}
            />
            <StatCard
              label="Avg WPM (last 20)"
              value={avgWpm(data?.recent) ?? "—"}
              sub={`${fmtAcc(avgAcc(data?.recent))} acc`}
            >
              <Sparkline points={(data?.recent || []).map(r => r.wpm)} />
            </StatCard>
            <StatCard
              label="Total Tests"
              value={data?.summary?.tests ?? "—"}
              sub={`Time typing: ${fmtDuration(data?.summary?.timeTyping)}`}
            />
          </>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, sub, children }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
      {sub && <div className="text-sm text-muted-foreground mt-1">{sub}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function SkeletonCard({ title = "Loading" }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg animate-pulse">
      <div className="h-3 w-24 bg-muted rounded mb-2" aria-hidden />
      <div className="h-8 w-16 bg-muted rounded" aria-hidden />
      <div className="h-3 w-20 bg-muted rounded mt-2" aria-hidden />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-sm mb-2">Connect your Monkeytype account</div>
      <p className="text-sm text-muted-foreground">
        Add a GitHub Action to fetch stats into <code>monkeytype.json</code> using a secret API key. See project README for setup.
      </p>
    </div>
  );
}

function fmtAcc(acc) {
  if (acc === undefined || acc === null) return "—";
  const pct = typeof acc === "number" && acc <= 1 ? acc * 100 : acc;
  return `${pct.toFixed(1)}%`;
}

function avgWpm(results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const sum = results.reduce((s, r) => s + (r.wpm || 0), 0);
  return Math.round(sum / results.length);
}

function avgAcc(results) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const sum = results.reduce((s, r) => s + (r.acc || 0), 0);
  const avg = sum / results.length;
  return fmtAcc(avg);
}

function fmtDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

function Sparkline({ points = [] }) {
  if (!points.length) return null;
  const width = 120;
  const height = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="text-primary">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

