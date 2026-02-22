/**
 * Fetch WakaTime coding activity stats and write normalized JSON.
 *
 * WakaTime API docs: https://wakatime.com/developers
 * Endpoint: GET /api/v1/users/current/stats/last_7_days
 * Auth: Basic base64(API_KEY + ':')
 *
 * Env vars:
 *   WAKATIME_API_KEY   - required for live data; falls back to sample file
 *   WAKATIME_OUT_PATH  - output file path (default: public/wakatime.json)
 */

import fs from 'node:fs/promises';

const API_KEY = process.env.WAKATIME_API_KEY;
const OUT_PATH = process.env.WAKATIME_OUT_PATH || 'public/wakatime.json';

if (!API_KEY) {
  console.error('WAKATIME_API_KEY not set. Writing sample file instead.');
  const sample = await fs.readFile('wakatime.sample.json', 'utf8');
  await fs.writeFile(OUT_PATH, sample);
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
      totalSeconds: Math.round(item.total_seconds ?? 0),
      percent: parseFloat((item.percent ?? 0).toFixed(1)),
      text: item.text || fmtSeconds(Math.round(item.total_seconds ?? 0)),
    }));

  return {
    fetchedAt: new Date().toISOString(),
    range: data.range ?? 'last_7_days',
    totalSeconds: Math.round(data.total_seconds ?? 0),
    dailyAverageSeconds: Math.round(data.daily_average ?? 0),
    languages: pick(data.languages, 6),
    projects: pick(data.projects, 4),
    editors: pick(data.editors, 3),
  };
}

function fmtSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} hr${h !== 1 ? 's' : ''} ${m} min${m !== 1 ? 's' : ''}`;
  return `${m} min${m !== 1 ? 's' : ''}`;
}
