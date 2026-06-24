import { SiteNav } from "./SiteNav";
import { GraphModalProvider } from "./GraphModalContext";

export function PageShell({
  children,
  onNavigate,
  mainClassName = "mx-auto max-w-3xl px-6 py-12 sm:py-16",
}) {
  return (
    <GraphModalProvider onNavigate={onNavigate}>
      <div className="min-h-screen bg-background">
        <SiteNav onNavigate={onNavigate} />
        <main className={mainClassName}>{children}</main>
      </div>
    </GraphModalProvider>
  );
}
