import { ArrowRight, FileText } from "lucide-react";
import { GradientIcon, InteractiveCard } from "./InteractiveCard";
import { PostMeta } from "./PostMeta";

export function LatestPostPreview({ posts, onNavigate }) {
  const handleClick = (event, href) => {
    event.preventDefault();
    onNavigate(href);
  };

  return (
    <section className="mt-16 md:mt-20" aria-labelledby="recent-posts-heading">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            Blog
          </p>
          <h2
            id="recent-posts-heading"
            className="font-header text-2xl font-semibold text-foreground sm:text-3xl"
          >
            Recent posts
          </h2>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {posts.map((post) => {
          const href = `/blog/${post.slug}`;

          return (
            <InteractiveCard
              as="a"
              key={post.slug}
              href={href}
              onClick={(event) => handleClick(event, href)}
              className="min-h-[260px] p-5 sm:p-6"
            >
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex min-w-0 gap-4">
                  <GradientIcon>
                    <FileText
                      className="h-6 w-6 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </GradientIcon>

                  <div className="min-w-0">
                    <h3 className="font-header text-2xl font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {post.description}
                    </p>
                    <PostMeta
                      post={post}
                      className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground sm:text-sm"
                      iconGap="gap-1.5"
                    />
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 group-hover:border-primary group-hover:text-primary">
                  Read post
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </InteractiveCard>
          );
        })}
      </div>
    </section>
  );
}
