import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or default to light
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    
    // Apply theme to document
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-card border border-border" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-glow group"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Sun className="w-5 h-5 text-foreground rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute w-5 h-5 text-foreground rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      </div>
    </button>
  );
};