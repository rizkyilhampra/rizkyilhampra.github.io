import { PageShell } from "./PageShell";
import { BACK_BUTTON_CLASS } from "./InternalBackLink";
import { TilNoteListSkeleton } from "./TilNoteList";

// Base pulsing block — carries no color/radius so each caller supplies one
// unambiguous surface (no conflicting utilities on a single element).
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
}

// The two recurring skeleton surfaces, mirroring the real components:
// plain text bars (secondary tint) vs controls/pills (bordered, tinted).
const BAR = "rounded-md bg-secondary";
const PILL = "rounded-full border border-border bg-secondary/50";

// Mirrors the real back button's chrome (shared BACK_BUTTON_CLASS) so restyling
// the button can't leave the skeleton stale — pulse added on top.
function BackButtonSkeleton() {
  return <Skeleton className={`${BACK_BUTTON_CLASS} h-9 w-20`} />;
}

// Shared chrome for every TIL inner page: shell + back button + content column,
// mirroring the top region of each real page.
function SkeletonShell({ children }) {
  return (
    <PageShell mainClassName="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <BackButtonSkeleton />
      <div className="mt-10">{children}</div>
    </PageShell>
  );
}

// Mirrors the real pages' header block: eyebrow line, page-title line, then a
// short description. Bars mimic the real glyph line-boxes (eyebrow ~16px,
// text-4xl/5xl title ~45/60px, leading-8 description ~32px per line) so the
// swap to content does not jump.
function PageHeaderSkeleton({
  eyebrowWidth = "w-16",
  titleWidth = "w-56",
  titleLines = 1,
  descriptionLines = 1,
  children,
}) {
  return (
    <header className="border-b border-border pb-8">
      <Skeleton className={`${BAR} mb-4 h-3 ${eyebrowWidth}`} />
      {Array.from({ length: titleLines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`${BAR} h-9 ${
            i === titleLines - 1 ? titleWidth : "w-1/2"
          }`}
        />
      ))}
      <div className="mt-5 space-y-4">
        {Array.from({ length: descriptionLines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`${BAR} h-4 ${
              i === descriptionLines - 1 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
      {children}
    </header>
  );
}

// Internal parameterized page skeleton — the three list-ish TIL pages share the
// same chrome and body shape, differing only in widths and body rows.
function TilPageSkeleton({ titleWidth = "w-56", descriptionLines = 1, children }) {
  return (
    <SkeletonShell>
      <PageHeaderSkeleton titleWidth={titleWidth} descriptionLines={descriptionLines} />
      {children}
    </SkeletonShell>
  );
}

export function NotePageSkeleton() {
  return (
    <SkeletonShell>
      <PageHeaderSkeleton
        eyebrowWidth="w-24"
        titleWidth="w-2/3"
        titleLines={2}
      >
        {/* Meta row under the title: date, reading time, and a tag pill. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Skeleton className={`${BAR} h-4 w-32`} />
          <Skeleton className={`${BAR} h-4 w-20`} />
          <Skeleton className={`${PILL} h-6 w-16`} />
        </div>
      </PageHeaderSkeleton>

      <div className="mt-10 space-y-4">
        <Skeleton className={`${BAR} h-4 w-full`} />
        <Skeleton className={`${BAR} h-4 w-11/12`} />
        <Skeleton className={`${BAR} h-4 w-3/5`} />
        <Skeleton className={`${BAR} mt-6 h-32 w-full rounded-lg`} />
        <Skeleton className={`${BAR} h-4 w-2/3`} />
        <Skeleton className={`${BAR} h-4 w-full`} />
      </div>
    </SkeletonShell>
  );
}

export function TilIndexPageSkeleton() {
  return (
    <TilPageSkeleton descriptionLines={2}>
      {/* Controls: a search/sort row on top of a tag-chip row. The chip row only
          appears once tags load, so the skeleton reserves both. */}
      <Skeleton className={`${PILL} mt-10 h-10 w-full`} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className={`${PILL} h-6 w-16`} />
        <Skeleton className={`${PILL} h-6 w-20`} />
        <Skeleton className={`${PILL} h-6 w-14`} />
        <Skeleton className={`${PILL} h-6 w-16`} />
      </div>
      <div className="mt-10">
        <TilNoteListSkeleton count={5} />
      </div>
    </TilPageSkeleton>
  );
}

export function TilTagsPageSkeleton() {
  return (
    <TilPageSkeleton>
      <div className="mt-10 flex flex-wrap gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`${PILL} h-9 ${
              i % 3 === 0 ? "w-32" : i % 3 === 1 ? "w-24" : "w-20"
            }`}
          />
        ))}
      </div>
    </TilPageSkeleton>
  );
}

export function TilTagPageSkeleton() {
  return (
    <TilPageSkeleton titleWidth="w-40">
      <div className="mt-10">
        <TilNoteListSkeleton count={4} />
      </div>
    </TilPageSkeleton>
  );
}
