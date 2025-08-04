export default function LinkList({ href, children }) {
  return (
    <a className="text-primary underline hover:text-primary/80 transition-colors" href={href}>
      {children}
    </a>
  );
}
