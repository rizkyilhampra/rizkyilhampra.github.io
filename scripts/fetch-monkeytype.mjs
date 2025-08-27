/**
 * Fetch Monkeytype stats and write a normalized JSON file at repo root.
 *
 * IMPORTANT: Fill the endpoint paths according to Monkeytype API docs:
 *   https://api.monkeytype.com/docs
 *
 * This script expects MONKEYTYPE_API_KEY in env and runs in GitHub Actions.
 */

import fs from 'node:fs/promises';

const API_KEY = process.env.MONKEYTYPE_API_KEY;
const OUT_PATH = process.env.MONKEYTYPE_OUT_PATH || 'monkeytype.json';
const USERNAME = process.env.MONKEYTYPE_USERNAME || 'rizkyilhampra';

if (!API_KEY) {
  console.error('MONKEYTYPE_API_KEY not set. Writing sample file instead.');
  const sample = await fs.readFile('monkeytype.sample.json', 'utf8');
  await fs.writeFile(OUT_PATH, sample);
  process.exit(0);
}

/**
 * Node 18+ has global fetch available in Actions runners.
 */
async function api(path, init = {}) {
  const url = `https://api.monkeytype.com${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `ApeKey ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

try {
  // Use official MonkeyType API endpoints from https://api.monkeytype.com/docs
  const u = encodeURIComponent(USERNAME);

  const profile = await tryAny([
    () => api(`/users/${u}/profile`),  // Official endpoint: /users/{uidOrName}/profile
  ]).catch(() => null);

  const pbsRaw = await tryAny([
    () => api(`/users/personalBests`),  // Official endpoint: /users/personalBests
  ]).catch(() => null);

  const recentRaw = await tryAny([
    () => api(`/results`),  // Official endpoint: /results (returns up to 1000 recent results)
  ]).catch(() => null);

  // If all network calls fail, fall back to sample structure.
  let source = { profile, pbs: pbsRaw, recent: unwrapResults(recentRaw) };
  if (!profile && !pbsRaw && !recentRaw) {
    const sample = JSON.parse(await fs.readFile('monkeytype.sample.json', 'utf8'));
    source = sample;
  }

  const normalized = normalize(source);
  await fs.writeFile(OUT_PATH, JSON.stringify(normalized, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
} catch (err) {
  console.error('Failed to fetch Monkeytype data:', err.message);
  process.exit(1);
}

async function tryAny(fns) {
  let lastErr;
  for (const fn of fns) {
    try {
      const data = await fn();
      if (data) return data;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}

function unwrapResults(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.data)) return raw.data;
  return null;
}

function normalize(raw) {
  // Normalize various possible response shapes into a compact dashboard model.
  const profile = raw.profile || raw.user || raw.account || null;
  const recent = Array.isArray(raw.recent)
    ? raw.recent
    : unwrapResults(raw.recent) || unwrapResults(raw) || [];
  const pbs = normalizePBs(raw.pbs || raw.personalBests || raw.best || raw);
  const summary = normalizeSummary(raw.summary || raw.stats || raw, recent);

  return { profile, summary, pbs, recent: normalizeRecent(recent) };
}

function normalizePBs(pbsRaw) {
  // Attempt to extract time 15s and 60s PBs.
  const findPB = (secs) => {
    // handle formats: array of entries or object keyed by time
    if (!pbsRaw) return null;
    let candidates = [];
    if (Array.isArray(pbsRaw)) candidates = pbsRaw;
    if (pbsRaw.time15 || pbsRaw.time60) return pbsRaw[`time${secs}`] || null;
    if (pbsRaw.time) candidates = pbsRaw.time; // nested
    candidates = candidates || [];

    const isMatch = (e) =>
      (e.mode === 'time' && (e.time === secs || e.duration === secs)) ||
      (e.test && e.test.mode === 'time' && (e.test.time === secs || e.test.duration === secs));

    const getWpm = (e) => e.wpm ?? e.wpmRounded ?? e.rawWpm ?? e.bestWpm ?? 0;
    const getAcc = (e) => e.acc ?? e.accuracy ?? e.accPercent ?? null;
    const getTs = (e) => e.timestamp ?? e.date ?? e.createdAt ?? null;

    const best = candidates
      .filter(isMatch)
      .sort((a, b) => (getWpm(b) || 0) - (getWpm(a) || 0))[0];
    return best
      ? { wpm: Math.round(getWpm(best)), acc: normalizeAcc(getAcc(best)), timestamp: getTs(best) }
      : null;
  };

  return {
    time15: findPB(15),
    time60: findPB(60),
  };
}

function normalizeRecent(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 20).map((e) => ({
    wpm: Math.round(e.wpm ?? e.wpmRounded ?? e.rawWpm ?? 0),
    acc: normalizeAcc(e.acc ?? e.accuracy ?? e.accPercent ?? null),
    mode: e.mode || e.test?.mode || 'time',
    time: e.time ?? e.duration ?? e.test?.time ?? 60,
    language: e.language || e.lang || 'english',
    timestamp: e.timestamp ?? e.date ?? e.createdAt ?? null,
  }));
}

function normalizeSummary(stats, recent) {
  const testsFromStats = stats?.tests ?? stats?.testsCompleted ?? null;
  const timeTyping = stats?.timeTyping ?? stats?.timeTyped ?? null;
  const tests = testsFromStats ?? (Array.isArray(recent) ? recent.length : 0);
  let time = timeTyping;
  if (time == null && Array.isArray(recent)) {
    time = recent.reduce((s, r) => s + (r.time || r.duration || 0), 0);
  }
  return { tests, timeTyping: time };
}

function normalizeAcc(acc) {
  if (acc == null) return null;
  // normalize to fraction (0-1)
  if (acc > 1) return acc / 100;
  return acc;
}
