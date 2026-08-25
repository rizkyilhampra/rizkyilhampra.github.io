// Generate the ASCII portrait data for the home hero from rizky-college.jpg.
//
// Spawns img2art (https://github.com/Asthestarsfalll/img2art), parses the ANSI
// color stream it emits, and writes a compact JSON module the site imports.
// The generated src/asciiPortrait.json is committed, so the normal build needs
// no extra step; run this script manually when the source image changes:
//
//   node scripts/generate-ascii.mjs
//
// The JSON carries TWO glyph variants over the same color runs:
//   - dark:  img2art's raw output, made for dark terminals — bright cells are
//            dense braille, dark cells are (nearly) blank glyphs that melt
//            into a dark page background.
//   - light: the same cells with the braille pattern XOR-inverted wherever
//            the pixel is darker than LIGHT_INVERT_BELOW. Blank dark cells
//            become solid blocks, so on the light paper theme the suit reads
//            as ink instead of vanishing. No background color is baked in —
//            both variants render transparently over the site theme.

import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = process.env.IMG2ART_SOURCE || join(root, "rizky-college.jpg");
const OUT = process.env.IMG2ART_OUT || join(root, "src/asciiPortrait.json");

const SCALE = 0.24;
const QUANT = 32;
const LIGHT_INVERT_BELOW = 128;

// img2art's --with-color output is one combined SGR sequence per cell:
//   \x1b[38;2;R;G;Bm<glyph>\x1b[0m
// (a 48;2 background segment may appear when --bg-color is used; the regex
// tolerates it). Blank cells use the braille empty glyph U+2800, so the grid
// is perfectly regular.
const CELL =
  /\x1b\[(?:38;2;(\d+);(\d+);(\d+))?(?:;48;2;(\d+);(\d+);(\d+))?m([^\x1b]*)/g;

const tmp = join(root, ".ascii-portrait.raw");

try {
  execFileSync(
    "img2art",
    [
      SOURCE,
      "--scale", String(SCALE),
      "--with-color",
      "--quant", String(QUANT),
      "--save-raw", tmp,
    ],
    { stdio: "ignore" }
  );
} catch (err) {
  console.error(
    "img2art failed — is it installed? (pip install img2art, or set IMG2ART_SOURCE)"
  );
  throw err;
}

const raw = await readFile(tmp, "utf8");
const luminance = ({ r, g, b }) => 0.299 * r + 0.587 * g + 0.114 * b;
const invertGlyph = (glyph) =>
  String.fromCodePoint(0x2800 + ((glyph.codePointAt(0) - 0x2800) ^ 0xff));

// Parse the ANSI stream once into a regular grid of colored cells.
const grid = raw
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) =>
    [...line.matchAll(CELL)].map((match) => {
      const [r, g, b] = [1, 2, 3].map((i) => Number(match[i]));
      return { r, g, b, glyph: match[7] };
    })
  );

// Merge cells into runs of equal color. Inversion never changes colors, so
// both variants share the exact same run structure — only glyphs differ.
const toRuns = (glyphOf) =>
  grid.map((row) => {
    const runs = [];
    let last = null;
    for (const cell of row) {
      const fg = `rgb(${cell.r},${cell.g},${cell.b})`;
      const text = glyphOf(cell);
      if (last && last.c === fg) {
        last.t += text;
      } else {
        last = { c: fg, t: text };
        runs.push(last);
      }
    }
    return runs;
  });

const data = {
  cols: grid[0].length,
  rows: grid.length,
  dark: toRuns((cell) => cell.glyph),
  light: toRuns((cell) =>
    luminance(cell) < LIGHT_INVERT_BELOW ? invertGlyph(cell.glyph) : cell.glyph
  ),
};

await writeFile(OUT, JSON.stringify(data), "utf8");
const runCount = data.dark.reduce((n, l) => n + l.length, 0);
console.log(`Wrote ${OUT}: ${data.cols}×${data.rows} cells, ${runCount} runs, dark+light variants`);
