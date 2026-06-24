import { useMemo } from "react";
import { GraphView } from "./GraphView";
import { buildGraph, localGraph } from "./graphData";
import { ExpandGraphButton } from "./ExpandGraphButton";

// The per-note neighborhood graph shown on /til/<slug>, mirroring Quartz's
// sidebar graph: the current note at the centre, its linked notes and tags one
// hop out. The corner button expands to the full-garden graph overlay.
export function LocalGraph({
  slug,
  manifest,
  onNavigate,
  className = "",
  skipEntranceAnimation = false,
}) {
  const graph = useMemo(() => {
    const full = buildGraph(manifest);
    return localGraph(full, slug, 1);
  }, [manifest, slug]);

  // Nothing to show for a note with no links and no tags.
  if (graph.nodes.length <= 1) return null;

  return (
    <section className={className}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Graph view
      </h2>
      <div className="relative rounded-lg border border-border bg-card/50">
        <ExpandGraphButton />
        <GraphView
          nodes={graph.nodes}
          links={graph.links}
          focusId={slug}
          onNavigate={onNavigate}
          height={240}
          animate={!skipEntranceAnimation}
        />
      </div>
    </section>
  );
}
