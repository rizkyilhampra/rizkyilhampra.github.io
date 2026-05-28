import clsx from "clsx";

export default function LinkList({ href, children, className }) {
  return (
    <a
      className={clsx(
        "text-primary underline hover:text-primary/80 transition-colors",
        className
      )}
      href={href}
    >
      {children}
    </a>
  );
}
