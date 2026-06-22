import { ArrowLeft } from "lucide-react";

// A "go back" control for inner pages. It's an action (history back), not a
// destination, so it's a <button> rather than an anchor.
export function InternalBackLink({ onBack, className = "mb-10", style, label = "Back" }) {
  return (
    <button
      type="button"
      onClick={onBack}
      style={style}
      className={`${className} inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
