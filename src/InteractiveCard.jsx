export function InteractiveCard({
  children,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={`group relative block overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:scale-[1.015] hover:bg-secondary/50 hover:shadow-glow outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -z-10 motion-reduce:hidden">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-primary opacity-10 blur-2xl transition-opacity duration-700 group-hover:opacity-25" />
        <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-1/3 translate-y-1/3 rounded-full bg-accent opacity-10 blur-2xl transition-opacity duration-700 group-hover:opacity-20" />
      </div>

      {children}
    </Component>
  );
}

export function GradientIcon({ children }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="absolute inset-0 rounded-lg bg-gradient-primary opacity-40 blur-md transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none" />
      <div className="relative rounded-lg bg-gradient-primary p-3">
        {children}
      </div>
    </div>
  );
}
