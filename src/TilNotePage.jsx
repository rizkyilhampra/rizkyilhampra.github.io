import { use, useEffect } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilBySlug, loadTilManifest } from "./tilNotes";
import { MarkdownContent } from "./MarkdownContent";
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";
import { NoteConnections } from "./NoteConnections";
import Footer from "./Footer";

export function TilNotePage({
  slug,
  onNavigate,
  onBack,
  skipEntranceAnimation,
}) {
  const note = use(loadTilBySlug(slug));
  const manifest = use(loadTilManifest());
  const entranceClass = skipEntranceAnimation
    ? ""
    : "animate-fade-in-up motion-reduce:animate-none";

  useEffect(() => {
    document.title = note
      ? `${note.title} | Rizky Ilham Pratama`
      : "Note not found | Rizky Ilham Pratama";
  }, [note]);

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
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <article className={`mx-auto max-w-3xl ${entranceClass}`}>
        <InternalBackLink onBack={onBack} />

        <header className="border-b border-border pb-8">
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

        <div className="mt-10 space-y-8">
          <MarkdownContent tokens={note.content} onNavigate={onNavigate} />
        </div>

        <NoteConnections slug={slug} manifest={manifest} onNavigate={onNavigate} />

        <hr className="mt-12 border-border" />
      </article>

      <div className={`mt-20 ${entranceClass}`}>
        <Footer />
      </div>
    </PageShell>
  );
}
