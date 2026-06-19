import { use, useMemo } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilManifest } from "./tilNotes";
import { PageShell } from "./PageShell";
import { TilCard } from "./TilCard";
import { navHandler } from "./utils";
import Footer from "./Footer";

export function TilTagPage({ tag, onNavigate, onBack, skipEntranceAnimation }) {
  const notes = use(loadTilManifest());
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";

  const matches = useMemo(() => {
    const wanted = tag.toLowerCase();
    return notes.filter((note) =>
      (note.tags ?? []).some((t) => t.toLowerCase() === wanted)
    );
  }, [notes, tag]);

  const go = navHandler(onNavigate);

  return (
    <PageShell mainClassName="relative z-10 container mx-auto px-6 py-16 md:py-20">
      <div className={`mx-auto max-w-5xl ${entranceClass}`}>
        <InternalBackLink onBack={onBack} />

        <header className="border-b border-border pb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
            Tag
          </p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            #{tag}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {matches.length} note{matches.length === 1 ? "" : "s"} tagged{" "}
            <span className="font-medium text-foreground">#{tag}</span>.{" "}
            <a
              href="/til/tags"
              onClick={go("/til/tags")}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              All tags
            </a>
          </p>
        </header>

        {matches.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No notes carry this tag.{" "}
            <a
              href="/til"
              onClick={go("/til")}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              Browse all notes
            </a>
            .
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((note) => (
              <TilCard key={note.slug} note={note} onNavigate={onNavigate} showDate />
            ))}
          </div>
        )}
      </div>

      <div className={`mx-auto mt-20 max-w-5xl text-center ${entranceClass}`}>
        <Footer />
      </div>
    </PageShell>
  );
}
