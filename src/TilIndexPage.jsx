import { use } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilManifest } from "./tilNotes";
import { PageShell } from "./PageShell";
import { TilCard } from "./TilCard";
import Footer from "./Footer";

export function TilIndexPage({ onNavigate, onBack, skipEntranceAnimation }) {
  const notes = use(loadTilManifest());
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";

  return (
    <PageShell mainClassName="relative z-10 container mx-auto px-6 py-16 md:py-20">
      <div className={`mx-auto max-w-5xl ${entranceClass}`}>
        <InternalBackLink onBack={onBack} />

        <header className="border-b border-border pb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
            Digital garden
          </p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Today I Learned
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {notes.length} short note{notes.length === 1 ? "" : "s"} on things I
            picked up — mostly Linux, self-hosting, and dev tooling.
          </p>
        </header>

        {notes.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No notes published yet — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <TilCard
                key={note.slug}
                note={note}
                onNavigate={onNavigate}
                showDate
              />
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
