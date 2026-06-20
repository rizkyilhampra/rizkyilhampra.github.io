import clsx from "clsx";

export default function LinkList({ href, children, className }) {
  return (
    <a
      className={clsx(
        "underline underline-offset-2 transition-colors hover:text-primary",
        className
      )}
      href={href}
    >
      {children}
    </a>
  );
}
