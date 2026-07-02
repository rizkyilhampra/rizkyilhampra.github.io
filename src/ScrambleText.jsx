import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+=<>?/\\|~";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

// Builds one cell per character of `chars`/`isSpace` (both precomputed once
// per `text`, not re-derived every tick). `isLocked(i)` decides whether cell
// `i` has settled into its final letter (and turns back to the default ink
// color) or is still cycling through random glyphs in the accent color.
function cellsFor(chars, isSpace, isLocked) {
  return chars.map((ch, i) => {
    const locked = isSpace[i] || isLocked(i);
    return { ch: locked ? ch : randomChar(), locked };
  });
}

const alwaysLocked = () => true;
const neverLocked = () => false;

// Reveals `text` left-to-right: each character cycles through random glyphs
// in the evergreen accent color before locking into its final letter (and
// fading to the default ink color) a beat after the one before it — so the
// heading looks like it's decoding into view. `skip` mirrors entrance.js's
// reveal() skip flag — it's set on back/forward restore so this doesn't replay.
export function ScrambleText({
  text,
  skip = false,
  className = "",
  tickMs = 18,
  lockStep = 1, // ticks between each character locking in, left to right
  scrambleTicks = 3, // ticks every still-scrambling character spends cycling
}) {
  const chars = text.split("");
  const isSpace = chars.map((ch) => /\s/.test(ch));
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [cells, setCells] = useState(() =>
    cellsFor(chars, isSpace, skip || reduceMotion ? alwaysLocked : neverLocked)
  );

  useEffect(() => {
    if (skip || reduceMotion) {
      setCells(cellsFor(chars, isSpace, alwaysLocked));
      return;
    }

    const totalTicks = text.length * lockStep + scrambleTicks;

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setCells(
        cellsFor(chars, isSpace, (i) => tick >= i * lockStep + scrambleTicks)
      );

      if (tick >= totalTicks) clearInterval(interval);
    }, tickMs);

    return () => clearInterval(interval);
  }, [text, skip]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {cells.map((cell, i) => (
          <span
            key={i}
            className={
              cell.locked
                ? "text-foreground transition-colors duration-150"
                : "text-primary"
            }
          >
            {cell.ch}
          </span>
        ))}
      </span>
    </span>
  );
}
