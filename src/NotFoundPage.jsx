import { InternalBackLink } from "./InternalBackLink";
import { PageShell } from "./PageShell";
import { createReveal } from "./entrance";

export function NotFoundPage({
  onBack,
  skipEntranceAnimation = false,
  code = "404",
  title = "Page not found",
  message = "The page you opened does not exist on this site.",
}) {
  const reveal = createReveal(skipEntranceAnimation);

  return (
    <PageShell mainClassName="mx-auto flex max-w-3xl items-center justify-center px-6 py-24 sm:py-32">
      <section className="max-w-xl text-center">
        <p {...reveal(0, "mb-4 font-mono text-xs text-primary")}>~/{code}</p>
        <h1 {...reveal(1, "font-header text-4xl font-semibold text-foreground sm:text-5xl")}>
          {title}
        </h1>
        <p {...reveal(2, "mt-5 text-base leading-7 text-muted-foreground")}>
          {message}
        </p>
        <InternalBackLink onBack={onBack} {...reveal(3, "mt-8")} />
      </section>
    </PageShell>
  );
}
