import { ArrowUpRight } from "lucide-react";

// Flat list of links (title + description rows), AstroPaper-style. Replaces the
// old glowing card grid. Used for the homepage "projects" section.
export function ProjectList({ items }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <li key={item.href}>
          <ProjectRow {...item} />
        </li>
      ))}
    </ul>
  );
}

function ProjectRow({ href, icon: Icon, label, description, ariaLabel, title }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel || label}
      title={title || ariaLabel || label}
      className="group flex items-start gap-3 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {Icon ? (
        <Icon
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      ) : null}
      <div className="min-w-0">
        <span className="font-header text-lg font-semibold leading-snug text-foreground underline-offset-4 transition-colors group-hover:text-primary group-hover:underline">
          {label}
        </span>
        <ArrowUpRight
          className="ml-0.5 inline-block h-3.5 w-3.5 -translate-y-px text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary group-focus-visible:opacity-100 group-focus-visible:text-primary motion-reduce:transition-none"
          aria-hidden="true"
        />
        {description ? (
          <p className="mt-0.5 text-sm leading-6 text-muted-foreground [hyphens:none]">
            {description}
          </p>
        ) : null}
      </div>
      <span className="sr-only">Opens in new tab</span>
    </a>
  );
}
