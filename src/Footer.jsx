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
    <footer className="mt-16 text-xs lg:text-sm xl:text-[1rem] text-text text-center">
      <span>
        © {new Date().getFullYear()}{" "}
        <LinkList href={links[0].href}>{links[0].children}</LinkList>
      </span>
      <div>
        Built with{" "}
        {links.slice(1).map((link, index, array) => (
          <span key={index}>
            {index === array.length - 1 && "and served by "}
            <LinkList href={link.href}>{link.children}</LinkList>
            {index < array.length - 1 && ", "}
          </span>
        ))}
      </div>
    </footer>
  );
}
