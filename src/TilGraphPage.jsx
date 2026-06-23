import { use, useMemo } from "react";
import { InternalBackLink } from "./InternalBackLink";
import { loadTilManifest } from "./tilNotes";
import { PageShell } from "./PageShell";
import { GraphView } from "./GraphView";
import { buildGraph } from "./graphData";
import { createReveal } from "./entrance";
import Footer from "./Footer";

// The full-garden graph at /til/graph: every note and tag, with their links.
// The big sibling of the per-note LocalGraph.
export function TilGraphPage({ onNavigate, onBack, skipEntranceAnimation }) {
  const notes = use(loadTilManifest());
  const reveal = createReveal(skipEntranceAnimation);

  const graph = useMemo(() => buildGraph(notes), [notes]);
  const noteCount = graph.nodes.filter((node) => node.type === "note").length;

  return (
    <PageShell onNavigate={onNavigate} mainClassName="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <InternalBackLink onBack={onBack} {...reveal(0, "mb-10")} />

      <header {...reveal(1, "border-b border-border pb-8")}>
        <p className="mb-4 font-mono text-xs text-primary">~/til/graph</p>
        <h1 className="font-header text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Garden graph
        </h1>
        <p className="mt-5 text-base leading-8 text-muted-foreground">
          {noteCount} note{noteCount === 1 ? "" : "s"} and {graph.links.length}{" "}
          connection{graph.links.length === 1 ? "" : "s"}. Drag to rearrange,
          scroll to zoom, click a node to open it.
        </p>
      </header>

      <div {...reveal(2, "mt-10")}>
        {graph.nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes published yet — check back soon.
          </p>
        ) : (
          <div className="rounded-lg border border-border bg-card/50">
            <GraphView
              nodes={graph.nodes}
              links={graph.links}
              onNavigate={onNavigate}
              height={560}
            />
          </div>
        )}
      </div>

      <div {...reveal(3, "mt-20")}>
        <Footer />
      </div>
    </PageShell>
  );
}
