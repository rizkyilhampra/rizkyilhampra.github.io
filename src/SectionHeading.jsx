// Shared section header: a mono shell-path eyebrow, an Iosevka title, and an
// optional subtitle line. Used by the homepage sections and every stats block
// so the heading treatment stays identical everywhere.
export function SectionHeading({ eyebrow, title, id, children }) {
  return (
    <>
      <p className="mb-5 font-mono text-xs text-primary">{eyebrow}</p>
      <div className="mb-6">
        <h2
          id={id}
          className="font-header text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {title}
        </h2>
        {children ? (
          <p className="mt-2 text-sm text-muted-foreground">{children}</p>
        ) : null}
      </div>
    </>
  );
}
