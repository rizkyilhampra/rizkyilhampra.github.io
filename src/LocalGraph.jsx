import { useMemo } from "react";
import { Maximize2 } from "lucide-react";
import { GraphView } from "./GraphView";
import { buildGraph, localGraph } from "./graphData";
import { navHandler } from "./utils";

// The per-note neighborhood graph shown on /til/<slug>, mirroring Quartz's
// sidebar graph: the current note at the centre, its linked notes and tags one
// hop out. The corner button expands to the full-garden graph at /til/graph.
export function LocalGraph({ slug, manifest, onNavigate, className = "" }) {
  const graph = useMemo(() => {
    const full = buildGraph(manifest);
    return localGraph(full, slug, 1);
  }, [manifest, slug]);

  // Nothing to show for a note with no links and no tags.
  if (graph.nodes.length <= 1) return null;

  const go = navHandler(onNavigate);

  return (
    <section className={className}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Graph view
      </h2>
      <div className="relative rounded-lg border border-border bg-card/50">
        {/* Overlaid in the graph's top-right corner, matching Quartz's expand
            affordance. z-10 keeps it above the canvas so the click hits the
            link rather than starting a pan. */}
        <a
          href="/til/graph"
          onClick={go("/til/graph")}
          title="Open the full garden graph"
          aria-label="Open the full garden graph"
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-card/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Expand
        </a>
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
