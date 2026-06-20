import { ArrowRight, Lightbulb } from "lucide-react";
import { GradientIcon, InteractiveCard } from "./InteractiveCard";
import { TagList } from "./TagList";
import { prefetchTilNotePage } from "./tilNotePageLoader";

export function TilCard({ note, onNavigate, showDate = false }) {
  const href = `/til/${note.slug}`;

  const handleClick = (event) => {
    event.preventDefault();
    onNavigate(href);
  };

  return (
    <InteractiveCard
      as="a"
      href={href}
      onClick={handleClick}
      onMouseEnter={prefetchTilNotePage}
      onFocus={prefetchTilNotePage}
      onTouchStart={prefetchTilNotePage}
      className="min-h-[220px] p-5 sm:p-6"
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="flex min-w-0 gap-4">
          <GradientIcon>
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </GradientIcon>

          <div className="min-w-0">
            <h3 className="font-header text-xl font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
              {note.title}
            </h3>
            {showDate && note.date ? (
              <p className="mt-1 text-xs text-muted-foreground">{note.date}</p>
            ) : null}
            {note.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {note.description}
              </p>
            ) : null}
            <TagList tags={note.tags} max={3} className="mt-3" />
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
          Read note
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:transform-none"
            aria-hidden="true"
          />
        </span>
      </div>
    </InteractiveCard>
  );
}
