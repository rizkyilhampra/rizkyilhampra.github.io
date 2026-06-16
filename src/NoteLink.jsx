import { useId, useRef, useState } from "react";
import { getNotePreview, loadTilManifest } from "./tilNotes";
import { prefetchTilNotePage } from "./tilNotePageLoader";
import { TagList } from "./TagList";

// An internal link to another TIL note. Navigates via the SPA router instead of
// a full reload, warms the note-page chunk on hover/focus, and shows a preview
// card (digital-garden style) sourced from the manifest.
export function NoteLink({ href, slug, onNavigate, children }) {
  const [preview, setPreview] = useState(() => getNotePreview(slug));
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const previewId = useId();

  const cancelClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const show = () => {
    cancelClose();
    prefetchTilNotePage();
    if (!preview) {
      loadTilManifest()
        .then(() => setPreview(getNotePreview(slug)))
        .catch(() => {});
    }
    setOpen(true);
  };

  // Grace period so moving the pointer from the link onto the card doesn't
  // dismiss it (the card's padded wrapper bridges the visual gap).
  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 220);
  };

  const handleClick = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(href);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={scheduleClose}
    >
      <a
        href={href}
        onClick={handleClick}
        onFocus={show}
        onBlur={scheduleClose}
        aria-describedby={open && preview ? previewId : undefined}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
      >
        {children}
      </a>

      {open && preview ? (
        // Outer span is positioned flush to the link's top edge with transparent
        // bottom padding, so the hover area is continuous from link to card (no
        // dead zone that makes the preview flicker).
        <span
          id={previewId}
          role="tooltip"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute bottom-full left-0 z-30 block w-72 max-w-[80vw] pb-2"
        >
          <span className="block rounded-lg border border-border bg-card p-4 text-left shadow-glow origin-bottom-left animate-in fade-in-0 zoom-in-95 duration-150 ease-out motion-reduce:animate-none">
            <span className="block font-header text-sm font-semibold text-foreground">
              {preview.title}
            </span>
            {preview.description ? (
              <span className="mt-1.5 line-clamp-3 block text-xs leading-5 text-muted-foreground">
                {preview.description}
              </span>
            ) : null}
            <TagList
              tags={preview.tags}
              max={3}
              variant="plain"
              className="mt-2.5"
            />
          </span>
        </span>
      ) : null}
    </span>
  );
}
