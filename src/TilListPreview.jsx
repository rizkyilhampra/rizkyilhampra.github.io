import { ArrowRight } from "lucide-react";
import { Suspense, use } from "react";
import { loadTilManifest } from "./tilNotes";
import { TilCard, TilCardSkeleton } from "./TilCard";

const MAX_NOTES = 6;

function TilCards({ onNavigate }) {
  const allNotes = use(loadTilManifest());
  const notes = allNotes.slice(0, MAX_NOTES);

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No notes published yet — check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <TilCard key={note.slug} note={note} onNavigate={onNavigate} />
        ))}
      </div>

      {allNotes.length > MAX_NOTES ? (
        <div className="mt-6 flex justify-center">
          <a
            href="/til"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/til");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
          >
            Explore all {allNotes.length} notes
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </>
  );
}

export function TilListPreview({ onNavigate }) {
  return (
    <section className="mt-16 md:mt-20" aria-labelledby="til-heading">
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
          Digital garden
        </p>
        <h2
          id="til-heading"
          className="font-header text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Today I Learned
        </h2>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <TilCardSkeleton />
            <TilCardSkeleton />
            <TilCardSkeleton />
          </div>
        }
      >
        <TilCards onNavigate={onNavigate} />
      </Suspense>
    </section>
  );
}
