import { useEffect, useState } from "react";

export default function MonkeytypeStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/monkeytype.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Prefer explicit timestamp from payload; fallback to Last-Modified header
        const fetchedAt = json?.fetchedAt;
        if (fetchedAt) {
          setLastUpdated(new Date(fetchedAt));
        } else {
          const lastModified = res.headers.get('last-modified');
          if (lastModified) {
            setLastUpdated(new Date(lastModified));
          }
        }

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
    <section aria-labelledby="typing-stats-title" className="mt-16 md:mt-20">
      <div className="text-center mb-8">
        <h2 id="typing-stats-title" className="text-3xl md:text-4xl font-header font-semibold tracking-tight mb-2">
          Typing Stats
          {/* {data?.profile?.data?.name && ( */}
          {/*   <> */}
          {/*     {' — '} */}
          {/*     <a */}
          {/*       href={`https://monkeytype.com/profile/${data.profile.data.name}`} */}
          {/*       target="_blank" */}
          {/*       rel="noopener noreferrer" */}
          {/*       className="text-primary hover:underline" */}
          {/*     > */}
          {/*       @{data.profile.data.name} */}
          {/*     </a> */}
          {/*   </> */}
          {/* )} */}
        </h2>
        <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full mb-4" />
        {/* {data?.profile?.data?.name && ( */}
        {/*   <p className="text-sm text-muted-foreground mb-1"> */}
        {/*     <a  */}
        {/*       href={`https://monkeytype.com/profile/${data.profile.data.name}`} */}
        {/*       target="_blank"  */}
        {/*       rel="noopener noreferrer" */}
        {/*       className="text-primary hover:underline" */}
        {/*     > */}
        {/*       @{data.profile.data.name} */}
        {/*     </a> */}
        {/*   </p> */}
        {/* )} */}
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <a
            href="https://monkeytype.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            MonkeyType
          </a>
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatTimeAgo(lastUpdated)} • Updates every 12 hours
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            {(() => {
              const recent = data?.recent || [];
              const wpmPoints = recent.map(r => r.wpm).filter(n => typeof n === 'number');
              const avg = avgWpm(recent);
              const last = wpmPoints.length ? wpmPoints[wpmPoints.length - 1] : null;
              const delta = last != null && avg != null ? last - avg : null;
              const tooltip = last != null && avg != null
                ? `Last WPM ${last}, ${fmtDelta(delta)} vs avg (${avg})`
                : undefined;
              const domain = normalizeDomain(wpmPoints);
              return (
                <StatCard
              label="Avg WPM (last 20)"
              value={avgWpm(data?.recent) ?? "—"}
              sub={`${fmtAcc(avgAcc(data?.recent))} acc`}
              meta={<DeltaBadge delta={delta} title={tooltip} />}
            >
              <span title={tooltip} tabIndex={0} className="outline-none focus:ring-2 focus:ring-primary/40 rounded-sm">
                <Sparkline points={wpmPoints} min={domain?.[0]} max={domain?.[1]} />
              </span>
            </StatCard>
              );
            })()}
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

function StatCard({ label, value, sub, children, meta }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-3xl md:text-4xl font-semibold">{value}</div>
          {meta}
        </div>
        {children && (
          <div className="ml-2 shrink-0" aria-hidden>
            {children}
          </div>
        )}
      </div>
      {sub && <div className="text-sm text-muted-foreground mt-1">{sub}</div>}
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
  const numAcc = typeof acc === "string" ? parseFloat(acc) : acc;
  if (typeof numAcc !== "number" || isNaN(numAcc)) return "—";
  const pct = numAcc <= 1 ? numAcc * 100 : numAcc;
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
  return avg;
}

function fmtDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtDelta(delta) {
  if (delta == null || Number.isNaN(delta)) return "—";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${Math.round(delta)}`;
}

function normalizeDomain(points) {
  if (!points || points.length === 0) return null;
  let min = Math.min(...points);
  let max = Math.max(...points);
  if (!isFinite(min) || !isFinite(max)) return null;
  if (min === max) {
    // pad a bit so the line isn't flat against edges
    const pad = Math.max(1, Math.round(max * 0.05));
    min = max - pad;
    max = max + pad;
  }
  return [min, max];
}

function Sparkline({ points = [], min: forcedMin, max: forcedMax }) {
  if (!points.length) return null;
  const width = 120;
  const height = 24;
  const min = forcedMin != null ? forcedMin : Math.min(...points);
  const max = forcedMax != null ? forcedMax : Math.max(...points);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, points.length - 1);

  // Build the line path
  const line = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Build the area path by closing to baseline
  const lastX = (points.length - 1) * step;
  const area = `${line} L ${lastX.toFixed(1)},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="text-primary"
      focusable="false"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" opacity="0.15" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DeltaBadge({ delta, title }) {
  if (delta == null || Number.isNaN(delta) || delta === 0) return null;
  const positive = delta > 0;
  const color = positive
    ? "bg-green-500/10 text-green-700 dark:text-green-400"
    : "bg-red-500/10 text-red-700 dark:text-red-400";
  const arrow = positive ? "▲" : "▼";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
      title={title}
    >
      <span aria-hidden>{arrow}</span>
      <span>{fmtDelta(delta)}</span>
      <span className="sr-only"> {positive ? "increase" : "decrease"} vs average</span>
    </span>
  );
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
