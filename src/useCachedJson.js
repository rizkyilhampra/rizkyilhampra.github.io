import { useEffect, useState } from "react";
import { fetchJsonCached, getCached } from "./statsCache";

// Fetch + cache a JSON file once, seeding state synchronously from the cache so
// remounts (e.g. navigating back to the homepage) never flash a loading state.
// `lastUpdated` is derived from the payload's `fetchedAt`, not stored separately.
export function useCachedJson(url) {
  const cached = getCached(url);
  const [data, setData] = useState(cached ?? null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (getCached(url)) return; // already have data — skip the fetch
    let cancelled = false;
    fetchJsonCached(url)
      .then((json) => { if (!cancelled) setData(json); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  const lastUpdated = data?.fetchedAt ? new Date(data.fetchedAt) : null;
  return { data, loading, error, lastUpdated };
}
