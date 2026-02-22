/**
 * Fetch WakaTime coding activity stats and write normalized JSON.
 *
 * WakaTime API docs: https://wakatime.com/developers
 * Endpoint: GET /api/v1/users/current/stats/last_7_days
 * Auth: Basic base64(API_KEY + ':')
 *
 * Env vars:
 *   WAKATIME_API_KEY   - required for live data; falls back to empty stub
 *   WAKATIME_OUT_PATH  - output file path (default: public/wakatime.json)
 */

import fs from 'node:fs/promises';

const API_KEY = process.env.WAKATIME_API_KEY;
const OUT_PATH = process.env.WAKATIME_OUT_PATH || 'public/wakatime.json';

if (!API_KEY) {
  console.error('WAKATIME_API_KEY not set. Writing empty stub instead.');
  await fs.writeFile(OUT_PATH, JSON.stringify({ fetchedAt: new Date().toISOString(), languages: [] }, null, 2));
  process.exit(0);
}

async function api(path) {
  const credentials = Buffer.from(`${API_KEY}:`).toString('base64');
  const url = `https://wakatime.com/api/v1${path}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`WakaTime API ${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

try {
  const raw = await api('/users/current/stats/last_7_days');
  const normalized = normalize(raw.data);
  await fs.writeFile(OUT_PATH, JSON.stringify(normalized, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
} catch (err) {
  console.error('Failed to fetch WakaTime data:', err.message);
  process.exit(1);
}

function normalize(data) {
  if (!data) throw new Error('Empty response data from WakaTime API');

  const pick = (arr, limit) =>
    (Array.isArray(arr) ? arr : []).slice(0, limit).map((item) => ({
      name: item.name || 'Unknown',
      percent: parseFloat((item.percent ?? 0).toFixed(1)),
      text: fmtSeconds(item.total_seconds ?? 0),
    }));

  return {
    fetchedAt: new Date().toISOString(),
    languages: pick(data.languages, 6),
  };
}

function fmtSeconds(s) {
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h} hr${h !== 1 ? 's' : ''} ${m} min${m !== 1 ? 's' : ''}`;
  if (m > 0) return `${m} min${m !== 1 ? 's' : ''}`;
  return `${sec} sec${sec !== 1 ? 's' : ''}`;
}
