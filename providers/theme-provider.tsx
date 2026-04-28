"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { useCallback, useEffect } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

/** Duration must match --theme-transition-duration in globals.css */
const TRANSITION_DURATION_MS = 320;

export type ToggleOrigin = { x: number; y: number };

type AppThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setTheme: (nextTheme: Theme) => void;
  toggleTheme: (origin?: ToggleOrigin) => void;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Remove the no-transition guard after first paint so hydration never flashes
  useEffect(() => {
    const root = document.documentElement;
    // Small rAF delay ensures the browser has painted before we allow transitions
    const raf = requestAnimationFrame(() => {
      root.classList.remove("no-theme-init");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="thinkit-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const currentTheme = (theme ?? "light") as Theme;
  const currentResolved = (resolvedTheme ?? theme ?? "light") as ResolvedTheme;

  /**
   * Perform a theme switch with a circular ripple that expands
   * from `origin` (button centre in viewport px).
   * Falls back to an instant switch on browsers without View Transition API.
   */
  const toggleTheme = useCallback(
    (origin?: ToggleOrigin) => {
      const nextTheme: Theme = currentResolved === "dark" ? "light" : "dark";

      if (typeof document === "undefined") {
        setTheme(nextTheme);
        return;
      }

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // ── Fallback: CSS global transition via theme-transitioning class ──
      if (!document.startViewTransition || prefersReduced) {
        if (!prefersReduced) {
          const root = document.documentElement;
          root.classList.add("theme-transitioning");
          setTheme(nextTheme);
          setTimeout(() => root.classList.remove("theme-transitioning"), TRANSITION_DURATION_MS);
        } else {
          setTheme(nextTheme);
        }
        return;
      }

      // Capture origin point (default: centre of viewport)
      const cx = origin?.x ?? window.innerWidth / 2;
      const cy = origin?.y ?? window.innerHeight / 2;

      // Largest possible radius: corner furthest from origin
      const dx = Math.max(cx, window.innerWidth - cx);
      const dy = Math.max(cy, window.innerHeight - cy);
      const maxRadius = Math.ceil(Math.hypot(dx, dy));

      // Expose CSS custom properties used by the ::view-transition rules
      document.documentElement.style.setProperty("--vt-cx", `${cx}px`);
      document.documentElement.style.setProperty("--vt-cy", `${cy}px`);
      document.documentElement.style.setProperty("--vt-r", `${maxRadius}px`);

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
      });

      // Clean up custom props once the animation finishes
      transition.finished.finally(() => {
        document.documentElement.style.removeProperty("--vt-cx");
        document.documentElement.style.removeProperty("--vt-cy");
        document.documentElement.style.removeProperty("--vt-r");
      });
    },
    [currentResolved, setTheme],
  );

  const setAnimatedTheme = useCallback(
    (nextTheme: Theme) => {
      if (
        typeof document === "undefined" ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setTheme(nextTheme);
        return;
      }
      document.startViewTransition(() => setTheme(nextTheme));
    },
    [setTheme],
  );

  return {
    theme: currentTheme,
    resolvedTheme: currentResolved,
    isDark: currentResolved === "dark",
    setTheme: setAnimatedTheme,
    toggleTheme,
  } as AppThemeContextValue;
}
