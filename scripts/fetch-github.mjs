/**
 * Fetch GitHub contribution calendar data for all available years and write
 * normalized JSON files.
 *
 * Uses the public contributions proxy (no auth required):
 *   https://github-contributions-api.jogruber.de/v4/{username}
 *   https://github-contributions-api.jogruber.de/v4/{username}?y={year}
 *
 * Output files written to public/:
 *   github-manifest.json  → { years: number[], fetchedAt: string }
 *   github-{year}.json    → { contributions: Activity[], year: number }
 */

import fs from 'node:fs/promises';

const USERNAME = process.env.GITHUB_USERNAME || 'rizkyilhampra';
const OUT_DIR = process.env.GITHUB_OUT_DIR || 'public';
const BASE_URL = `https://github-contributions-api.jogruber.de/v4/${USERNAME}`;

// Fetch base response to get all available years from the `total` object
const baseRes = await fetch(BASE_URL);
if (!baseRes.ok) {
  console.error(`Failed to fetch base contributions: HTTP ${baseRes.status}`);
  process.exit(1);
}

const baseJson = await baseRes.json();
const years = Object.keys(baseJson.total)
  .map(Number)
  .filter((y) => baseJson.total[y] > 0 || y >= new Date().getFullYear())
  .sort((a, b) => a - b);

console.log(`Found years with data: ${years.join(', ')}`);

const fetchedAt = new Date().toISOString();

// Fetch and write per-year files
for (const year of years) {
  const res = await fetch(`${BASE_URL}?y=${year}`);
  if (!res.ok) {
    console.warn(`Skipping ${year}: HTTP ${res.status}`);
    continue;
  }
  const json = await res.json();
  const outPath = `${OUT_DIR}/github-${year}.json`;
  await fs.writeFile(outPath, JSON.stringify({ contributions: json.contributions, year }, null, 2));
  console.log(`Written ${json.contributions.length} contributions for ${year} to ${outPath}`);
}

// Write manifest
const manifestPath = `${OUT_DIR}/github-manifest.json`;
await fs.writeFile(manifestPath, JSON.stringify({ years, fetchedAt }, null, 2));
console.log(`Written manifest with years [${years.join(', ')}] to ${manifestPath}`);
