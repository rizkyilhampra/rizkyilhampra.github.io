import { ArrowRight } from "lucide-react";
import { Suspense, use } from "react";
import { PostMeta } from "./PostMeta";
import { SectionHeading } from "./SectionHeading";
import { TagList } from "./TagList";
import { loadTilManifest } from "./tilNotes";
import { navHandler } from "./utils";
import { prefetchTilNotePage } from "./tilNotePageLoader";

const MAX_NOTES = 4;

function TilNotes({ onNavigate }) {
  const allNotes = use(loadTilManifest());
  const notes = allNotes.slice(0, MAX_NOTES);
  const go = navHandler(onNavigate);

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No notes published yet — check back soon.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border border-y border-border">
        {notes.map((note) => (
          <TilListItem key={note.slug} note={note} onNavigate={onNavigate} />
        ))}
      </ul>

      {allNotes.length > MAX_NOTES ? (
        <a
          href="/til"
          onClick={go("/til")}
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Explore all {allNotes.length} notes
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </a>
      ) : null}
    </>
  );
}

function TilListItem({ note, onNavigate }) {
  const href = `/til/${note.slug}`;
  const go = navHandler(onNavigate);

  return (
    <li className="py-4">
      <a
        href={href}
        onClick={go(href)}
        onMouseEnter={prefetchTilNotePage}
        onFocus={prefetchTilNotePage}
        onTouchStart={prefetchTilNotePage}
        className="group block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <h3 className="font-header text-lg font-semibold leading-snug text-foreground underline-offset-4 transition-colors duration-200 group-hover:text-primary group-hover:underline group-focus-visible:text-primary">
          {note.title}
        </h3>
      </a>

      {/* Meta under the title: date + read time (icons) and tag pills — matches
          the note-page header treatment. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <PostMeta post={note} className="flex flex-wrap items-center gap-4" />
        <TagList tags={note.tags} max={3} size="sm" onNavigate={onNavigate} />
      </div>

      {note.description ? (
        <a
          href={href}
          onClick={go(href)}
          tabIndex={-1}
          className="mt-1.5 block outline-none"
        >
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {note.description}
          </p>
        </a>
      ) : null}
    </li>
  );
}

function TilListSkeleton() {
  return (
    <div className="divide-y divide-border border-y border-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse py-5">
          <div className="h-5 w-2/3 rounded-md bg-secondary" />
          <div className="mt-2 h-3 w-24 rounded-md bg-secondary" />
          <div className="mt-2 h-3 w-full rounded-md bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function TilListPreview({ onNavigate }) {
  return (
    <section aria-labelledby="til-heading">
      <SectionHeading eyebrow="~/til" title="Today I Learned" id="til-heading">
        Short notes from a digital garden.
      </SectionHeading>

      <Suspense fallback={<TilListSkeleton />}>
        <TilNotes onNavigate={onNavigate} />
      </Suspense>
    </section>
  );
}
