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
    <footer className="text-muted-foreground text-sm space-y-3">
      <div className="text-center">
        <p>© {new Date().getFullYear()} Rizky Ilham Pratama</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>Built with</span>
          {techStack.map((tech, index) => (
            <Fragment key={tech.name}>
              <LinkList href={tech.href}>{tech.name}</LinkList>
              {index < techStack.length - 1 && (
                <span className="text-muted-foreground/50">•</span>
              )}
            </Fragment>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-muted-foreground/50">•</span>
          <span>hosted on</span>
          <LinkList href={hosting.href}>{hosting.name}</LinkList>
        </div>
      </div>
      
      <div className="text-center">
        <LinkList href={sourceRepo.href} className="text-xs">
          {sourceRepo.name}
        </LinkList>
      </div>
    </footer>
  );
}
