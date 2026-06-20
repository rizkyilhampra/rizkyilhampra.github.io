export function InteractiveCard({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`group relative block rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function GradientIcon({ children }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-primary transition-colors duration-300 group-hover:border-primary">
      {children}
    </div>
  );
}
