import { FloatingElements } from "./FloatingElements";
import { ThemeToggle } from "./ThemeToggle";

export function PageShell({
  children,
  mainClassName = "relative z-10 container mx-auto px-6 py-20",
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingElements />

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <main className={mainClassName}>{children}</main>
    </div>
  );
}
