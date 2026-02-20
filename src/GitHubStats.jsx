import { useState, useEffect } from "react";
import { GitHubCalendar } from "react-github-calendar";

const catppuccinTheme = {
  light: ["#e6e9ef", "#c5a0e4", "#a374d5", "#8148c4", "#6c3fa3"],
  dark: ["#313244", "#4a3780", "#7047b0", "#9065d8", "#cba6f7"],
};

export default function GitHubStats() {
  const [colorScheme, setColorScheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setColorScheme(saved === "dark" ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setColorScheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="github-stats-title" className="mt-16 md:mt-20">
      <div className="text-center mb-8">
        <h2
          id="github-stats-title"
          className="text-3xl md:text-4xl font-header font-semibold tracking-tight mb-2"
        >
          GitHub Activity
        </h2>
        <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full mb-4" />
        <p className="text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://github.com/rizkyilhampra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub
          </a>
        </p>
      </div>
      <div className="p-4 sm:p-6 bg-card border border-border rounded-lg overflow-x-auto">
        <GitHubCalendar
          username="rizkyilhampra"
          colorScheme={colorScheme}
          theme={catppuccinTheme}
          year="last"
          showColorLegend
        />
      </div>
    </section>
  );
}
