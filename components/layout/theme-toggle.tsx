"use client";

import { useTheme } from "@/providers/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveIsDark = mounted ? isDark : false;

  function handleClick() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      toggleMode({
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      });
    } else {
      toggleMode();
    }
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      className={
        className ??
        "relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground"
      }
      aria-label="Toggle theme"
      title={effectiveIsDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun — visible in light mode, exits upward+spin when going dark */}
      <span
        className="absolute flex items-center justify-center"
        style={{
          animation: mounted
            ? effectiveIsDark
              ? "icon-exit-up 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards"
              : "icon-enter-down 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : undefined,
        }}
      >
        <Sun size={14} />
      </span>

      {/* Moon — visible in dark mode, exits downward+spin when going light */}
      <span
        className="absolute flex items-center justify-center"
        style={{
          animation: mounted
            ? effectiveIsDark
              ? "icon-enter-up 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              : "icon-exit-down 280ms cubic-bezier(0.4, 0, 0.2, 1) forwards"
            : undefined,
          opacity: 0,
        }}
      >
        <Moon size={14} />
      </span>
    </button>
  );
}
