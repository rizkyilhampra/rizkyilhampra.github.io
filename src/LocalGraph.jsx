import { useMemo } from "react";
import { Maximize2 } from "lucide-react";
import { GraphView } from "./GraphView";
import { buildGraph, localGraph } from "./graphData";
import { navHandler } from "./utils";

// The per-note neighborhood graph shown on /til/<slug>, mirroring Quartz's
// sidebar graph: the current note at the centre, its linked notes and tags one
// hop out. The corner button expands to the full-garden graph at /til/graph.
export function LocalGraph({ slug, manifest, onNavigate }) {
  const graph = useMemo(() => {
    const full = buildGraph(manifest);
    return localGraph(full, slug, 1);
  }, [manifest, slug]);

  // Nothing to show for a note with no links and no tags.
  if (graph.nodes.length <= 1) return null;

  const go = navHandler(onNavigate);

  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Graph view
        </h2>
        <a
          href="/til/graph"
          onClick={go("/til/graph")}
          title="Open the full garden graph"
          aria-label="Open the full garden graph"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Expand
        </a>
      </div>
      <div className="rounded-lg border border-border bg-card/50">
        <GraphView
          nodes={graph.nodes}
          links={graph.links}
          focusId={slug}
          onNavigate={onNavigate}
          height={240}
        />
      </div>
    </section>
  );
}
