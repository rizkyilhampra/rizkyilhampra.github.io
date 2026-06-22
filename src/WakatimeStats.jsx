import { SectionHeading } from "./SectionHeading";
import { formatTimeAgo } from "./utils";
import { useCachedJson } from "./useCachedJson";

const WAKATIME_URL = "/wakatime.json";

export default function WakatimeStats({ className = "mt-16 md:mt-20" }) {
  const { data, error, loading, lastUpdated } = useCachedJson(WAKATIME_URL);
  const languages = data?.languages ?? [];

  return (
    <section aria-labelledby="wakatime-stats-title" className={className}>
      <SectionHeading
        eyebrow="~/coding"
        title="Coding Activity"
        id="wakatime-stats-title"
      >
        Powered by{" "}
        <a
          href="https://wakatime.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-primary"
        >
          WakaTime
        </a>
        {lastUpdated && (
          <span> · updated {formatTimeAgo(lastUpdated)} · every 12 hours</span>
        )}
      </SectionHeading>

      {loading && <WakatimeSkeleton />}
      {!loading && error && <ConnectCard />}
      {!loading && !error && data && (
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Languages
            </div>
            <div className="text-xs text-muted-foreground/70">last 7 days</div>
          </div>
          {languages.length === 0 && (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
          <ul className="space-y-3" role="list">
            {languages.map((item) => (
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
    <div className="flex-1 animate-pulse">
      <div className="mb-3 h-3 w-20 rounded bg-secondary" aria-hidden="true" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="mb-1 flex justify-between">
              <div className="h-3 w-24 rounded bg-secondary" aria-hidden="true" />
              <div className="h-3 w-12 rounded bg-secondary" aria-hidden="true" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectCard() {
  return (
    <p className="flex-1 text-sm text-muted-foreground">
      Add a <code className="text-primary">WAKATIME_API_KEY</code> secret to GitHub
      Actions to enable live coding activity stats.
    </p>
  );
}
