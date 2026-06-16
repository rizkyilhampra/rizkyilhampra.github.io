// Span-based so it stays valid HTML even inside the inline hover preview (which
// renders within a <p>). `max` limits how many tags show; omit to show all.
// `variant="plain"` drops the pill chrome for tight spaces like the preview.
const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
};

export function TagList({ tags, max, size = "sm", variant = "pill", className = "" }) {
  if (!tags || tags.length === 0) return null;
  const shown = max ? tags.slice(0, max) : tags;

  if (variant === "plain") {
    return (
      <span
        className={`flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-medium text-muted-foreground ${className}`}
      >
        {shown.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </span>
    );
  }

  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {shown.map((tag) => (
        <span
          key={tag}
          className={`rounded-full border border-border bg-secondary/50 font-medium text-muted-foreground ${SIZES[size]}`}
        >
          #{tag}
        </span>
      ))}
    </span>
  );
}
