export default function App() {
  return (
    <div
      className="flex min-h-screen flex-col items-center bg-base p-6 font-sans
        antialiased sm:justify-center sm:p-0"
    >
      <main className="">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold  text-subtext0">
          Rizky Ilham Pratama
        </h1>

        <ul class="list-inside list-disc  pt-2 font-medium text-subtext1  lg:text-xl ">
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://spdhtc.rizkyilhampra.me"
            >
              spdhtc.rizkyilhampra.me
            </a>
          </li>
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://rizkyilhampra.hashnode.dev"
              target="_blank"
            >
              rizkyilhampra.hashnode.dev
            </a>{" "}
            <span className="font-normal">
              (<i>where i wrote some blog post</i>)
            </span>
          </li>
          <li>
            <a
              href="https://github.com/rizkyilhampra"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >
              github.com/rizkyilhampra
            </a>
          </li>
          <li>
            <a
              className="text-blue-600 underline hover:text-blue-800"
              href="https://instagram.com/rizkyilhampra"
              target="_blank"
            >
              instagram.com/rizkyilhampra
            </a>
          </li>
          <li>
            <a
              href="https://x.com/rizkyilhampra"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >
              x.com/rizkyilhampra
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/rizkyilhampra"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >
              linkedin.com/in/rizkyilhampra
            </a>
          </li>
        </ul>
      </main>

      <footer className="mt-16 text-xs lg:text-sm xl:text-[1rem]  text-text  text-center">
        <span>
          © {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/rizkyilhampra/rizkyilhampra.github.io"
            target="_blank"
            className="text-blue-600 underline hover:text-blue-800"
          >
            rizkyilhampra.github.io
          </a>
        </span>
        <span className="block">
          Built with{" "}
          <a
            href="https://www.farmfe.org/"
            className="underline text-blue-600 hover:text-blue-800"
            target="_blank"
          >
            Farm
          </a>
          ,{" "}
          <a
            href="https://bun.sh"
            className="underline text-blue-600 hover:text-blue-800"
            target="_blank"
          >
            Bun
          </a>
          ,{" "}
          <a
            href="https://tailwindcss.com/"
            className="underline text-blue-600 hover:text-blue-800"
            target="_blank"
          >
            TailwindCSS
          </a>
          ,{" "}
          <a
            href="https://react.dev/"
            className="underline text-blue-600 hover:text-blue-800"
            target="_blank"
          >
            <s>React</s>
          </a>
          , and served by{" "}
          <a
            href="https://pages.github.com/"
            className="underline text-blue-600 hover:text-blue-800"
          >
            Github Pages
          </a>
        </span>
      </footer>
    </div>
  );
}
