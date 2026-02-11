import { useEffect, useState } from "react";

export default function SpotifyStats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/spotify.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const fetchedAt = json?.fetchedAt;
        if (fetchedAt) setLastUpdated(new Date(fetchedAt));
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const tracks = data?.top?.tracks?.medium_term || [];
  const artists = data?.top?.artists?.medium_term || [];

  return (
    <section aria-labelledby="spotify-stats-title" className="mt-16 md:mt-20">
      <div className="text-center mb-8">
        <h2 id="spotify-stats-title" className="text-3xl md:text-4xl font-header font-semibold tracking-tight mb-2">
          Listening Highlights
        </h2>
        <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full mb-4" />
        <p className="text-sm text-muted-foreground">
          Source: {' '}
          <a
            href="https://developer.spotify.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Spotify
          </a>
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Updated {formatTimeAgo(lastUpdated)} • Syncs monthly
          </p>
        )}
      </div>

      {loading && <DualSkeleton />}
      {!loading && error && <ConnectCard />}
      {!loading && !error && (
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-card border border-border rounded-lg shadow-sm min-w-0">
            <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">Top Tracks (6 months)</h3>
            <ol className="space-y-3">
              {tracks.length === 0 && <li className="text-sm text-muted-foreground">No data</li>}
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
            </ol>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg shadow-sm min-w-0">
            <h3 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">Top Artists (6 months)</h3>
            <ol className="space-y-3">
              {artists.length === 0 && <li className="text-sm text-muted-foreground">No data</li>}
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
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

function RankItem({ rank, image, title, subtitle, href }) {
  return (
    <li className="flex items-center gap-3 min-w-0">
      <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium shrink-0">
        {rank}
      </div>
      <div className="w-12 h-12 rounded overflow-hidden bg-muted shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <a href={href || '#'} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium hover:underline truncate">
          {title}
        </a>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
      </div>
    </li>
  );
}

function TopTracksCard({ tracks }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top tracks (4 weeks)</div>
      <ul className="space-y-2">
        {tracks.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
        {tracks.map((t) => (
          <li key={t.id} className="text-sm">
            <a href={t.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {t.name}
            </a>
            <span className="text-muted-foreground"> — {fmtArtists(t.artists)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopArtistsCard({ artists }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Top artists (4 weeks)</div>
      <ul className="space-y-2">
        {artists.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
        {artists.map((a) => (
          <li key={a.id} className="text-sm">
            <a href={a.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {a.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DualSkeleton() {
  return (
    <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
      {[0,1].map((col) => (
        <div key={col} className="p-4 bg-card border border-border rounded-lg shadow-sm animate-pulse">
          <div className="h-3 w-28 bg-muted rounded mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                <div className="w-12 h-12 rounded bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded mt-2" />
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
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="text-sm mb-2">Connect your Spotify account</div>
      <p className="text-sm text-muted-foreground">
        Add a GitHub Action with Spotify API credentials to fetch stats into <code>spotify.json</code>.
      </p>
    </div>
  );
}

// no numeric stats needed

function fmtArtists(list) {
  if (!Array.isArray(list) || list.length === 0) return 'Unknown';
  return list.map(a => a.name).join(', ');
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
