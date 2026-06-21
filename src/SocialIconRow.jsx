// Compact inline row of icon-only links, AstroPaper "Social Links:" style.
// Used in the hero and the footer.
export function SocialIconRow({ items, trailing = null, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <ul className="flex flex-wrap items-center gap-1">
        {items.map(({ href, icon: Icon, label: itemLabel, ariaLabel, title }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel || itemLabel}
              title={title || ariaLabel || itemLabel}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              <span className="sr-only">{itemLabel}</span>
            </a>
          </li>
        ))}
      </ul>
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}
