import { useMemo } from "react";
import { NoteLink } from "./NoteLink";

const MAX_RELATED = 4;

// Renders the digital-garden interconnections for a note: "Linked from"
// (backlinks, computed at build time in the manifest) and "Related notes"
// (other notes sharing at least one tag). Both are derived from the manifest
// already loaded by the page, so no extra markdown fetches happen here.
export function NoteConnections({ slug, manifest, onNavigate, className = "" }) {
  const { backlinks, related } = useMemo(() => {
    const current = manifest.find((note) => note.slug === slug);
    if (!current) return { backlinks: [], related: [] };

    const bySlug = new Map(manifest.map((note) => [note.slug, note]));
    const backlinks = (current.backlinks ?? [])
      .map((s) => bySlug.get(s))
      .filter(Boolean);

    const backlinkSlugs = new Set(backlinks.map((note) => note.slug));
    const currentTags = new Set(
      (current.tags ?? []).map((t) => t.toLowerCase())
    );
    const related =
      currentTags.size === 0
        ? []
        : manifest
            .filter(
              (note) =>
                note.slug !== slug &&
                !backlinkSlugs.has(note.slug) &&
                (note.tags ?? []).some((t) => currentTags.has(t.toLowerCase()))
            )
            .slice(0, MAX_RELATED);

    return { backlinks, related };
  }, [manifest, slug]);

  if (backlinks.length === 0 && related.length === 0) return null;

  return (
    <div className={`space-y-8 ${className}`}>
      <NoteLinkGroup
        title="Linked from"
        notes={backlinks}
        onNavigate={onNavigate}
      />
      <NoteLinkGroup
        title="Related notes"
        notes={related}
        onNavigate={onNavigate}
      />
    </div>
  );
}

// Just the titles — the description shows in NoteLink's hover/focus preview card,
// matching how in-body wikilinks behave.
function NoteLinkGroup({ title, notes, onNavigate }) {
  if (notes.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => (
          <li key={note.slug}>
            <NoteLink
              href={`/til/${note.slug}`}
              slug={note.slug}
              onNavigate={onNavigate}
            >
              {note.title}
            </NoteLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
