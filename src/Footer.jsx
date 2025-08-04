import LinkList from "./LinkList";

export default function Footer() {
  const links = [
    {
      href: "https://github.com/rizkyilhampra/rizkyilhampra.github.io",
      children: "rizkyilhampra.github.io",
    },
    {
      href: "https://farmfe.org",
      children: "FarmFE",
    },
    {
      href: "https://bun.sh",
      children: "Bun",
    },
    {
      href: "https://tailwindcss.com/",
      children: "TailwindCSS",
    },
    {
      href: "https://react.dev/",
      children: "React",
    },
    {
      href: "https://pages.github.com/",
      children: "Github Pages",
    },
  ];

  return (
    <div className="text-muted-foreground text-sm space-y-2">
      <p>© {new Date().getFullYear()} Rizky Ilham Pratama</p>
      <p className="flex items-center justify-center space-x-2 text-xs">
        <span>Built with</span>
        <LinkList href={links[1].href}>{links[1].children}</LinkList>
        <span>•</span>
        <LinkList href={links[4].href}>{links[4].children}</LinkList>
        <span>•</span>
        <LinkList href={links[3].href}>{links[3].children}</LinkList>
      </p>
    </div>
  );
}
