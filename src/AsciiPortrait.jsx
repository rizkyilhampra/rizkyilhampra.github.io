// The home hero's ASCII portrait: rizky-college.jpg rendered through img2art.
// The colored braille grid is baked into asciiPortrait.json by
// scripts/generate-ascii.mjs as two glyph variants — "dark" (img2art's raw
// output, for the dark theme) and "light" (braille-inverted so dark areas
// read as ink on the light paper theme). Rendering here is just spans over
// the runs; both variants are transparent over the site background.
import portrait from "./asciiPortrait.json";

function BrailleGrid({ lines }) {
  return (
    <pre
      className="m-0 bg-transparent text-[7px] leading-[1.15] sm:text-[8px]"
      style={{
        fontFamily: "'Iosevka Braille', monospace",
        padding: "0.5rem",
        whiteSpace: "pre",
      }}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {line.map((run, j) => (
            <span key={j} style={{ color: run.c }}>
              {run.t}
            </span>
          ))}
          {i < lines.length - 1 ? "\n" : ""}
        </span>
      ))}
    </pre>
  );
}

export default function AsciiPortrait({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto w-fit shrink-0 overflow-hidden rounded-md border border-border md:mx-0 ${className}`}
    >
      <div className="hidden dark:block">
        <BrailleGrid lines={portrait.dark} />
      </div>
      <div className="block dark:hidden">
        <BrailleGrid lines={portrait.light} />
      </div>
    </div>
  );
}
