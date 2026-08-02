import { useCallback, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { inlineText } from "./markdown";
import { scrollToId } from "./scrollToId";

// Notes with fewer sections than this don't get a TOC rail — a two-line list
// would be noise next to the article.
export const MIN_HEADINGS_FOR_TOC = 2;

// The spy band's top edge: how far below the viewport top a heading may sit
// and still count as "current". The site nav is NOT sticky (it scrolls away),
// so this is just a small reading cushion — kept equal to the `scroll-mt-12`
// anchor offset in MarkdownContent.jsx so a heading clicked from the TOC lands
// exactly on the band and is highlighted immediately. The fallback
// "last heading that scrolled past" check uses the same offset so the two can
// never drift apart.
const SPY_TOP_OFFSET = 48;

// Collects the h2/h3 headings (h1 is the note title; h4+ stays out of the TOC
// to keep it scannable) for the rail. Anchor ids are stamped onto the tokens
// at parse time (assignHeadingIds in markdown.js), so this is a plain walk —
// recursing into any token that carries children so headings nested in
// blockquotes are found too.
export function extractHeadings(tokens) {
  const headings = [];
  const walk = (list) => {
    for (const token of list ?? []) {
      if (token.type === "heading" && token.depth >= 2 && token.depth <= 3) {
        headings.push({ id: token.id, text: inlineText(token.tokens), depth: token.depth });
      }
      if (token.tokens && token.type !== "heading") walk(token.tokens);
    }
  };
  walk(tokens);
  return headings;
}

// Sticky "On this page" rail for TIL note pages. Sits in a right-hand column
// on wide screens and scroll-spies the article headings: an
// IntersectionObserver band across the top third of the viewport reports which
// section is current; hitting the page bottom forces the last entry active so
// the tail of long notes doesn't leave the rail pointing mid-document.
//
// The observer lives in a callback ref (fires exactly when the rail attaches
// or detaches) rather than an effect — when `headings` changes React re-runs
// the ref, tearing down the old observer first.
export function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState(null);

  const spyRef = useCallback(
    (node) => {
      if (!node) return undefined;

      const elements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter(Boolean);
      if (elements.length === 0) return undefined;

      const visible = new Set();
      const observer = new IntersectionObserver(
        (entries) => {
          // Scrolled to the very bottom → the last section is "current" even
          // if it's too short to reach the spy band.
          const atBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
          if (atBottom) {
            setActiveId(headings[headings.length - 1].id);
            return;
          }

          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          // Topmost heading inside the band wins; if the band is empty
          // (between sections), hold the last heading that scrolled past.
          const inBand = elements.find((el) => visible.has(el.id));
          if (inBand) {
            setActiveId(inBand.id);
            return;
          }
          const passed = elements.filter(
            (el) => el.getBoundingClientRect().top < SPY_TOP_OFFSET
          );
          if (passed.length > 0) setActiveId(passed[passed.length - 1].id);
        },
        { rootMargin: `-${SPY_TOP_OFFSET}px 0px -66% 0px`, threshold: 0 }
      );
      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    },
    [headings]
  );

  if (headings.length < MIN_HEADINGS_FOR_TOC) return null;

  return (
    <nav ref={spyRef} aria-label="Table of contents" className="sticky top-24">
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        <p className="mb-3 flex items-center gap-1.5 font-mono text-xs text-primary">
          <List className="h-3.5 w-3.5" aria-hidden="true" />
          on-this-page
        </p>
        <TocLinks headings={headings} activeId={activeId} />
      </div>
    </nav>
  );
}

// Shared heading list for both the sticky rail and the mobile menu. `activeId`
// drives the scroll-spy highlight (rail only); `onItemClick` lets the mobile
// variant collapse itself before navigating, defaulting to a plain smooth scroll.
function TocLinks({ headings, activeId, onItemClick }) {
  const handleClick = onItemClick ?? ((id, event) => scrollToId(id, event));
  return (
    <ul className="space-y-0.5 border-l border-border text-sm">
      {headings.map((heading) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(event) => handleClick(heading.id, event)}
              aria-current={active ? "location" : undefined}
              className={[
                "-ml-px block border-l-2 py-1 pr-2 leading-snug transition-colors duration-200 motion-reduce:transition-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                heading.depth >= 3 ? "pl-6" : "pl-3",
                active
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              ].join(" ")}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Compact "on-this-page" menu for screens below `lg`, where the sticky rail is
// hidden — otherwise mobile readers get no in-page navigation on long notes. A
// native <details> keeps it keyboard- and screen-reader-friendly with no state
// or effects; tapping a link collapses the menu before scrolling so the anchor
// is measured against the post-collapse layout.
export function MobileTableOfContents({ headings }) {
  if (headings.length < MIN_HEADINGS_FOR_TOC) return null;

  return (
    <details className="group rounded-lg border border-border bg-secondary/50 lg:hidden">
      <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 font-mono text-xs text-primary outline-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        <span>on-this-page</span>
        <span className="rounded-full border border-border px-1.5 py-px text-[10px] tabular-nums text-muted-foreground">
          {headings.length}
        </span>
        <ChevronDown
          className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-3">
        <TocLinks
          headings={headings}
          onItemClick={(id, event) => {
            event.currentTarget.closest("details")?.removeAttribute("open");
            scrollToId(id, event);
          }}
        />
      </div>
    </details>
  );
}
