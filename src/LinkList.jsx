export default function LinkList({ href, children }) {
  return (
    <a className="text-blue-600 underline hover:text-blue-800" href={href}>
      {children}
    </a>
  );
}
