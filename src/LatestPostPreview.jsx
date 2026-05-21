import { ArrowRight, FileText } from "lucide-react";
import { Suspense, use } from "react";
import { GradientIcon, InteractiveCard } from "./InteractiveCard";
import { PostMeta } from "./PostMeta";
import { loadPostBySlug } from "./blogPosts";

function PostPreviewCard({ post, onNavigate }) {
  const loadedPost = use(loadPostBySlug(post.slug));
  const href = `/blog/${post.slug}`;

  const handleClick = (event) => {
    event.preventDefault();
    onNavigate(href);
  };

  return (
    <InteractiveCard
      as="a"
      href={href}
      onClick={handleClick}
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
              {loadedPost.description}
            </p>
            <PostMeta
              post={{ ...post, readingTime: loadedPost.readingTime }}
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
}

function PostPreviewSkeleton() {
  return (
    <div className="min-h-[260px] animate-pulse rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="flex min-w-0 gap-4">
          <div className="h-11 w-11 shrink-0 rounded-lg bg-secondary/60" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-3/4 rounded-md bg-secondary/60" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-md bg-secondary/60" />
              <div className="h-4 w-5/6 rounded-md bg-secondary/60" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-3 w-20 rounded-md bg-secondary/60" />
              <div className="h-3 w-16 rounded-md bg-secondary/60" />
            </div>
          </div>
        </div>
        <div className="h-9 w-28 rounded-lg bg-secondary/60" />
      </div>
    </div>
  );
}

export function LatestPostPreview({ posts, onNavigate }) {
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
        {posts.map((post) => (
          <Suspense key={post.slug} fallback={<PostPreviewSkeleton />}>
            <PostPreviewCard post={post} onNavigate={onNavigate} />
          </Suspense>
        ))}
      </div>
    </section>
  );
}
