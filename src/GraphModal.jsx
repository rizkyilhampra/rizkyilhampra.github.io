import { Suspense, use, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GraphView } from "./GraphView";
import { fullGraph } from "./graphData";
import { loadTilManifest } from "./tilNotes";

// Fullscreen overlay for the whole garden graph — the "expand" target shared by
// the homepage card, the TIL index, and each note's local graph. Quartz opens its
// global graph the same way (an overlay, not a route), so there's no /til/graph
// page; this is reachable only by opening it.
export function GraphModal({ onClose, onNavigate }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      // Keep Tab focus inside the dialog.
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Garden graph"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      />

      <div
        ref={panelRef}
        className="relative h-[88vh] w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-scale-in motion-reduce:animate-none"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close graph"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <Suspense fallback={null}>
          <GraphModalBody onNavigate={onNavigate} />
        </Suspense>
      </div>
    </div>,
    document.body
  );
}

function GraphModalBody({ onNavigate }) {
  const notes = use(loadTilManifest());
  const graph = fullGraph(notes);
  const noteCount = useMemo(
    () => graph.nodes.filter((node) => node.type === "note").length,
    [graph]
  );

  if (graph.nodes.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No notes published yet — check back soon.
      </p>
    );
  }

  // GraphView fills its wrapper (no numeric height), so the canvas tracks the
  // fluid vh-sized panel on its own — nothing to measure here.
  return (
    <>
      <div className="absolute inset-0">
        <GraphView
          nodes={graph.nodes}
          links={graph.links}
          onNavigate={onNavigate}
          className="h-full"
        />
      </div>

      <p className="pointer-events-none absolute bottom-3 left-3 right-3 w-fit max-w-[calc(100%-1.5rem)] rounded-md bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
        {noteCount} note{noteCount === 1 ? "" : "s"} · {graph.links.length}{" "}
        connection{graph.links.length === 1 ? "" : "s"} — drag to rearrange,
        scroll to zoom, click a node to open it.
      </p>
    </>
  );
}
