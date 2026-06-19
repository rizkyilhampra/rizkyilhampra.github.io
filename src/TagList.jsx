import { navHandler } from "./utils";

// Span-based so it stays valid HTML even inside the inline hover preview (which
// renders within a <p>). `max` limits how many tags show; omit to show all.
// `variant="plain"` drops the pill chrome for tight spaces like the preview.
// Pass `onNavigate` to make each tag a link to its /til/tags/<tag> page (SPA nav);
// omit it for static, decorative tags (e.g. inside the hover preview).
const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
};

function tagHref(tag) {
  return `/til/tags/${encodeURIComponent(tag)}`;
}

export function TagList({
  tags,
  max,
  size = "sm",
  variant = "pill",
  className = "",
  onNavigate,
}) {
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

  const pillClass = `rounded-full border border-border bg-secondary/50 font-medium text-muted-foreground ${SIZES[size]}`;
  const go = onNavigate ? navHandler(onNavigate) : null;

  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {shown.map((tag) =>
        go ? (
          <a
            key={tag}
            href={tagHref(tag)}
            onClick={go(tagHref(tag))}
            className={`${pillClass} transition-colors duration-200 hover:border-primary hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            #{tag}
          </a>
        ) : (
          <span key={tag} className={pillClass}>
            #{tag}
          </span>
        )
      )}
    </span>
  );
}
