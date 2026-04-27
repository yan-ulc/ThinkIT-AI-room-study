"use client";

import { useTheme } from "@/providers/theme-provider";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        className ??
        "relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground"
      }
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun
        size={14}
        className={`absolute transition-opacity duration-200 ease-out ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />
      <Moon
        size={14}
        className={`absolute transition-opacity duration-200 ease-out ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />
    </button>
  );
}
