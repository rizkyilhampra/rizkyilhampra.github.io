import { Heart } from "lucide-react";

// A small easter egg tucked at the end of the social row. The lone warm-toned
// icon in a row of muted ones — beats on hover and little hearts drift up
// around it — for someone special. Links out to her.

// Small hearts that rise around the icon on hover. They launch in two synced
// pairs a beat apart — rhythmic, not a random race, but organic enough to
// avoid a stamped-out look. Vary position and size to keep it natural.
const FLOATERS = [
  { left: "10%", size: "h-2 w-2", delay: "0s" },
  { left: "55%", size: "h-2.5 w-2.5", delay: "0s" },
  { left: "30%", size: "h-1.5 w-1.5", delay: "0.25s" },
  { left: "78%", size: "h-1.5 w-1.5", delay: "0.25s" },
];

export function SecretHeart() {
  return (
    <a
      href="https://instagram.com/apainilala"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Instagram profile @apainilala"
      title="Instagram: @apainilala"
      className="group relative flex h-9 w-9 items-center justify-center rounded-md text-rose-400 outline-none transition-colors hover:text-rose-500 focus-visible:text-rose-500 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Little hearts drift up around the icon on hover/focus. */}
      <span className="pointer-events-none absolute inset-x-0 bottom-5 block h-6 motion-reduce:hidden" aria-hidden="true">
        {FLOATERS.map(({ left, size, delay }, i) => (
          <Heart
            key={i}
            style={{ left, animationDelay: delay }}
            className={`absolute bottom-0 ${size} fill-current text-rose-400 opacity-0 group-hover:animate-heart-float group-focus-visible:animate-heart-float`}
          />
        ))}
      </span>

      <Heart
        className="h-[1.15rem] w-[1.15rem] fill-current drop-shadow-[0_0_6px_rgba(244,63,94,0.35)] transition-transform group-hover:animate-heartbeat group-focus-visible:animate-heartbeat motion-reduce:group-hover:animate-none motion-reduce:group-focus-visible:animate-none"
        aria-hidden="true"
      />
    </a>
  );
}
