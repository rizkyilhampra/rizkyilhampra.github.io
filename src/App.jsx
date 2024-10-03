import Footer from "./Footer";
import LinkList from "./LinkList";

export default function App() {
  const links = [
    {
      href: "https://spdhtc.rizkyilhampra.me",
      children: "spdhtc.rizkyilhampra.me",
    },
    {
      href: "https://blog.rizkyilhampra.me",
      children: "blog.rizkyilhampra.me",
    },
    {
      href: "https://github.com/rizkyilhampra",
      children: "github.com/rizkyilhampra",
    },
    {
      href: "https://instagram.com/rizkyilhampra",
      children: "instagram.com/rizkyilhampra",
    },
    {
      href: "https://x.com/rizkyilhampra",
      children: "x.com/rizkyilhampra",
    },
    {
      href: "https://www.linkedin.com/in/rizkyilhampra",
      children: "linkedin.com/in/rizkyilhampra",
    },
  ];

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-base p-6 font-sans
        antialiased sm:justify-center sm:p-0"
    >
      <main className="">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold  text-subtext0">
          Rizky Ilham Pratama
        </h1>

        <ul className="list-inside list-disc  pt-2 font-medium text-subtext1 lg:text-xl ">
          {links.map((link, index) => (
            <li key={index}>
              <LinkList href={link.href}>{link.children}</LinkList>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
