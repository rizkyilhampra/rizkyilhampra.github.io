import { Maximize2 } from "lucide-react";
import { useGraphModal } from "./GraphModalContext";

// The "expand to the full garden graph" affordance, overlaid in a graph card's
// top-right corner (matching Quartz). z-10 keeps it above the canvas so the
// click opens the overlay instead of starting a pan.
export function ExpandGraphButton({ className = "" }) {
  const openGraph = useGraphModal();

  return (
    <button
      type="button"
      onClick={openGraph}
      title="Open the full garden graph"
      aria-label="Open the full garden graph"
      className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-card/80 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
      Expand
    </button>
  );
}
