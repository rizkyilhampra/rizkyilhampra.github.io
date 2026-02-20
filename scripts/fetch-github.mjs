/**
 * Fetch GitHub contribution calendar data and write a normalized JSON file.
 *
 * Uses the public contributions proxy (no auth required):
 *   https://github-contributions-api.jogruber.de/v4/{username}?y=last
 *
 * Output shape written to public/github.json:
 *   { contributions: Activity[], fetchedAt: string }
 */

import fs from 'node:fs/promises';

const USERNAME = process.env.GITHUB_USERNAME || 'rizkyilhampra';
const OUT_PATH = process.env.GITHUB_OUT_PATH || 'public/github.json';
const API_URL = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

const res = await fetch(API_URL);
if (!res.ok) {
  console.error(`Failed to fetch contributions: HTTP ${res.status}`);
  process.exit(1);
}

const json = await res.json();

const output = {
  contributions: json.contributions,
  fetchedAt: new Date().toISOString(),
};

await fs.writeFile(OUT_PATH, JSON.stringify(output, null, 2));
console.log(`Written ${json.contributions.length} contributions to ${OUT_PATH}`);
