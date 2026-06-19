import { use } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilTags } from "./tilNotes";
import { PageShell } from "./PageShell";
import { navHandler } from "./utils";
import Footer from "./Footer";

export function TilTagsPage({ onNavigate, onBack, skipEntranceAnimation }) {
  const tags = use(loadTilTags());
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";
  const go = navHandler(onNavigate);

  return (
    <PageShell mainClassName="relative z-10 container mx-auto px-6 py-16 md:py-20">
      <div className={`mx-auto max-w-5xl ${entranceClass}`}>
        <InternalBackLink onBack={onBack} />

        <header className="border-b border-border pb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
            Digital garden
          </p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Browse by tag
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {tags.length} tag{tags.length === 1 ? "" : "s"} across the notes.{" "}
            <a
              href="/til"
              onClick={go("/til")}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              View all notes
            </a>
            .
          </p>
        </header>

        {tags.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No tags yet — check back soon.
          </p>
        ) : (
          <div className="mt-10 flex flex-wrap gap-3">
            {tags.map(({ tag, count }) => {
              const href = `/til/tags/${encodeURIComponent(tag)}`;
              return (
                <a
                  key={tag}
                  href={href}
                  onClick={go(href)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>#{tag}</span>
                  <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className={`mx-auto mt-20 max-w-5xl text-center ${entranceClass}`}>
        <Footer />
      </div>
    </PageShell>
  );
}
