import { Fragment } from "react";
import LinkList from "./LinkList";

export default function Footer() {
  const techStack = [
    { href: "https://farmfe.org", name: "FarmFE" },
    { href: "https://react.dev/", name: "React" },
    { href: "https://bun.sh", name: "Bun" },
    { href: "https://tailwindcss.com/", name: "TailwindCSS" }
  ];

  const sourceRepo = {
    href: "https://github.com/rizkyilhampra/rizkyilhampra.github.io",
    name: "View Source"
  };

  const hosting = {
    href: "https://pages.github.com/",
    name: "GitHub Pages"
  };

  return (
    <footer className="space-y-2 text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Rizky Ilham Pratama</p>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span>Built with</span>
        {techStack.map((tech, index) => (
          <Fragment key={tech.name}>
            <LinkList href={tech.href}>{tech.name}</LinkList>
            {index < techStack.length - 1 && (
              <span className="text-muted-foreground/50">·</span>
            )}
          </Fragment>
        ))}
        <span className="text-muted-foreground/50">·</span>
        <span>hosted on</span>
        <LinkList href={hosting.href}>{hosting.name}</LinkList>
        <span className="text-muted-foreground/50">·</span>
        <LinkList href={sourceRepo.href}>{sourceRepo.name}</LinkList>
      </div>
    </footer>
  );
}
