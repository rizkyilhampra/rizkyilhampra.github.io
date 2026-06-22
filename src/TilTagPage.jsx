import { use, useMemo } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilManifest } from "./tilNotes";
import { PageShell } from "./PageShell";
import { TilNoteList } from "./TilNoteList";
import { navHandler } from "./utils";
import { createReveal } from "./entrance";
import Footer from "./Footer";

export function TilTagPage({ tag, onNavigate, onBack, skipEntranceAnimation }) {
  const notes = use(loadTilManifest());
  const reveal = createReveal(skipEntranceAnimation);

  const matches = useMemo(() => {
    const wanted = tag.toLowerCase();
    return notes.filter((note) =>
      (note.tags ?? []).some((t) => t.toLowerCase() === wanted)
    );
  }, [notes, tag]);

  const go = navHandler(onNavigate);

  return (
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <InternalBackLink onBack={onBack} {...reveal(0, "mb-10")} />

      <header {...reveal(1, "border-b border-border pb-8")}>
        <p className="mb-4 font-mono text-xs text-primary">~/til/tags/{tag}</p>
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

      <div {...reveal(2)}>
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
          <div className="mt-10">
            <TilNoteList notes={matches} onNavigate={onNavigate} />
          </div>
        )}
      </div>

      <div {...reveal(3, "mt-20")}>
        <Footer />
      </div>
    </PageShell>
  );
}
