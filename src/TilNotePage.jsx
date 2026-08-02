import { use, useMemo } from "react";
import { useMountEffect } from "./useMountEffect";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilBySlug, loadTilManifest } from "./tilNotes";
import { MarkdownContent } from "./MarkdownContent";
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";
import { NoteConnections } from "./NoteConnections";
import { LocalGraph } from "./LocalGraph";
import { extractHeadings, MIN_HEADINGS_FOR_TOC, TableOfContents } from "./TableOfContents";
import { markVisited } from "./visited";
import { createReveal } from "./entrance";
import Footer from "./Footer";

export function TilNotePage({
  slug,
  onNavigate,
  onBack,
  skipEntranceAnimation,
  note: preloadedNote,
  notes: preloadedNotes,
}) {
  const note = preloadedNote ?? use(loadTilBySlug(slug));
  const manifest = preloadedNotes ?? use(loadTilManifest());
  const reveal = createReveal(skipEntranceAnimation);
  // TOC entries; anchor ids already live on the tokens (see markdown.js).
  const headings = useMemo(() => extractHeadings(note?.content), [note?.content]);

  useMountEffect(() => {
    if (note) markVisited(note.slug);
  });

  if (!note) {
    return (
      <NotFoundPage
        onBack={onBack}
        skipEntranceAnimation={skipEntranceAnimation}
        title="Note not found"
        message="This TIL note does not exist (or has not been published yet)."
      />
    );
  }

  return (
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      {/* On wide screens the sticky TOC takes a right-hand rail; below `lg`
          the grid collapses and the article reverts to its single column. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12">
        <article className="mx-auto w-full max-w-3xl">
          <InternalBackLink onBack={onBack} {...reveal(0, "mb-10")} />

          <header {...reveal(1, "border-b border-border pb-8")}>
            <p className="mb-4 font-mono text-xs text-primary">~/til/{note.slug}</p>
            <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {note.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <PostMeta
                post={note}
                className="flex flex-wrap items-center gap-4"
              />
              <TagList tags={note.tags} size="md" onNavigate={onNavigate} />
            </div>
          </header>

          <div {...reveal(2, "mt-10 space-y-8")}>
            <MarkdownContent
              tokens={note.content}
              footnotes={note.footnotes}
              onNavigate={onNavigate}
            />
          </div>

          <div {...reveal(3, "mt-12 border-t border-border pt-8")}>
            {/* Graph on the left, the "Linked from"/"Related notes" lists on the
                right; stacks to a single column on narrow screens. Either side can
                be absent (flex lets the present one fill the row). */}
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
              <LocalGraph
                slug={slug}
                manifest={manifest}
                onNavigate={onNavigate}
                skipEntranceAnimation={skipEntranceAnimation}
                className="order-last md:order-none md:min-w-0 md:flex-1 md:max-w-[calc(50%-1.25rem)]"
              />
              <NoteConnections
                slug={slug}
                manifest={manifest}
                onNavigate={onNavigate}
                className="md:min-w-0 md:flex-1"
              />
            </div>
            <hr className="mt-12 border-border" />
          </div>
        </article>

        {headings.length >= MIN_HEADINGS_FOR_TOC && (
          <aside {...reveal(3, "hidden lg:block")}>
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>

      <div {...reveal(4, "mt-20")}>
        <Footer />
      </div>
    </PageShell>
  );
}
