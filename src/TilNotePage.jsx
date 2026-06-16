import { use, useEffect } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilBySlug } from "./tilNotes";
import { MarkdownContent } from "./MarkdownContent";
import { NotFoundPage } from "./NotFoundPage";
import { PageShell } from "./PageShell";
import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";
import Footer from "./Footer";

export function TilNotePage({
  slug,
  onNavigate,
  onBack,
  skipEntranceAnimation,
}) {
  const note = use(loadTilBySlug(slug));
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
    <PageShell mainClassName="relative z-10 container mx-auto px-6 py-16 md:py-20">
      <article className={`mx-auto max-w-3xl ${entranceClass}`}>
        <InternalBackLink onBack={onBack} />

        <header className="border-b border-border pb-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
            Today I Learned
          </p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {note.title}
          </h1>
          {note.description ? (
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {note.description}
            </p>
          ) : null}
          <PostMeta post={note} />
          <TagList tags={note.tags} size="md" className="mt-5" />
        </header>

        <div className="mt-10 space-y-8">
          <MarkdownContent tokens={note.content} onNavigate={onNavigate} />
        </div>

        <hr className="mt-12 border-border" />
      </article>

      <div className={`mx-auto mt-20 max-w-3xl text-center ${entranceClass}`}>
        <Footer />
      </div>
    </PageShell>
  );
}
