// Regenerate the self-hosted Iosevka subsets used for headings (font-header).
//
// @fontsource/iosevka ships its "latin" subset at ~1MB *per weight* because
// Iosevka carries an enormous glyph set. We only ever render short Latin
// headings, so we subset each weight down to printable ASCII + Latin-1 + a few
// typographic characters, shrinking ~2MB total to a few tens of KB.
//
// Run manually after bumping @fontsource/iosevka; the generated woff2 files are
// committed so the normal build needs no extra step:
//
//   node scripts/subset-fonts.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import subsetFont from "subset-font";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@fontsource/iosevka/files");
const outDir = join(root, "src/assets/fonts");

// Glyphs we actually render in headings: full printable ASCII, the Latin-1
// Supplement accented letters, and the typographic characters used in the UI
// (en/em dash, curly quotes, ellipsis, middle dot, tilde).
const ascii = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) =>
  String.fromCharCode(0x20 + i)
).join("");
const latin1 = Array.from({ length: 0xff - 0xa0 + 1 }, (_, i) =>
  String.fromCharCode(0xa0 + i)
).join("");
const typographic = "–—‘’“”…·";
const text = ascii + latin1 + typographic;

const weights = [500, 600];

await mkdir(outDir, { recursive: true });

for (const weight of weights) {
  const input = await readFile(
    join(srcDir, `iosevka-latin-${weight}-normal.woff2`)
  );
  const output = await subsetFont(input, text, { targetFormat: "woff2" });
  const outPath = join(outDir, `iosevka-${weight}.woff2`);
  await writeFile(outPath, output);
  console.log(
    `iosevka-${weight}.woff2  ${(input.length / 1024).toFixed(0)}KB -> ${(
      output.length / 1024
    ).toFixed(1)}KB`
  );
}
