import { use } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilTags } from "./tilNotes";
import { PageShell } from "./PageShell";
import { navHandler } from "./utils";
import { createReveal } from "./entrance";
import Footer from "./Footer";

export function TilTagsPage({
  onNavigate,
  onBack,
  skipEntranceAnimation,
  tags: preloadedTags,
}) {
  const tags = preloadedTags ?? use(loadTilTags());
  const reveal = createReveal(skipEntranceAnimation);
  const go = navHandler(onNavigate);

  return (
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <InternalBackLink onBack={onBack} {...reveal(0, "mb-10")} />

      <header {...reveal(1, "border-b border-border pb-8")}>
        <p className="mb-4 font-mono text-xs text-primary">~/til/tags</p>
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

      <div {...reveal(2)}>
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
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span>#{tag}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div {...reveal(3, "mt-20")}>
        <Footer />
      </div>
    </PageShell>
  );
}
