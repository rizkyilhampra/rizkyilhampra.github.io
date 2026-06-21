import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";
import { navHandler } from "./utils";
import { prefetchTilNotePage } from "./tilNotePageLoader";

// Shared framing for every note list (loaded and loading) so the ink-on-paper
// list shell stays identical across the homepage preview, TIL index, and tags:
// top + bottom rules around the list, inter-row rules between notes.
const LIST_SHELL_CLASS = "divide-y divide-border border-y border-border";

// Shared note list used by the homepage preview, the TIL index, and tag pages so
// every note row gets the same ink-on-paper treatment: an Iosevka title, a
// date + reading-time meta line, clickable tags, and a clamped description.
export function TilNoteList({ notes, onNavigate }) {
  return (
    <ul className={LIST_SHELL_CLASS}>
      {notes.map((note) => (
        <TilListItem key={note.slug} note={note} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

// Loading placeholder that mirrors the list shell and row rhythm above.
export function TilNoteListSkeleton({ count = 4 }) {
  return (
    <div className={LIST_SHELL_CLASS}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse py-4">
          <div className="h-5 w-2/3 rounded-md bg-secondary" />
          <div className="mt-2 h-3 w-24 rounded-md bg-secondary" />
          <div className="mt-2 h-3 w-full rounded-md bg-secondary" />
        </div>
      ))}
    </div>
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
