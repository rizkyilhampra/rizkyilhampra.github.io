import { ArrowRight } from "lucide-react";
import { Suspense, use } from "react";
import { SectionHeading } from "./SectionHeading";
import { TilNoteList, TilNoteListSkeleton } from "./TilNoteList";
import { GraphView } from "./GraphView";
import { ExpandGraphButton } from "./ExpandGraphButton";
import { fullGraph } from "./graphData";
import { loadTilManifest } from "./tilNotes";
import { navHandler } from "./utils";

const MAX_NOTES = 4;

function TilNotes({ onNavigate, skipEntranceAnimation, notes: preloadedNotes }) {
  const allNotes = preloadedNotes ?? use(loadTilManifest());
  const notes = allNotes.slice(0, MAX_NOTES);
  const graph = fullGraph(allNotes);
  const go = navHandler(onNavigate);

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No notes published yet — check back soon.
      </p>
    );
  }

  return (
    <>
      <TilNoteList notes={notes} onNavigate={onNavigate} />

      {allNotes.length > MAX_NOTES ? (
        <a
          href="/til"
          onClick={go("/til")}
          className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Explore all {allNotes.length} notes
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden="true"
          />
        </a>
      ) : null}

      {/* The garden as a constellation, closing out the section. Half-width on
          desktop, full on mobile. Needs a couple of connections before it's
          worth showing — a lone dot says nothing. */}
      {graph.links.length > 0 ? (
        <div className="relative mt-8 w-full overflow-hidden rounded-lg border border-border bg-card/50 md:w-1/2">
          <ExpandGraphButton />
          <GraphView
            nodes={graph.nodes}
            links={graph.links}
            onNavigate={onNavigate}
            height={300}
            animate={!skipEntranceAnimation}
          />
        </div>
      ) : null}
    </>
  );
}

export function TilListPreview({ onNavigate, skipEntranceAnimation, notes }) {
  return (
    <section aria-labelledby="til-heading">
      <SectionHeading eyebrow="~/til" title="Today I Learned" id="til-heading">
        Short notes from a digital garden.
      </SectionHeading>

      <Suspense fallback={<TilNoteListSkeleton count={MAX_NOTES} />}>
        <TilNotes
          onNavigate={onNavigate}
          skipEntranceAnimation={skipEntranceAnimation}
          notes={notes}
        />
      </Suspense>
    </section>
  );
}
