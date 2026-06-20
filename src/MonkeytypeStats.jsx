import { SectionHeading } from "./SectionHeading";
import { formatTimeAgo } from "./utils";
import { useCachedJson } from "./useCachedJson";

const MONKEYTYPE_URL = "/monkeytype.json";

export default function MonkeytypeStats() {
  const { data, error, loading, lastUpdated } = useCachedJson(MONKEYTYPE_URL);

  return (
    <section aria-labelledby="typing-stats-title">
      <SectionHeading
        eyebrow="~/typing"
        title="Typing Stats"
        id="typing-stats-title"
      >
        Powered by{' '}
        <a
          href="https://monkeytype.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-primary"
        >
          MonkeyType
        </a>
        {lastUpdated && (
          <span> · updated {formatTimeAgo(lastUpdated)} · every 12 hours</span>
        )}
      </SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            >
              <span title={tooltip} tabIndex={0} className="relative block h-full w-full rounded-sm outline-none focus:ring-2 focus:ring-primary/40">
                <Sparkline points={wpmPoints} min={domain?.[0]} max={domain?.[1]} />
                <DeltaBadge delta={delta} title={tooltip} className="absolute -top-1 right-0" />
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

function StatCard({ label, value, sub, children }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-baseline gap-1.5">
          <div className="font-header text-3xl font-semibold tabular-nums leading-none text-foreground">{value}</div>
        </div>
        {children && (
          <div className="relative flex h-8 min-w-0 flex-1 items-center">
            {children}
          </div>
        )}
      </div>
      {sub && <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function SkeletonCard({ title = "Loading" }) {
  return (
    <div className="animate-pulse border-t border-border pt-3">
      <div className="mb-2 h-3 w-24 rounded bg-secondary" aria-hidden />
      <div className="h-9 w-16 rounded bg-secondary" aria-hidden />
      <div className="mt-2 h-3 w-20 rounded bg-secondary" aria-hidden />
      <span className="sr-only">{title}</span>
    </div>
  );
}

function ConnectCard() {
  return (
    <p className="text-sm text-muted-foreground">
      Connect a Monkeytype account via a GitHub Action to fetch stats into{" "}
      <code>monkeytype.json</code>. See the project README for setup.
    </p>
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
      preserveAspectRatio="none"
      className="h-full w-full max-w-[160px] text-primary/80"
      focusable="false"
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" opacity="0.15" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DeltaBadge({ delta, title, className = "" }) {
  if (delta == null || Number.isNaN(delta) || delta === 0) return null;
  const positive = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border bg-background/85 px-1.5 py-0.5 text-[11px] font-medium leading-none backdrop-blur-[1px] ${
        positive
          ? "border-primary/40 text-primary"
          : "border-destructive/40 text-destructive"
      } ${className}`}
      title={title}
    >
      <span aria-hidden>{positive ? "▲" : "▼"}</span>
      <span>{Math.abs(Math.round(delta))}</span>
      <span className="sr-only"> {positive ? "increase" : "decrease"} vs average</span>
    </span>
  );
}

