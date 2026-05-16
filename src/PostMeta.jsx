import { CalendarDays, Clock } from "lucide-react";

export function PostMeta({
  post,
  className = "mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground",
  iconGap = "gap-2",
}) {
  return (
    <div className={className}>
      <span className={`inline-flex items-center ${iconGap}`}>
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <time dateTime={post.date}>{post.date}</time>
      </span>
      <span className={`inline-flex items-center ${iconGap}`}>
        <Clock className="h-4 w-4" aria-hidden="true" />
        {post.readingTime}
      </span>
    </div>
  );
}
