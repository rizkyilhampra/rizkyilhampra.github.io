/**
 * Fetch Spotify stats and write a normalized JSON file to public/spotify.json.
 *
 * Requires the following environment variables (set in GitHub Actions Secrets):
 * - SPOTIFY_CLIENT_ID
 * - SPOTIFY_CLIENT_SECRET
 * - SPOTIFY_REFRESH_TOKEN
 *
 * Scopes needed when creating the refresh token:
 * - user-top-read
 * (We only fetch top tracks/artists; no now playing or recent.)
 */

import fs from 'node:fs/promises';

const OUT_PATH = process.env.SPOTIFY_OUT_PATH || 'public/spotify.json';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function run() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Spotify secrets missing. Writing sample file instead.');
    const sample = await fs.readFile('spotify.sample.json', 'utf8').catch(() => null);
    if (sample) {
      await fs.writeFile(OUT_PATH, sample);
      console.log(`Wrote ${OUT_PATH} from sample`);
      return;
    }
    // If no sample present, write a minimal stub
    const stub = {
      fetchedAt: new Date().toISOString(),
      top: { tracks: { medium_term: [] }, artists: { medium_term: [] } }
    };
    await fs.writeFile(OUT_PATH, JSON.stringify(stub, null, 2));
    console.log(`Wrote ${OUT_PATH} stub`);
    return;
  }

  const accessToken = await getAccessTokenByRefreshToken({ CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN });

  // Fetch top tracks/artists (medium_term ~ last 6 months)
  const [topTracksMedium, topArtistsMedium] = await Promise.all([
    getTopTracks(accessToken, 10, 'medium_term').catch(() => []),
    getTopArtists(accessToken, 10, 'medium_term').catch(() => []),
  ]);

  const payload = {
    fetchedAt: new Date().toISOString(),
    top: {
      tracks: { medium_term: topTracksMedium },
      artists: { medium_term: topArtistsMedium },
    }
  };

  await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
}

async function getAccessTokenByRefreshToken({ CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN }) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
  });
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Token refresh failed ${res.status}: ${txt}`);
  }
  const json = await res.json();
  return json.access_token;
}

function normalizeTrack(t) {
  if (!t) return null;
  return {
    id: t.id || null,
    name: t.name || '',
    artists: (t.artists || []).map(a => ({ id: a.id || null, name: a.name || '' })),
    album: t.album?.name || '',
    url: (t.external_urls && t.external_urls.spotify) || null,
    image: t.album?.images?.[0]?.url || null,
    durationMs: t.duration_ms || null,
  };
}

function normalizeArtist(a) {
  if (!a) return null;
  return {
    id: a.id || null,
    name: a.name || '',
    url: (a.external_urls && a.external_urls.spotify) || null,
    image: a.images?.[0]?.url || null,
    genres: a.genres || [],
  };
}


async function getTopTracks(accessToken, limit = 10, time_range = 'short_term') {
  const url = new URL('https://api.spotify.com/v1/me/top/tracks');
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 50)));
  url.searchParams.set('time_range', time_range);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`top tracks ${res.status}`);
  const json = await res.json();
  return (json.items || []).map(normalizeTrack);
}

async function getTopArtists(accessToken, limit = 10, time_range = 'short_term') {
  const url = new URL('https://api.spotify.com/v1/me/top/artists');
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 50)));
  url.searchParams.set('time_range', time_range);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`top artists ${res.status}`);
  const json = await res.json();
  return (json.items || []).map(normalizeArtist);
}


run().catch((e) => {
  console.error('Failed to fetch Spotify data:', e.message);
  process.exit(1);
});
