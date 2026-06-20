import { ThemeToggle } from "./ThemeToggle";
import { navHandler } from "./utils";

// Top bar shared by every page. The wordmark is a shell prompt — the site's
// signature — and the links do SPA navigation when an onNavigate handler is
// provided, falling back to a normal anchor (handled by the GH Pages shim).
export function SiteNav({ onNavigate }) {
  const go = onNavigate ? navHandler(onNavigate) : () => undefined;

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <a
          href="/"
          onClick={go("/")}
          aria-label="Home"
          className="rounded-sm font-mono text-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          ~/rizky
          <span
            className="ml-px text-primary animate-cursor-blink motion-reduce:animate-none"
            aria-hidden="true"
          >
            ▌
          </span>
        </a>

        <div className="flex items-center gap-5 text-sm">
          <a href="/til" onClick={go("/til")} className={navLinkClass}>
            TIL
          </a>
          <a href="/til/tags" onClick={go("/til/tags")} className={navLinkClass}>
            Tags
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

const navLinkClass =
  "rounded-sm text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";
