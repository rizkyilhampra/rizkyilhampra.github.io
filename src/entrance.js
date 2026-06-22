// Shared page-entrance motion.
//
// Every page (the home page and the whole TIL garden) reveals its content as one
// orchestrated cascade: blocks fade up in reading order, each trailing the last
// by a fixed step. This keeps the motion language identical across routes instead
// of each page reimplementing its own one-shot fade.
//
// `skip` short-circuits the animation. It's set when we're restoring a remembered
// scroll position (back/forward navigation), so returning to a page lands you
// where you were without replaying the entrance.

const STAGGER_MS = 70;
const ENTRANCE_CLASS = "animate-fade-in-up motion-reduce:animate-none";

// Returns a `reveal(step, extra)` factory. `step` is the cascade position (0 =
// leads, no delay); `extra` are layout classes to keep on the element. Spread the
// result onto an element: `<header {...reveal(1, "border-b pb-8")}>`.
export function createReveal(skip) {
  return function reveal(step = 0, extra = "") {
    if (skip) return extra ? { className: extra } : {};

    return {
      className: extra ? `${extra} ${ENTRANCE_CLASS}` : ENTRANCE_CLASS,
      style: {
        animationDelay: step > 0 ? `${step * STAGGER_MS}ms` : undefined,
        animationFillMode: "both",
      },
    };
  };
}
