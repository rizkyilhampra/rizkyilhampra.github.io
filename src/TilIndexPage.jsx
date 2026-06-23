import { use, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilManifest, loadTilTags } from "./tilNotes";
import { PageShell } from "./PageShell";
import { TilNoteList } from "./TilNoteList";
import { navHandler } from "./utils";
import { createReveal } from "./entrance";
import Footer from "./Footer";

function noteMatchesQuery(note, query) {
  if (!query) return true;
  const haystack = [
    note.title,
    note.description,
    ...(note.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function groupByYear(notes) {
  const groups = new Map();
  for (const note of notes) {
    const year = note.date?.slice(0, 4) || "Undated";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(note);
  }
  return [...groups.entries()];
}

export function TilIndexPage({ onNavigate, onBack, skipEntranceAnimation }) {
  const notes = use(loadTilManifest());
  const allTags = use(loadTilTags());
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [sort, setSort] = useState("newest"); // manifest is already newest-first

  const reveal = createReveal(skipEntranceAnimation);
  const go = navHandler(onNavigate);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = notes.filter(
      (note) =>
        noteMatchesQuery(note, normalizedQuery) &&
        (!activeTag || (note.tags ?? []).includes(activeTag))
    );
    if (sort === "oldest") result = [...result].reverse();
    return result;
  }, [notes, query, activeTag, sort]);

  const hasFilters = Boolean(query.trim() || activeTag);
  // Group by year only in the default view; a search/tag/sort query reads better
  // as a flat, relevance-style list.
  const isDefaultView = !hasFilters && sort === "newest";
  const groups = useMemo(
    () => (isDefaultView ? groupByYear(filtered) : [["", filtered]]),
    [isDefaultView, filtered]
  );

  return (
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <InternalBackLink onBack={onBack} {...reveal(0, "mb-10")} />

      <header {...reveal(1, "border-b border-border pb-8")}>
        <p className="mb-4 font-mono text-xs text-primary">~/til</p>
          <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Today I Learned
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {notes.length} short note{notes.length === 1 ? "" : "s"} on things I
            picked up — mostly Linux, self-hosting, and dev tooling.{" "}
            <a
              href="/til/tags"
              onClick={go("/til/tags")}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              Browse by tag →
            </a>{" "}
            <a
              href="/til/graph"
              onClick={go("/til/graph")}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
            >
              View graph →
            </a>
          </p>
      </header>

      <div {...reveal(2)}>
        {notes.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No notes published yet — check back soon.
          </p>
        ) : (
          <>
            {/* Controls: search, sort, tag chips */}
            <div className="mt-10 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search notes…"
                    aria-label="Search notes"
                    className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="til-sort" className="sr-only">
                    Sort notes
                  </label>
                  <select
                    id="til-sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-card py-2.5 pl-3 pr-9 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {allTags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {allTags.map(({ tag }) => {
                    const isActive = tag === activeTag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveTag(isActive ? null : tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          isActive
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setActiveTag(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                      Clear
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <p className="mt-10 text-sm text-muted-foreground">
                No notes match your search.
              </p>
            ) : (
              <div className="mt-10 space-y-10">
                {groups.map(([year, groupNotes]) => (
                  <section key={year || "results"}>
                    {year ? (
                      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {year}
                      </h2>
                    ) : null}
                    <TilNoteList notes={groupNotes} onNavigate={onNavigate} />
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div {...reveal(3, "mt-20")}>
        <Footer />
      </div>
    </PageShell>
  );
}
