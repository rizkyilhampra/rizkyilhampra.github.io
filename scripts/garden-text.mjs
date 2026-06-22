// Shared text helpers for the TIL garden pipeline, used by both the vault sync
// (fetch-garden.mjs) and the local description regenerator so the two never
// drift apart.

const ALERT_MARKER = /^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

// Find the first real prose paragraph for the index excerpt. Works line-by-line
// (not blank-line blocks) so a heading glued to its paragraph (`## Why\ntext`)
// doesn't cause the whole block to be skipped. Skips headings and fenced code,
// and strips quote/alert markers (`> [!NOTE]`) so callouts read as plain text.
export function extractDescription(body) {
  const current = [];
  let inFence = false;

  for (const raw of body.split('\n')) {
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      if (current.length) break;
      continue;
    }
    if (inFence) continue;

    if (raw.trim() === '') {
      if (current.length) break;
      continue;
    }
    if (/^\s*#/.test(raw)) continue; // heading line

    const line = raw
      .replace(/^\s*>+\s?/, '') // quote marker
      .replace(ALERT_MARKER, '') // [!NOTE] etc
      .trim();
    if (line) current.push(line);
  }

  if (!current.length) return '';

  const text = toPlainText(current.join(' ')).replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;

  const cutoff = text.lastIndexOf(' ', 160);
  return text.slice(0, cutoff > 0 ? cutoff : 160) + '…';
}

// Strip the inline markdown syntax most likely to appear in a first paragraph so
// the description reads as plain text.
export function toPlainText(text) {
  return text
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .trim();
}
