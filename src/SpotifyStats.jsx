import { SectionHeading } from "./SectionHeading";
import { formatTimeAgo } from "./utils";
import { useCachedJson } from "./useCachedJson";

const SPOTIFY_URL = "/spotify.json";

export default function SpotifyStats() {
  const { data, error, loading, lastUpdated } = useCachedJson(SPOTIFY_URL);

  const tracks = data?.top?.tracks?.medium_term || [];
  const artists = data?.top?.artists?.medium_term || [];

  return (
    <section aria-labelledby="spotify-stats-title">
      <SectionHeading
        eyebrow="~/listening"
        title="Listening Highlights"
        id="spotify-stats-title"
      >
        Source:{' '}
        <a
          href="https://developer.spotify.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-primary"
        >
          Spotify
        </a>
        {lastUpdated && (
          <span> · updated {formatTimeAgo(lastUpdated)} · syncs monthly</span>
        )}
      </SectionHeading>

      {loading && <DualSkeleton />}
      {!loading && error && <ConnectCard />}
      {!loading && !error && (
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          <RankColumn heading="Top Tracks · 6 months" isEmpty={tracks.length === 0}>
            {tracks.slice(0, 5).map((t, i) => (
              <RankItem
                key={t.id || i}
                rank={i + 1}
                image={t.image}
                title={t.name}
                subtitle={fmtArtists(t.artists)}
                href={t.url}
              />
            ))}
          </RankColumn>

          <RankColumn heading="Top Artists · 6 months" isEmpty={artists.length === 0}>
            {artists.slice(0, 5).map((a, i) => (
              <RankItem
                key={a.id || i}
                rank={i + 1}
                image={a.image}
                title={a.name}
                subtitle={Array.isArray(a.genres) && a.genres.length ? a.genres.slice(0, 2).join(', ') : undefined}
                href={a.url}
              />
            ))}
          </RankColumn>
        </div>
      )}
    </section>
  );
}

function RankColumn({ heading, isEmpty, children }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 border-b border-border pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {heading}
      </h3>
      <ol className="space-y-3">
        {isEmpty && <li className="text-sm text-muted-foreground">No data</li>}
        {children}
      </ol>
    </div>
  );
}

function RankItem({ rank, image, title, subtitle, href }) {
  return (
    <li className="flex items-center gap-3 min-w-0">
      <span className="w-4 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {rank}
      </span>
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary">
          {title}
        </a>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </li>
  );
}

function DualSkeleton() {
  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      {[0,1].map((col) => (
        <div key={col} className="min-w-0 animate-pulse">
          <div className="mb-3 h-3 w-28 rounded bg-secondary" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded bg-secondary" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-3/4 rounded bg-secondary" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConnectCard() {
  return (
    <p className="text-sm text-muted-foreground">
      Connect a Spotify account via a GitHub Action with API credentials to fetch
      stats into <code>spotify.json</code>.
    </p>
  );
}

// no numeric stats needed

function fmtArtists(list) {
  if (!Array.isArray(list) || list.length === 0) return 'Unknown';
  return list.map(a => a.name).join(', ');
}

